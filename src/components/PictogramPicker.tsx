import React, { useEffect, useRef, useState } from 'react';
import { searchArasaacPictograms } from '../services/arasaacService';
import type { PictogramSelection } from '../types';
import { PictogramImage } from './PictogramImage';

interface Props {
  value: PictogramSelection[];
  onChange: (value: PictogramSelection[]) => void;
  suggestedSearch?: string;
}

export const PictogramPicker: React.FC<Props> = ({ value, onChange, suggestedSearch = '' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PictogramSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const latestRequest = useRef(0);

  useEffect(() => {
    const requestId = ++latestRequest.current;
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setResults([]);
      setError('');
      setSearched(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const found = await searchArasaacPictograms(trimmedQuery, controller.signal);
        if (requestId !== latestRequest.current) return;
        setResults(found);
        setSearched(true);
      } catch (searchError) {
        if (requestId !== latestRequest.current) return;
        setResults([]);
        setSearched(true);
        setError(searchError instanceof Error ? searchError.message : 'Não foi possível pesquisar pictogramas.');
      } finally {
        if (requestId === latestRequest.current) setLoading(false);
      }
    }, 450);

    return () => {
      latestRequest.current++;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const useSuggestion = () => {
    const suggestion = suggestedSearch.trim().slice(0, 80);
    if (suggestion.length >= 2) setQuery(suggestion);
  };

  return (
    <div className="rounded-2xl border-2 border-outline-variant p-4 mt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <strong className="text-sm">Pictogramas da tarefa (opcional, até 8)</strong>
          <p className="text-xs text-on-surface-variant mt-0.5">Adicione imagens e organize na ordem em que o estudante deve vê-las.</p>
          <p className="text-[11px] text-on-surface-variant mt-0.5">Use somente nomes de atividades; não informe dados pessoais.</p>
        </div>
        <span className="text-xs">{value.length}/8</span>
      </div>

      {value.length > 0 && <ol className="mt-3 space-y-2" aria-label="Pictogramas selecionados">
        {value.map((item, index) => <li key={item.id} className="flex items-center gap-2 rounded-2xl bg-surface-container-low p-2">
          <span className="font-bold">{index + 1}.</span><PictogramImage id={item.id} label={item.label} className="w-14 h-14" />
          <span className="flex-1 min-w-0 truncate text-sm" title={item.label}>{item.label}</span>
          <button type="button" disabled={index === 0} aria-label={`Mover ${item.label} para cima`} onClick={() => { const next = [...value]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(next); }} className="rounded-lg border px-2 py-1 disabled:opacity-40">↑</button>
          <button type="button" disabled={index === value.length - 1} aria-label={`Mover ${item.label} para baixo`} onClick={() => { const next = [...value]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; onChange(next); }} className="rounded-lg border px-2 py-1 disabled:opacity-40">↓</button>
          <button type="button" aria-label={`Remover ${item.label}`} onClick={() => onChange(value.filter((selected) => selected.id !== item.id))} className="rounded-lg border border-error text-error px-2 py-1">Remover</button>
        </li>)}
      </ol>}

      <div className="flex gap-2 mt-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value.slice(0, 80))}
          placeholder="Ex.: escovar os dentes"
          aria-label="Pesquisar pictograma no ARASAAC"
          className="min-w-0 flex-1 rounded-xl border border-outline-variant bg-white px-3 py-2.5 text-sm"
        />
        {suggestedSearch.trim().length >= 2 && !query && (
          <button type="button" onClick={useSuggestion} className="rounded-xl border border-primary text-primary px-3 py-2 text-xs font-bold">
            Usar nome
          </button>
        )}
      </div>

      <div className="min-h-6 mt-2 text-xs" aria-live="polite">
        {loading && <span>Pesquisando pictogramas...</span>}
        {!loading && error && <span className="text-error">{error} A tarefa ainda pode ser salva sem imagem.</span>}
        {!loading && !error && searched && results.length === 0 && <span>Nenhum pictograma encontrado. Tente outro termo.</span>}
        {!loading && !error && query.trim().length === 1 && <span>Digite pelo menos dois caracteres.</span>}
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2 max-h-72 overflow-y-auto" role="list" aria-label="Resultados de pictogramas">
          {results.map((item) => {
            const selected = value.some((picture) => picture.id === item.id);
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => onChange(selected ? value.filter((picture) => picture.id !== item.id) : value.length < 8 ? [...value, item] : value)}
                disabled={!selected && value.length >= 8}
                aria-pressed={selected}
                className={`rounded-2xl border-2 p-2 text-center disabled:opacity-40 ${selected ? 'border-primary bg-primary-fixed' : 'border-outline-variant bg-white hover:border-primary'}`}
              >
                <img src={item.imageUrl} alt="" loading="lazy" className="w-full aspect-square object-contain rounded-xl" />
                <span className="mt-1 block truncate text-[11px] font-bold" title={item.label}>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-on-surface-variant mt-3">
        Pictogramas: Sergio Palao — <a className="underline" href="https://arasaac.org/terms-of-use" target="_blank" rel="noreferrer">ARASAAC</a> (Governo de Aragão), licença CC BY-NC-SA.
      </p>
    </div>
  );
};
