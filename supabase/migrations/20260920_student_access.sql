-- Phase 2: student access is backed by a separate anonymous Supabase identity.
-- Enable Anonymous Sign-Ins in Supabase Auth before using the student entry screen.
create extension if not exists pgcrypto;

-- Anonymous student identities must never be provisioned as guardians.
create or replace function public.handle_new_responsible()
returns trigger language plpgsql security definer set search_path = '' as $$
declare display_name text;
begin
  if new.is_anonymous then return new; end if;
  display_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Responsável');
  insert into public.responsible_profiles(id, full_name)
  values (new.id, display_name) on conflict (id) do nothing;
  return new;
end;
$$;

create table if not exists public.student_credentials (
  profile_id uuid primary key references public.tea_profiles(id) on delete cascade,
  access_code text not null unique,
  pin_hash text not null,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.student_sessions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile_id uuid not null references public.tea_profiles(id) on delete cascade,
  expires_at timestamptz not null
);
create index if not exists student_sessions_profile_idx on public.student_sessions(profile_id);
alter table public.student_credentials enable row level security;
alter table public.student_sessions enable row level security;

-- These private tables have no client policies. Only narrowly scoped RPCs access them.
revoke all on public.student_credentials, public.student_sessions from anon, authenticated;

-- pgcrypto can live in either public or extensions on existing Supabase projects.
create or replace function public.student_pin_hash(p_pin text, p_existing_hash text default null)
returns text language plpgsql security invoker set search_path = '' as $$
declare v_schema text; v_result text;
begin
  select n.nspname into v_schema from pg_catalog.pg_extension e
    join pg_catalog.pg_namespace n on n.oid = e.extnamespace where e.extname = 'pgcrypto';
  if v_schema is null then raise exception 'pgcrypto is required'; end if;
  if p_existing_hash is null then
    execute format('select %I.crypt($1, %I.gen_salt(''bf'', 10))', v_schema, v_schema)
      into v_result using p_pin;
  else
    execute format('select %I.crypt($1, $2)', v_schema)
      into v_result using p_pin, p_existing_hash;
  end if;
  return v_result;
end;
$$;
revoke all on function public.student_pin_hash(text, text) from public, anon, authenticated;

create or replace function public.student_has_access(p_profile_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
    and exists (select 1 from public.student_sessions s
      where s.user_id = auth.uid() and s.profile_id = p_profile_id
        and s.expires_at > now());
$$;
revoke all on function public.student_has_access(uuid) from public, anon;
grant execute on function public.student_has_access(uuid) to authenticated;

drop policy if exists "Student reads linked profile" on public.tea_profiles;
create policy "Student reads linked profile" on public.tea_profiles for select to authenticated
  using (public.student_has_access(id));

create or replace function public.configure_student_access(p_profile_id uuid, p_pin text)
returns text language plpgsql security definer set search_path = '' as $$
declare v_code text;
begin
  if auth.uid() is null or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
     or not exists (select 1 from public.tea_profiles p
       where p.id = p_profile_id and p.responsible_id = auth.uid()) then
    raise exception 'Acesso negado';
  end if;
  if p_pin !~ '^[0-9]{6}$' then raise exception 'O PIN deve conter seis dígitos'; end if;
  select access_code into v_code from public.student_credentials where profile_id = p_profile_id;
  if v_code is null then v_code := upper(left(replace(gen_random_uuid()::text, '-', ''), 12)); end if;
  insert into public.student_credentials(profile_id, access_code, pin_hash)
    values (p_profile_id, v_code, public.student_pin_hash(p_pin))
    on conflict (profile_id) do update set pin_hash = excluded.pin_hash,
      failed_attempts = 0, locked_until = null;
  delete from public.student_sessions where profile_id = p_profile_id;
  return v_code;
end;
$$;

create or replace function public.get_student_access_code(p_profile_id uuid)
returns text language sql stable security definer set search_path = '' as $$
  select c.access_code from public.student_credentials c
  join public.tea_profiles p on p.id = c.profile_id
  where p.id = p_profile_id and p.responsible_id = auth.uid()
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false);
$$;

create or replace function public.redeem_student_access(p_code text, p_pin text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_credential public.student_credentials%rowtype;
begin
  if auth.uid() is null or not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'Acesso negado';
  end if;
  if p_code !~ '^[a-fA-F0-9]{12}$' or p_pin !~ '^[0-9]{6}$' then
    raise exception 'Código ou PIN incorreto';
  end if;
  select * into v_credential from public.student_credentials
    where access_code = upper(p_code) for update;
  if not found then raise exception 'Código ou PIN incorreto'; end if;
  if v_credential.locked_until > now() then
    raise exception 'Muitas tentativas. Tente novamente mais tarde';
  end if;
  if v_credential.pin_hash <> public.student_pin_hash(p_pin, v_credential.pin_hash) then
    update public.student_credentials set failed_attempts = failed_attempts + 1,
      locked_until = case when failed_attempts + 1 >= 5 then now() + interval '15 minutes'
        else null end
      where profile_id = v_credential.profile_id;
    -- A returned error would roll back the attempt counter: return null instead.
    return null;
  end if;
  update public.student_credentials set failed_attempts = 0, locked_until = null
    where profile_id = v_credential.profile_id;
  insert into public.student_sessions(user_id, profile_id, expires_at)
    values (auth.uid(), v_credential.profile_id, now() + interval '12 hours')
    on conflict (user_id) do update set profile_id = excluded.profile_id,
      expires_at = excluded.expires_at;
  return v_credential.profile_id;
end;
$$;

create or replace function public.current_student_profile_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select s.profile_id from public.student_sessions s
  where s.user_id = auth.uid() and s.expires_at > now()
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false);
$$;

create or replace function public.revoke_student_access()
returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from public.student_sessions where user_id = auth.uid();
end;
$$;

revoke all on function public.configure_student_access(uuid, text),
  public.get_student_access_code(uuid), public.redeem_student_access(text, text),
  public.current_student_profile_id(), public.revoke_student_access() from public, anon;
grant execute on function public.configure_student_access(uuid, text),
  public.get_student_access_code(uuid), public.redeem_student_access(text, text),
  public.current_student_profile_id(), public.revoke_student_access() to authenticated;
