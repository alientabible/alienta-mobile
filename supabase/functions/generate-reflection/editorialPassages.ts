import type { ReflectionTopic } from './schema.ts';

export type EditorialReviewStatus = 'candidate' | 'approved';

export type EditorialPassage = {
  verseId: string;
  topics: readonly ReflectionTopic[];
  rationale: string;
  reviewStatus: EditorialReviewStatus;
};

// Los identificadores fueron verificados contra la base RVR1909 empaquetada. Permanecen como
// candidatos hasta que una revisión pastoral/editorial los promueva explícitamente a `approved`.
export const EDITORIAL_PASSAGES: readonly EditorialPassage[] = [
  {
    verseId: 'rvr1909.PSA.46.10',
    topics: ['peace', 'overwhelm', 'rest'],
    rationale: 'Invita a una pausa consciente sin negar la situación de la persona.',
    reviewStatus: 'candidate',
  },
  {
    verseId: 'rvr1909.PHP.4.6',
    topics: ['peace', 'fear', 'gratitude'],
    rationale: 'Relaciona la preocupación con una oración que también reconoce la gratitud.',
    reviewStatus: 'candidate',
  },
  {
    verseId: 'rvr1909.PHP.4.7',
    topics: ['peace', 'fear'],
    rationale: 'Acompaña la búsqueda de paz sin presentar una promesa médica.',
    reviewStatus: 'candidate',
  },
  {
    verseId: 'rvr1909.PSA.34.18',
    topics: ['loneliness', 'grief'],
    rationale: 'Reconoce el dolor y la cercanía de Dios ante un corazón quebrantado.',
    reviewStatus: 'candidate',
  },
  {
    verseId: 'rvr1909.PSA.23.4',
    topics: ['loneliness', 'fear', 'grief'],
    rationale: 'Ofrece lenguaje de compañía en medio de una experiencia difícil.',
    reviewStatus: 'candidate',
  },
  {
    verseId: 'rvr1909.ROM.12.12',
    topics: ['hope'],
    rationale: 'Une esperanza, paciencia y oración sin exigir una solución inmediata.',
    reviewStatus: 'candidate',
  },
  {
    verseId: 'rvr1909.PRO.3.5',
    topics: ['guidance', 'fear'],
    rationale: 'Enmarca la orientación como confianza humilde y no como certeza automática.',
    reviewStatus: 'candidate',
  },
  {
    verseId: 'rvr1909.MAT.11.28',
    topics: ['rest', 'overwhelm'],
    rationale: 'Reconoce el cansancio y dirige hacia el descanso en Cristo.',
    reviewStatus: 'candidate',
  },
] as const;

export function getEditorialCandidates(topics: readonly ReflectionTopic[], limit = 3) {
  const requested = new Set(topics);
  return EDITORIAL_PASSAGES.filter((passage) =>
    passage.topics.some((topic) => requested.has(topic)),
  ).slice(0, Math.min(Math.max(limit, 1), 3));
}

export function getApprovedEditorialPassages(topics: readonly ReflectionTopic[], limit = 3) {
  return getEditorialCandidates(topics, 3)
    .filter((passage) => passage.reviewStatus === 'approved')
    .slice(0, Math.min(Math.max(limit, 1), 3));
}
