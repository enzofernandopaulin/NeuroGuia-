import type { PictogramSelection } from '../types';

const ARASAAC_API_URL = 'https://api.arasaac.org/v1';
const ARASAAC_STATIC_URL = 'https://static.arasaac.org/pictograms';
const SEARCH_TIMEOUT_MS = 15_000;
const MAX_SEARCH_LENGTH = 80;

type ArasaacKeyword = {
  keyword?: string;
};

type ArasaacPictogramResponse = {
  _id?: number;
  id?: number;
  keywords?: ArasaacKeyword[];
};

export class ArasaacSearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArasaacSearchError';
  }
}

export const getArasaacImageUrl = (id: number, resolution: 300 | 500 | 2500 = 500) =>
  `${ARASAAC_STATIC_URL}/${id}/${id}_${resolution}.png`;

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

const getLabel = (item: ArasaacPictogramResponse, searchTerm: string) => {
  const keywords = (item.keywords || [])
    .map(({ keyword }) => keyword?.trim())
    .filter((keyword): keyword is string => Boolean(keyword));
  const normalizedSearch = normalize(searchTerm);
  return keywords.find((keyword) => normalize(keyword) === normalizedSearch) || keywords[0] || 'Pictograma ARASAAC';
};

export async function searchArasaacPictograms(
  rawSearchTerm: string,
  externalSignal?: AbortSignal,
): Promise<PictogramSelection[]> {
  const searchTerm = rawSearchTerm.trim().slice(0, MAX_SEARCH_LENGTH);
  if (searchTerm.length < 2) return [];

  const timeoutController = new AbortController();
  const timeout = window.setTimeout(() => timeoutController.abort(), SEARCH_TIMEOUT_MS);
  const abortFromExternalSignal = () => timeoutController.abort();
  externalSignal?.addEventListener('abort', abortFromExternalSignal, { once: true });

  try {
    const response = await fetch(
      `${ARASAAC_API_URL}/pictograms/pt/search/${encodeURIComponent(searchTerm)}`,
      { signal: timeoutController.signal, headers: { Accept: 'application/json' } },
    );

    if (!response.ok) {
      if (response.status === 404) return [];
      throw new ArasaacSearchError('O ARASAAC não respondeu à pesquisa. Tente novamente.');
    }

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) return [];

    const results = payload
      .map((item) => item as ArasaacPictogramResponse)
      .map((item) => {
        const id = Number(item._id ?? item.id);
        if (!Number.isInteger(id) || id <= 0) return null;
        return {
          provider: 'arasaac' as const,
          id,
          label: getLabel(item, searchTerm),
          imageUrl: getArasaacImageUrl(id),
        };
      })
      .filter((item): item is PictogramSelection => item !== null);

    return [...new Map(results.map((item) => [item.id, item])).values()].slice(0, 24);
  } catch (error) {
    if (error instanceof ArasaacSearchError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      if (externalSignal?.aborted) return [];
      throw new ArasaacSearchError('A pesquisa demorou mais que o esperado. Tente novamente.');
    }
    throw new ArasaacSearchError('Não foi possível pesquisar pictogramas agora.');
  } finally {
    window.clearTimeout(timeout);
    externalSignal?.removeEventListener('abort', abortFromExternalSignal);
  }
}
