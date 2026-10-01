import React, { useState } from 'react';
import { getArasaacImageUrl } from '../services/arasaacService';

interface Props {
  id?: number | null;
  label?: string | null;
  className?: string;
}

export const PictogramImage: React.FC<Props> = ({ id, label, className = 'w-16 h-16' }) => {
  const [failedId, setFailedId] = useState<number | null>(null);
  if (!id || failedId === id) return null;

  return (
    <img
      src={getArasaacImageUrl(id)}
      alt={label ? `Pictograma: ${label}` : 'Pictograma da tarefa'}
      loading="lazy"
      decoding="async"
      onError={() => setFailedId(id)}
      className={`${className} shrink-0 rounded-2xl bg-white object-contain p-1 border border-outline-variant/50`}
    />
  );
};
