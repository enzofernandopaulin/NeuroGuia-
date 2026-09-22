-- NeuroGuia MVP: gestão da rotina, gamificação, tutores e privacidade.

alter table public.routine_tasks add column if not exists sort_order integer not null default 0;
alter table public.routine_tasks add column if not exists recurrence_days smallint[] not null default '{}';
alter table public.routine_tasks add column if not exists archived boolean not null default false;
alter table public.support_requests add column if not exists viewed_at timestamptz;
alter table public.tutor_links add column if not exists can_respond boolean not null default false;

create table if not exists public.game_progress (
  profile_id uuid primary key references public.tea_profiles(id) on delete cascade,
  stars integer not null default 0 check (stars >= 0),
  mascot text not null default 'coruja',
  equipped_item text,
  inventory jsonb not null default '[]'::jsonb check (jsonb_typeof(inventory) = 'array'),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.tea_profiles(id) on delete cascade,
  event_key text not null,
  reason text not null check (reason in ('tarefa', 'ajuda', 'comunicacao', 'mudanca')),
  stars integer not null check (stars between 1 and 10),
  created_at timestamptz not null default now(),
  unique (profile_id, event_key)
);

alter table public.game_progress enable row level security;
alter table public.game_events enable row level security;

drop policy if exists game_progress_owner_all on public.game_progress;
create policy game_progress_owner_all on public.game_progress for all to authenticated
using (public.is_profile_owner(profile_id)) with check (public.is_profile_owner(profile_id));
drop policy if exists game_progress_student_read on public.game_progress;
create policy game_progress_student_read on public.game_progress for select to authenticated
using (profile_id = public.current_student_profile_id());
drop policy if exists game_events_owner_read on public.game_events;
create policy game_events_owner_read on public.game_events for select to authenticated
using (public.is_profile_owner(profile_id));
drop policy if exists game_events_student_read on public.game_events;
create policy game_events_student_read on public.game_events for select to authenticated
using (profile_id = public.current_student_profile_id());

grant select, insert, update on public.game_progress to authenticated;
grant select, insert on public.game_events to authenticated;

-- O estudante não recebe UPDATE genérico: só pode concluir tarefas e confirmar avisos.
drop policy if exists tasks_student_update on public.routine_tasks;
drop policy if exists changes_student_update on public.routine_change_notices;

create or replace function public.set_student_task_completed(p_task_id uuid, p_completed boolean)
returns void language plpgsql security definer set search_path=''
as $$ begin
  update public.routine_tasks set completed=p_completed,updated_at=now()
  where id=p_task_id and profile_id=public.current_student_profile_id();
  if not found then raise exception 'Tarefa não encontrada'; end if;
end $$;

create or replace function public.acknowledge_student_change(p_notice_id uuid)
returns void language plpgsql security definer set search_path=''
as $$ begin
  update public.routine_change_notices set acknowledged=true
  where id=p_notice_id and profile_id=public.current_student_profile_id();
  if not found then raise exception 'Aviso não encontrado'; end if;
end $$;

revoke all on function public.set_student_task_completed(uuid,boolean), public.acknowledge_student_change(uuid) from public;
grant execute on function public.set_student_task_completed(uuid,boolean), public.acknowledge_student_change(uuid) to authenticated;

create or replace function public.award_student_stars(
  p_profile_id uuid, p_event_key text, p_reason text, p_stars integer
) returns integer
language plpgsql security definer set search_path = ''
as $$
declare v_total integer;
begin
  if p_profile_id <> public.current_student_profile_id() then raise exception 'Acesso negado'; end if;
  if p_reason not in ('tarefa','ajuda','comunicacao','mudanca') or p_stars not between 1 and 10 then
    raise exception 'Recompensa inválida';
  end if;
  if p_reason in ('ajuda','comunicacao') and coalesce((select sum(stars) from public.game_events where profile_id=p_profile_id and reason in ('ajuda','comunicacao') and created_at >= current_date),0) >= 10 then
    select stars into v_total from public.game_progress where profile_id=p_profile_id;
    return coalesce(v_total,0);
  end if;
  insert into public.game_events(profile_id,event_key,reason,stars)
  values (p_profile_id,left(p_event_key,160),p_reason,p_stars)
  on conflict (profile_id,event_key) do nothing;
  if found then
    insert into public.game_progress(profile_id,stars) values (p_profile_id,p_stars)
    on conflict (profile_id) do update set stars=public.game_progress.stars+p_stars,updated_at=now();
  end if;
  select stars into v_total from public.game_progress where profile_id=p_profile_id;
  return coalesce(v_total,0);
end $$;

revoke all on function public.award_student_stars(uuid,text,text,integer) from public;
grant execute on function public.award_student_stars(uuid,text,text,integer) to authenticated;

create or replace function public.revoke_student_access_code(p_profile_id uuid)
returns void language plpgsql security definer set search_path=''
as $$ begin
  if not public.is_profile_owner(p_profile_id) then raise exception 'Acesso negado'; end if;
  delete from public.student_sessions where profile_id=p_profile_id;
  delete from public.student_credentials where profile_id=p_profile_id;
end $$;
revoke all on function public.revoke_student_access_code(uuid) from public;
grant execute on function public.revoke_student_access_code(uuid) to authenticated;
