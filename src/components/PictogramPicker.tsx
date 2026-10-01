import React, { useEffect, useRef, useState } from 'react';
import { searchArasaacPictograms } from '../services/arasaacService';
import type { PictogramSelection } from '../types';
import { PictogramImage } from './PictogramImage';

interface Props {
  value: PictogramSelection | null;
  onChange: (value: PictogramSelection | null) => void;
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
          <strong className="text-sm">Pictograma da tarefa (opcional)</strong>
          <p className="text-xs text-on-surface-variant mt-0.5">Pesquise uma imagem de apoio visual no ARASAAC.</p>
          <p className="text-[11px] text-on-surface-variant mt-0.5">Use somente nomes de atividades; não informe dados pessoais.</p>
        </div>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="rounded-xl border border-error text-error px-3 py-2 text-xs font-bold">
            Remover
          </button>
        )}
      </div>

      {value && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-surface-container-low p-3" aria-live="polite">
          <PictogramImage id={value.id} label={value.label} />
          <div><strong className="block">{value.label}</strong><span className="text-xs opacity-65">Pictograma selecionado</span></div>
        </div>
      )}

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
            const selected = value?.id === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => onChange(item)}
                aria-pressed={selected}
                className={`rounded-2xl border-2 p-2 text-center ${selected ? 'border-primary bg-primary-fixed' : 'border-outline-variant bg-white hover:border-primary'}`}
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
