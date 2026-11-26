import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { occursOn } from './routineDates';
import type { RoutineTask } from '../types';

const weekly: RoutineTask = { id: 't1', title: 'Ler', time: '10:00', completed: false,
  scheduledDate: '2026-11-23', recurrenceDays: [1, 3] };

test('a tarefa aparece no início e apenas nos dias semanais posteriores', () => {
  assert.equal(occursOn(weekly, '2026-11-23'), true);
  assert.equal(occursOn(weekly, '2026-11-25'), true);
  assert.equal(occursOn(weekly, '2026-11-24'), false);
  assert.equal(occursOn(weekly, '2026-11-18'), false);
});

test('tarefa sem recorrência não aparece após a data original', () => {
  assert.equal(occursOn({ ...weekly, recurrenceDays: [] }, '2026-11-30'), false);
});
