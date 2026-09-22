-- Tempo opcional definido pelo responsável ou tutor para orientar a tarefa.
alter table public.routine_tasks
  add column if not exists duration_minutes integer
  check (duration_minutes is null or duration_minutes between 1 and 480);

create or replace function public.set_tutor_task_duration(
  p_task_id uuid,
  p_duration_minutes integer
) returns void
language plpgsql security definer set search_path = ''
as $$
declare v_profile_id uuid;
begin
  if p_duration_minutes is not null and p_duration_minutes not between 1 and 480 then
    raise exception 'O tempo deve estar entre 1 e 480 minutos';
  end if;

  select profile_id into v_profile_id
  from public.routine_tasks
  where id = p_task_id;

  if v_profile_id is null or not public.is_profile_tutor(v_profile_id) then
    raise exception 'Acesso negado';
  end if;

  update public.routine_tasks
  set duration_minutes = p_duration_minutes, updated_at = now()
  where id = p_task_id;
end $$;

revoke all on function public.set_tutor_task_duration(uuid,integer) from public;
grant execute on function public.set_tutor_task_duration(uuid,integer) to authenticated;
