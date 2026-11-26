import React from 'react';
import type { RoutineTask } from '../types';
import { PictogramImage } from './PictogramImage';

export function TaskPictograms({ task, compact = false }: { task: RoutineTask; compact?: boolean }) {
  const pictures = task.pictograms || [];
  if (!pictures.length) return null;
  return <ol className={`flex flex-wrap gap-3 ${compact ? '' : 'my-4'}`} aria-label={`Pictogramas de ${task.title}`}>
    {pictures.map((picture, index) => <li key={`${picture.id}-${index}`} className="flex flex-col items-center max-w-28 text-center">
      <PictogramImage id={picture.id} label={picture.label} className={compact ? 'w-14 h-14' : 'w-24 h-24'} />
      {!compact && <span className="text-xs font-bold mt-1 break-words">{index + 1}. {picture.label}</span>}
    </li>)}
  </ol>;
}
