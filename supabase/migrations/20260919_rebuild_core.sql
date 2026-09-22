-- NeuroGuia - reconstrução do núcleo do MVP
-- Escopo: conta do responsável + perfil adaptativo do estudante com TEA.

create extension if not exists pgcrypto;

-- Remove a automação antiga, que apontava para a tabela removida `responsaveis`.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.criar_responsavel_automaticamente();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.responsible_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 1 and 100),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.responsible_profiles enable row level security;

drop policy if exists "Responsible reads own profile" on public.responsible_profiles;
create policy "Responsible reads own profile"
  on public.responsible_profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Responsible updates own profile" on public.responsible_profiles;
create policy "Responsible updates own profile"
  on public.responsible_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_responsible()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  display_name text;
begin
  display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Responsável'
  );

  insert into public.responsible_profiles (id, full_name)
  values (new.id, display_name)
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_responsible();

-- Garante um perfil para contas que já existiam antes desta reconstrução.
insert into public.responsible_profiles (id, full_name)
select
  id,
  coalesce(
    nullif(trim(raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(email, ''), '@', 1), ''),
    'Responsável'
  )
from auth.users
on conflict (id) do nothing;

drop trigger if exists set_responsible_profiles_updated_at on public.responsible_profiles;
create trigger set_responsible_profiles_updated_at
before update on public.responsible_profiles
for each row execute function public.set_updated_at();

create table if not exists public.tea_profiles (
  id uuid primary key default gen_random_uuid(),
  responsible_id uuid not null references public.responsible_profiles(id) on delete cascade,

  name text not null check (char_length(trim(name)) between 1 and 80),
  avatar_url text,
  age_group text not null
    check (age_group in ('crianca', 'adolescente', 'adulto')),
  support_level text not null default 'nao-informado'
    check (support_level in ('nivel-1', 'nivel-2', 'nivel-3', 'nao-informado')),
  communication_preference text not null default 'texto-imagem'
    check (communication_preference in ('texto', 'imagem', 'texto-imagem', 'audio', 'nao-sei')),
  autonomy text not null default 'alguns-lembretes'
    check (autonomy in (
      'alguns-lembretes',
      'orientacao-etapas',
      'orientacao-frequente',
      'acompanhamento-total'
    )),
  sensory_triggers text[] not null default '{}',
  routine_change_difficulty text not null default 'as-vezes'
    check (routine_change_difficulty in ('nao', 'as-vezes', 'frequentemente')),

  soft_visual_mode boolean not null default false,
  step_by_step boolean not null default true,
  help_button boolean not null default true,
  routine_change_warning boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tea_profiles_responsible_id_idx
  on public.tea_profiles(responsible_id);

alter table public.tea_profiles enable row level security;

drop policy if exists "Responsible reads own TEA profiles" on public.tea_profiles;
create policy "Responsible reads own TEA profiles"
  on public.tea_profiles
  for select
  to authenticated
  using (auth.uid() = responsible_id);

drop policy if exists "Responsible creates own TEA profiles" on public.tea_profiles;
create policy "Responsible creates own TEA profiles"
  on public.tea_profiles
  for insert
  to authenticated
  with check (auth.uid() = responsible_id);

drop policy if exists "Responsible updates own TEA profiles" on public.tea_profiles;
create policy "Responsible updates own TEA profiles"
  on public.tea_profiles
  for update
  to authenticated
  using (auth.uid() = responsible_id)
  with check (auth.uid() = responsible_id);

drop policy if exists "Responsible deletes own TEA profiles" on public.tea_profiles;
create policy "Responsible deletes own TEA profiles"
  on public.tea_profiles
  for delete
  to authenticated
  using (auth.uid() = responsible_id);

drop trigger if exists set_tea_profiles_updated_at on public.tea_profiles;
create trigger set_tea_profiles_updated_at
before update on public.tea_profiles
for each row execute function public.set_updated_at();
