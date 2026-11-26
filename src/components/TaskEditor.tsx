import React, { useState } from 'react';
import type { PictogramSelection, RoutineTask } from '../types';
import { PictogramPicker } from './PictogramPicker';
import { getArasaacImageUrl } from '../services/arasaacService';

type Changes = { title: string; task_time: string | null; scheduled_date: string; steps: string[];
  recurrence_days: number[]; duration_minutes: number | null; pictogram_provider: 'arasaac' | null;
  pictogram_id: number | null; pictogram_label: string | null };

export function TaskEditor({ task, onClose, onSave }: { task: RoutineTask; onClose: () => void; onSave: (id: string, changes: Changes) => Promise<void> }) {
  const [title, setTitle] = useState(task.title);
  const [time, setTime] = useState(task.time === 'Sem horário' ? '' : task.time);
  const [date, setDate] = useState(task.scheduledDate || '');
  const [steps, setSteps] = useState((task.steps || []).join('\n'));
  const [days, setDays] = useState(task.recurrenceDays || []);
  const [duration, setDuration] = useState(task.durationMinutes ? String(task.durationMinutes) : '');
  const [picture, setPicture] = useState<PictogramSelection | null>(task.pictogramId ? {
    provider: 'arasaac', id: task.pictogramId, label: task.pictogramLabel || task.title,
    imageUrl: getArasaacImageUrl(task.pictogramId),
  } : null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !date) return;
    setSaving(true); setError('');
    try {
      await onSave(task.id, { title: title.trim(), task_time: time || null, scheduled_date: date,
        steps: steps.split('\n').map((step) => step.trim()).filter(Boolean), recurrence_days: days,
        duration_minutes: duration ? Number(duration) : null,
        pictogram_provider: picture?.provider || null, pictogram_id: picture?.id || null,
        pictogram_label: picture?.label || null });
      onClose();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível salvar a tarefa.'); }
    finally { setSaving(false); }
  };

  return <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 grid place-items-center" role="presentation">
    <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="edit-task-heading" className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 space-y-3">
      <h2 id="edit-task-heading" className="text-xl font-extrabold">Editar tarefa</h2>
      <label className="block">Nome<input required value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-xl border p-3" /></label>
      <div className="grid grid-cols-2 gap-3"><label>Data<input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-full rounded-xl border p-3" /></label><label>Horário<input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="w-full rounded-xl border p-3" /></label></div>
      <label className="block">Duração em minutos<input type="number" min="1" max="480" value={duration} onChange={(event) => setDuration(event.target.value)} className="w-full rounded-xl border p-3" /></label>
      <label className="block">Etapas, uma por linha<textarea value={steps} onChange={(event) => setSteps(event.target.value)} className="w-full min-h-24 rounded-xl border p-3" /></label>
      <fieldset><legend>Repetir semanalmente</legend><div className="flex flex-wrap gap-2">{['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((day, index) => <label key={day}><input type="checkbox" checked={days.includes(index)} onChange={() => setDays((current) => current.includes(index) ? current.filter((value) => value !== index) : [...current, index])} /> {day}</label>)}</div></fieldset>
      <PictogramPicker value={picture} onChange={setPicture} suggestedSearch={title} />
      {error && <p role="alert" className="text-error">{error}</p>}
      <div className="flex gap-3"><button type="button" onClick={onClose} className="flex-1 rounded-xl border p-3">Cancelar</button><button disabled={saving || !title.trim() || !date} className="flex-1 rounded-xl bg-primary p-3 text-white disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar alterações'}</button></div>
    </form>
  </div>;
}
