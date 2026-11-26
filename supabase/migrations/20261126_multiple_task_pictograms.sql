-- Preserva o pictograma antigo e permite até oito imagens ordenadas por tarefa.
alter table public.routine_tasks
  add column if not exists pictograms jsonb not null default '[]'::jsonb;

update public.routine_tasks
set pictograms = jsonb_build_array(jsonb_build_object(
  'provider', 'arasaac', 'id', pictogram_id,
  'label', coalesce(nullif(pictogram_label, ''), title)))
where pictogram_id is not null and pictograms = '[]'::jsonb;

create or replace function public.valid_task_pictograms(items jsonb) returns boolean
language sql immutable set search_path = '' as $$
  select coalesce(pg_catalog.jsonb_typeof(items) = 'array' and pg_catalog.jsonb_array_length(items) <= 8
    and not exists (
      select 1 from pg_catalog.jsonb_array_elements(items) as item(value)
      where value->>'provider' is distinct from 'arasaac'
        or pg_catalog.jsonb_typeof(value->'id') is distinct from 'number'
        or (value->>'id')::numeric <= 0
        or pg_catalog.jsonb_typeof(value->'label') is distinct from 'string'
        or pg_catalog.char_length(value->>'label') > 120
    ), false)
$$;
alter table public.routine_tasks drop constraint if exists routine_tasks_pictograms_valid;
alter table public.routine_tasks add constraint routine_tasks_pictograms_valid
  check (public.valid_task_pictograms(pictograms));

comment on column public.routine_tasks.pictograms is
  'Lista ordenada de até oito pictogramas ARASAAC. Os campos pictogram_* antigos espelham o primeiro item.';
