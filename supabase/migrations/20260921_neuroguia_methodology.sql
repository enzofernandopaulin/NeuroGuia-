-- NeuroGuia: rotina persistente, apoio, previsibilidade e rede de tutores.
-- Requer a migration anterior de acesso estudantil (student_sessions e
-- current_student_profile_id()).

create extension if not exists pgcrypto;

create table if not exists public.routine_tasks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.tea_profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  task_time time,
  scheduled_date date not null default current_date,
  category text not null default 'Rotina',
  steps jsonb not null default '[]'::jsonb check (jsonb_typeof(steps) = 'array'),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.routine_tasks add column if not exists scheduled_date date not null default current_date;
alter table public.routine_tasks add column if not exists steps jsonb not null default '[]'::jsonb;
alter table public.routine_tasks add column if not exists completed boolean not null default false;
alter table public.routine_tasks add column if not exists updated_at timestamptz not null default now();

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.tea_profiles(id) on delete cascade,
  task_id uuid references public.routine_tasks(id) on delete set null,
  kind text not null check (kind in ('ajuda', 'nao-entendi', 'me-perdi')),
  message text not null default '',
  status text not null default 'pendente' check (status in ('pendente', 'visualizado', 'resolvido')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.routine_change_notices (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.tea_profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 140),
  description text not null default '',
  effective_at timestamptz not null,
  acknowledged boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.tutor_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.tea_profiles(id) on delete cascade,
  tutor_email text not null check (tutor_email = lower(tutor_email)),
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, tutor_email)
);

create index if not exists routine_tasks_profile_date_idx on public.routine_tasks(profile_id, scheduled_date, task_time);
create index if not exists support_requests_profile_status_idx on public.support_requests(profile_id, status, created_at desc);
create index if not exists routine_changes_profile_date_idx on public.routine_change_notices(profile_id, effective_at);
create index if not exists tutor_links_email_idx on public.tutor_links(tutor_email);

create or replace function public.is_profile_owner(p_profile_id uuid)
returns boolean language sql stable security definer set search_path = public set row_security = off
as $$ select exists (select 1 from public.tea_profiles p where p.id = p_profile_id and p.responsible_id = auth.uid()) $$;

create or replace function public.is_profile_tutor(p_profile_id uuid)
returns boolean language sql stable security definer set search_path = public set row_security = off
as $$ select exists (select 1 from public.tutor_links t where t.profile_id = p_profile_id and t.tutor_email = lower(auth.jwt() ->> 'email')) $$;

revoke all on function public.is_profile_owner(uuid), public.is_profile_tutor(uuid) from public;
grant execute on function public.is_profile_owner(uuid), public.is_profile_tutor(uuid) to authenticated;

alter table public.routine_tasks enable row level security;
alter table public.support_requests enable row level security;
alter table public.routine_change_notices enable row level security;
alter table public.tutor_links enable row level security;

drop policy if exists tea_profiles_student_read on public.tea_profiles;
create policy tea_profiles_student_read on public.tea_profiles for select to authenticated
using (id = public.current_student_profile_id());

drop policy if exists tasks_responsible_all on public.routine_tasks;
create policy tasks_responsible_all on public.routine_tasks for all to authenticated
using (public.is_profile_owner(profile_id))
with check (public.is_profile_owner(profile_id));

drop policy if exists tasks_student_read on public.routine_tasks;
create policy tasks_student_read on public.routine_tasks for select to authenticated
using (profile_id = public.current_student_profile_id());
drop policy if exists tasks_student_update on public.routine_tasks;
create policy tasks_student_update on public.routine_tasks for update to authenticated
using (profile_id = public.current_student_profile_id())
with check (profile_id = public.current_student_profile_id());

drop policy if exists tasks_tutor_read on public.routine_tasks;
create policy tasks_tutor_read on public.routine_tasks for select to authenticated
using (public.is_profile_tutor(profile_id));

drop policy if exists requests_student_insert on public.support_requests;
create policy requests_student_insert on public.support_requests for insert to authenticated
with check (profile_id = public.current_student_profile_id());
drop policy if exists requests_responsible_all on public.support_requests;
create policy requests_responsible_all on public.support_requests for all to authenticated
using (public.is_profile_owner(profile_id))
with check (public.is_profile_owner(profile_id));
drop policy if exists requests_tutor_read on public.support_requests;
create policy requests_tutor_read on public.support_requests for select to authenticated
using (public.is_profile_tutor(profile_id));

drop policy if exists changes_responsible_all on public.routine_change_notices;
create policy changes_responsible_all on public.routine_change_notices for all to authenticated
using (public.is_profile_owner(profile_id))
with check (public.is_profile_owner(profile_id));
drop policy if exists changes_student_read on public.routine_change_notices;
create policy changes_student_read on public.routine_change_notices for select to authenticated
using (profile_id = public.current_student_profile_id());
drop policy if exists changes_student_update on public.routine_change_notices;
create policy changes_student_update on public.routine_change_notices for update to authenticated
using (profile_id = public.current_student_profile_id())
with check (profile_id = public.current_student_profile_id());

drop policy if exists tutor_links_responsible_all on public.tutor_links;
create policy tutor_links_responsible_all on public.tutor_links for all to authenticated
using (public.is_profile_owner(profile_id))
with check (public.is_profile_owner(profile_id));
drop policy if exists tutor_links_tutor_read on public.tutor_links;
create policy tutor_links_tutor_read on public.tutor_links for select to authenticated
using (tutor_email = lower(auth.jwt() ->> 'email'));

drop policy if exists tea_profiles_tutor_read on public.tea_profiles;
create policy tea_profiles_tutor_read on public.tea_profiles for select to authenticated
using (public.is_profile_tutor(id));

grant select, insert, update, delete on public.routine_tasks to authenticated;
grant select, insert, update on public.support_requests to authenticated;
grant select, insert, update, delete on public.routine_change_notices to authenticated;
grant select, insert, update, delete on public.tutor_links to authenticated;
