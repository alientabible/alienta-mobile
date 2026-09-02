import type { ReflectionClassification } from './classification.ts';
import type { ReflectionRequest } from './schema.ts';

export type ApprovedPassageText = {
  verseId: string;
  reference: string;
  text: string;
  editorialReason: string;
};

export type ReflectionPrompt = {
  instructions: string;
  input: string;
};

export function buildReflectionPrompt(
  request: ReflectionRequest,
  classification: ReflectionClassification,
  passages: readonly ApprovedPassageText[],
): ReflectionPrompt {
  if (classification.safety.level !== 'standard' || !classification.safety.canGenerateReflection) {
    throw new Error('Unsafe input must use the human-support flow before generation');
  }
  if (passages.length < 1 || passages.length > 3) {
    throw new Error('Generation requires between one and three approved passages');
  }

  const approvedIds = new Set(passages.map((passage) => passage.verseId));
  if (approvedIds.size !== passages.length) throw new Error('Approved passages must be unique');

  const instructions = [
    'Eres el redactor de apoyo espiritual de Alienta, no un profesional clínico.',
    'Responde únicamente en español de Colombia con un tono sereno, prudente y no diagnóstico.',
    'Usa solo los pasajes aprobados que aparecen en la entrada.',
    'No inventes referencias, no alteres ni incluyas el texto bíblico en la salida.',
    'No prometas curación, resultados divinos específicos ni certeza sobre la voluntad de Dios.',
    'Devuelve únicamente JSON con: tone, title, passages, reflection, prayer, nextStep y safetyLevel.',
    'Cada elemento de passages contiene solo verseId y reason.',
    'safetyLevel debe ser standard o support.',
  ].join('\n');

  const input = JSON.stringify({
    locale: request.locale,
    emotion: classification.primaryEmotion,
    intensity: classification.intensity,
    topics: classification.topics,
    note: request.note?.trim() || undefined,
    approvedPassages: passages,
  });

  return { instructions, input };
}
