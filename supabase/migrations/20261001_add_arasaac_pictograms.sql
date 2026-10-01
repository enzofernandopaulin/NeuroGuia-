-- NeuroGuia: pictogramas ARASAAC opcionais nas tarefas da rotina.
-- Execute no Supabase antes de publicar o frontend que utiliza estes campos.

alter table public.routine_tasks
  add column if not exists pictogram_provider text,
  add column if not exists pictogram_id integer,
  add column if not exists pictogram_label text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'routine_tasks_pictogram_consistency_check'
      and conrelid = 'public.routine_tasks'::regclass
  ) then
    alter table public.routine_tasks
      add constraint routine_tasks_pictogram_consistency_check
      check (
        (pictogram_provider is null and pictogram_id is null)
        or (pictogram_provider is not null and pictogram_id is not null
            and pictogram_provider = 'arasaac' and pictogram_id > 0)
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'routine_tasks_pictogram_label_length_check'
      and conrelid = 'public.routine_tasks'::regclass
  ) then
    alter table public.routine_tasks
      add constraint routine_tasks_pictogram_label_length_check
      check (pictogram_label is null or char_length(pictogram_label) <= 120);
  end if;
end $$;

comment on column public.routine_tasks.pictogram_provider is
  'Provedor do pictograma opcional. No protótipo, somente arasaac.';
comment on column public.routine_tasks.pictogram_id is
  'Identificador público do pictograma no provedor.';
comment on column public.routine_tasks.pictogram_label is
  'Descrição curta utilizada como rótulo e texto alternativo.';

-- As políticas RLS atuais de routine_tasks continuam protegendo estes campos.
-- Nenhuma permissão adicional é concedida por esta migration.
