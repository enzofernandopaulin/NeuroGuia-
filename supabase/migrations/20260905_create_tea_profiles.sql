-- NeuroGuia - Perfil TEA
-- Etapa 2 do MVP: persistência do perfil adaptativo.
-- A autenticação será ligada depois; por segurança, a tabela já nasce com RLS.

create extension if not exists pgcrypto;

create table if not exists public.tea_profiles (
  id uuid primary key default gen_random_uuid(),
  responsible_id uuid not null references auth.users(id) on delete cascade,

  name text not null check (char_length(trim(name)) between 1 and 80),
  age_group text not null check (age_group in ('crianca', 'adolescente', 'adulto')),
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

drop policy if exists "Responsavel pode visualizar seus perfis TEA" on public.tea_profiles;
create policy "Responsavel pode visualizar seus perfis TEA"
  on public.tea_profiles
  for select
  to authenticated
  using (auth.uid() = responsible_id);

drop policy if exists "Responsavel pode criar seus perfis TEA" on public.tea_profiles;
create policy "Responsavel pode criar seus perfis TEA"
  on public.tea_profiles
  for insert
  to authenticated
  with check (auth.uid() = responsible_id);

drop policy if exists "Responsavel pode atualizar seus perfis TEA" on public.tea_profiles;
create policy "Responsavel pode atualizar seus perfis TEA"
  on public.tea_profiles
  for update
  to authenticated
  using (auth.uid() = responsible_id)
  with check (auth.uid() = responsible_id);

drop policy if exists "Responsavel pode excluir seus perfis TEA" on public.tea_profiles;
create policy "Responsavel pode excluir seus perfis TEA"
  on public.tea_profiles
  for delete
  to authenticated
  using (auth.uid() = responsible_id);

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

drop trigger if exists set_tea_profiles_updated_at on public.tea_profiles;
create trigger set_tea_profiles_updated_at
before update on public.tea_profiles
for each row
execute function public.set_updated_at();

