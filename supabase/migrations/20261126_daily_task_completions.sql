-- Apply once to the existing NeuroGuia project before deploying this branch.
-- Retains routine_tasks.completed for legacy clients, while using one completion per day.
create table if not exists public.routine_task_completions (
  task_id uuid not null references public.routine_tasks(id) on delete cascade,
  profile_id uuid not null references public.tea_profiles(id) on delete cascade,
  occurrence_date date not null,
  completed_at timestamptz not null default now(),
  primary key (task_id, occurrence_date)
);
create index if not exists routine_task_completions_profile_date_idx
  on public.routine_task_completions(profile_id, occurrence_date);
alter table public.routine_task_completions enable row level security;
create or replace function public.validate_task_completion() returns trigger
language plpgsql set search_path = '' as $$
declare v_task public.routine_tasks%rowtype;
begin
  select * into v_task from public.routine_tasks where id = new.task_id;
  if not found or v_task.profile_id <> new.profile_id or v_task.archived
    or new.occurrence_date < v_task.scheduled_date
    or (new.occurrence_date <> v_task.scheduled_date
      and not (extract(dow from new.occurrence_date)::integer = any(v_task.recurrence_days))) then
    raise exception 'Conclusão não corresponde à tarefa ou à data';
  end if;
  return new;
end $$;
drop trigger if exists validate_task_completion on public.routine_task_completions;
create trigger validate_task_completion before insert or update on public.routine_task_completions
for each row execute function public.validate_task_completion();
drop policy if exists routine_completions_owner on public.routine_task_completions;
create policy routine_completions_owner on public.routine_task_completions for all to authenticated
  using (public.is_profile_owner(profile_id)) with check (public.is_profile_owner(profile_id));
drop policy if exists routine_completions_student_read on public.routine_task_completions;
create policy routine_completions_student_read on public.routine_task_completions for select to authenticated
  using (profile_id = public.current_student_profile_id());
drop policy if exists routine_completions_tutor_read on public.routine_task_completions;
create policy routine_completions_tutor_read on public.routine_task_completions for select to authenticated
  using (public.is_profile_tutor(profile_id));
grant select, insert, update, delete on public.routine_task_completions to authenticated;

-- Existing completed tasks have no completion date. Preserve their original date only.
insert into public.routine_task_completions(task_id, profile_id, occurrence_date)
select id, profile_id, scheduled_date from public.routine_tasks where completed = true and not archived
on conflict do nothing;

create or replace function public.set_student_task_occurrence_completed(
  p_task_id uuid, p_date date, p_completed boolean
) returns void language plpgsql security definer set search_path = '' as $$
declare v_profile uuid;
begin
  v_profile := public.current_student_profile_id();
  if v_profile is null or p_date not between current_date - 1 and current_date + 1 then
    raise exception 'Acesso negado';
  end if;
  if not exists (
    select 1 from public.routine_tasks t
    where t.id = p_task_id and t.profile_id = v_profile and not t.archived
      and t.scheduled_date <= p_date
      and (t.scheduled_date = p_date or extract(dow from p_date)::integer = any(t.recurrence_days))
  ) then raise exception 'Tarefa não encontrada nesta data'; end if;
  if p_completed then
    insert into public.routine_task_completions(task_id, profile_id, occurrence_date)
    values(p_task_id, v_profile, p_date) on conflict do nothing;
  else
    delete from public.routine_task_completions
    where task_id = p_task_id and profile_id = v_profile and occurrence_date = p_date;
  end if;
end $$;
revoke all on function public.set_student_task_occurrence_completed(uuid,date,boolean) from public;
grant execute on function public.set_student_task_occurrence_completed(uuid,date,boolean) to authenticated;
