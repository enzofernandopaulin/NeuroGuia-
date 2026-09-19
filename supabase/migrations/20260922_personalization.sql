-- Phase 4: level presets are only initial values; these columns store overrides.
do $$
declare already_migrated boolean;
begin
  select exists (select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tea_profiles'
      and column_name = 'max_later_tasks') into already_migrated;

  alter table public.tea_profiles
    add column if not exists max_later_tasks integer not null default 2
      check (max_later_tasks between 0 and 8),
    add column if not exists large_text boolean not null default false,
    add column if not exists reduce_motion boolean not null default false,
    add column if not exists audio_instructions boolean not null default false;

  -- Backfill once. Re-running the migration cannot reset customized profiles.
  if not already_migrated then
    update public.tea_profiles set
      max_later_tasks = case support_level when 'nivel-1' then 4 when 'nivel-3' then 0 else 2 end,
      reduce_motion = 'animacoes' = any(sensory_triggers),
      audio_instructions = communication_preference = 'audio';
  end if;
end;
$$;
