import type { ReflectionEmotion, ReflectionTopic } from './schema.ts';
import { moderateReflectionInput, normalizeSafetyText, type SafetyDecision } from './safety.ts';

export type ReflectionIntensity = 'low' | 'medium' | 'high';

export type ReflectionClassification = {
  primaryEmotion: ReflectionEmotion;
  intensity: ReflectionIntensity;
  topics: ReflectionTopic[];
  safety: SafetyDecision;
};

const emotionTopics: Record<ReflectionEmotion, ReflectionTopic> = {
  peace: 'peace',
  grateful: 'gratitude',
  lonely: 'loneliness',
  hopeful: 'hope',
  other: 'guidance',
};

const topicPatterns: ReadonlyArray<[ReflectionTopic, RegExp]> = [
  ['overwhelm', /\b(abrumad|desbordad|demasiado|no puedo con todo)\w*\b/],
  ['grief', /\b(duelo|fallecio|murio|perdi a|luto)\b/],
  ['fear', /\b(miedo|temor|asustad|panico)\w*\b/],
  ['rest', /\b(cansad|agotad|descansar|no duermo|insomnio)\w*\b/],
  ['loneliness', /\b(solo|sola|soledad|aislad|abandonad)\w*\b/],
  ['gratitude', /\b(gracias|gratitud|agradecid|bendecid)\w*\b/],
  ['hope', /\b(esperanza|esperanzad|volver a intentar|nuevo comienzo)\w*\b/],
  ['peace', /\b(paz|calma|ansiedad|ansios|preocupad|estres)\w*\b/],
  ['guidance', /\b(decidir|decision|direccion|orientacion|no se que hacer)\b/],
];

function inferEmotion(normalizedNote: string): ReflectionEmotion {
  if (/\b(gracias|gratitud|agradecid|bendecid)\w*\b/.test(normalizedNote)) return 'grateful';
  if (/\b(solo|sola|soledad|aislad|abandonad)\w*\b/.test(normalizedNote)) return 'lonely';
  if (/\b(esperanza|esperanzad|nuevo comienzo)\w*\b/.test(normalizedNote)) return 'hopeful';
  if (/\b(paz|calma|ansiedad|ansios|preocupad|estres)\w*\b/.test(normalizedNote)) return 'peace';
  return 'other';
}

function inferIntensity(normalizedNote: string): ReflectionIntensity {
  if (/\b(extremadamente|insoportable|desesperad|no puedo mas|fuera de control)\w*\b/.test(normalizedNote)) {
    return 'high';
  }
  if (/\b(muy|bastante|demasiado|mucho|muchisimo)\b/.test(normalizedNote)) return 'medium';
  return 'low';
}

export function classifyReflectionInput(
  emotion: ReflectionEmotion | null,
  note: string,
): ReflectionClassification {
  const normalizedNote = normalizeSafetyText(note);
  const safety = moderateReflectionInput(note);
  const primaryEmotion = emotion ?? inferEmotion(normalizedNote);
  const topics = new Set<ReflectionTopic>([emotionTopics[primaryEmotion]]);
  for (const [topic, pattern] of topicPatterns) {
    if (pattern.test(normalizedNote)) topics.add(topic);
  }
  return {
    primaryEmotion,
    intensity: inferIntensity(normalizedNote),
    topics: [...topics].slice(0, 4),
    safety,
  };
}
