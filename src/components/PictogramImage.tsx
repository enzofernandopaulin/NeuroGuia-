import React, { useState } from 'react';
import { getArasaacImageUrl } from '../services/arasaacService';

interface Props {
  id?: number | null;
  label?: string | null;
  className?: string;
}

export const PictogramImage: React.FC<Props> = ({ id, label, className = 'w-16 h-16' }) => {
  const [failedId, setFailedId] = useState<number | null>(null);
  if (!id) return null;
  if (failedId === id) return <span role="img" aria-label={`Imagem indisponível: ${label || 'tarefa'}`} className={`${className} shrink-0 rounded-2xl border border-outline-variant bg-white grid place-items-center text-center text-xs p-1`}>Imagem indisponível</span>;

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
