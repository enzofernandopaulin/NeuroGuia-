-- Reversão manual da migration 20261001_add_arasaac_pictograms.sql.
-- ATENÇÃO: remove definitivamente as seleções de pictogramas já salvas.

alter table public.routine_tasks
  drop constraint if exists routine_tasks_pictogram_label_length_check,
  drop constraint if exists routine_tasks_pictogram_consistency_check,
  drop column if exists pictogram_label,
  drop column if exists pictogram_id,
  drop column if exists pictogram_provider;
