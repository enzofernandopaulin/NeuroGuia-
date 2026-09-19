-- Phase 3: routines belong to one student; daily completions reset by local date.
create table if not exists public.routine_tasks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.tea_profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 150),
  task_time time,
  category text not null default 'Rotina',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (id, profile_id)
);
create index if not exists routine_tasks_profile_idx on public.routine_tasks(profile_id, sort_order);

create table if not exists public.routine_steps (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.routine_tasks(id) on delete cascade,
  position integer not null check (position >= 0),
  instruction text not null check (char_length(trim(instruction)) between 1 and 400),
  unique(task_id, position)
);

create table if not exists public.routine_completions (
  task_id uuid not null,
  profile_id uuid not null,
  day date not null,
  completed_at timestamptz not null default now(),
  primary key (task_id, day),
  foreign key (task_id, profile_id) references public.routine_tasks(id, profile_id) on delete cascade
);

create table if not exists public.routine_step_completions (
  step_id uuid not null references public.routine_steps(id) on delete cascade,
  day date not null,
  completed_at timestamptz not null default now(),
  primary key (step_id, day)
);

alter table public.routine_tasks enable row level security;
alter table public.routine_steps enable row level security;
alter table public.routine_completions enable row level security;
alter table public.routine_step_completions enable row level security;
grant select on public.routine_tasks, public.routine_steps,
  public.routine_completions, public.routine_step_completions to authenticated;
grant insert, delete on public.routine_completions, public.routine_step_completions to authenticated;

create policy "Read own routine" on public.routine_tasks for select to authenticated
  using (exists (select 1 from public.tea_profiles p where p.id = profile_id
    and p.responsible_id = auth.uid()) or public.student_has_access(profile_id));
create policy "Read routine steps" on public.routine_steps for select to authenticated
  using (exists (select 1 from public.routine_tasks t where t.id = task_id));

-- Only the guardian can create or change the task definition. The RPC below
-- updates tasks and steps in a single transaction after checking ownership.
create or replace function public.save_routine_task(
  p_profile_id uuid, p_task_id uuid, p_title text, p_time time,
  p_category text, p_steps text[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_instruction text; v_position integer := 0;
begin
  if auth.uid() is null or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
    or not exists (select 1 from public.tea_profiles p
      where p.id = p_profile_id and p.responsible_id = auth.uid()) then
    raise exception 'Acesso negado';
  end if;
  if char_length(trim(coalesce(p_title, ''))) not between 1 and 150
    or char_length(trim(coalesce(p_category, ''))) not between 1 and 80
    or coalesce(array_length(p_steps, 1), 0) > 30 then
    raise exception 'Revise o título, a categoria e as etapas';
  end if;
  if p_task_id is null then
    insert into public.routine_tasks(profile_id, title, task_time, category, sort_order)
      values (p_profile_id, trim(p_title), p_time, trim(p_category),
        (select coalesce(max(sort_order), 0) + 1 from public.routine_tasks where profile_id = p_profile_id))
      returning id into v_id;
  else
    update public.routine_tasks set title = trim(p_title), task_time = p_time,
      category = trim(p_category) where id = p_task_id and profile_id = p_profile_id
      returning id into v_id;
    if v_id is null then raise exception 'Tarefa não encontrada'; end if;
    delete from public.routine_steps where task_id = v_id;
  end if;
  foreach v_instruction in array coalesce(p_steps, array[]::text[]) loop
    if char_length(trim(coalesce(v_instruction, ''))) not between 1 and 400 then
      raise exception 'Revise as instruções das etapas';
    end if;
    insert into public.routine_steps(task_id, position, instruction)
      values(v_id, v_position, trim(v_instruction));
    v_position := v_position + 1;
  end loop;
  return v_id;
end;
$$;

create or replace function public.delete_routine_task(p_task_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from public.routine_tasks t where t.id = p_task_id
    and exists (select 1 from public.tea_profiles p where p.id = t.profile_id
      and p.responsible_id = auth.uid())
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false);
  if not found then raise exception 'Tarefa não encontrada'; end if;
end;
$$;
revoke all on function public.save_routine_task(uuid, uuid, text, time, text, text[]),
  public.delete_routine_task(uuid) from public, anon;
grant execute on function public.save_routine_task(uuid, uuid, text, time, text, text[]),
  public.delete_routine_task(uuid) to authenticated;

create policy "Read daily completions" on public.routine_completions for select to authenticated
  using (exists (select 1 from public.routine_tasks t where t.id = task_id));
create policy "Record daily completion" on public.routine_completions for insert to authenticated
  with check (exists (select 1 from public.routine_tasks t where t.id = task_id and t.profile_id = profile_id));
create policy "Undo daily completion" on public.routine_completions for delete to authenticated
  using (exists (select 1 from public.routine_tasks t where t.id = task_id and t.profile_id = profile_id));
create policy "Read completed steps" on public.routine_step_completions for select to authenticated
  using (exists (select 1 from public.routine_steps s where s.id = step_id));
create policy "Mark completed step" on public.routine_step_completions for insert to authenticated
  with check (exists (select 1 from public.routine_steps s where s.id = step_id));
create policy "Undo completed step" on public.routine_step_completions for delete to authenticated
  using (exists (select 1 from public.routine_steps s where s.id = step_id));
