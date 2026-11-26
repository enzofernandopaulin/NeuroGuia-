import type { RoutineTask } from '../types';

export const localDate = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const occursOn = (task: RoutineTask, date: string): boolean => {
  if (!task.scheduledDate || task.scheduledDate > date) return false;
  if (task.scheduledDate === date) return true;
  return Boolean(task.recurrenceDays?.includes(new Date(`${date}T12:00:00`).getDay()));
};
