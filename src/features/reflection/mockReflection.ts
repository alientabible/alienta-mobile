import type { CheckInInput } from '../check-in/types';
import type { MockReflection, ReflectionId, StandardReflectionId } from './types';
import { moderateReflectionInput } from '../../../supabase/functions/generate-reflection/safety.ts';

const emotionPatterns: [StandardReflectionId, RegExp][] = [
  ['grateful', /\b(agradecid[oa]s?|agradecimiento|gratitud|gracias|bendecid[oa]s?)\b/],
  ['lonely', /\b(solo|sola|soledad|aislad[oa]s?|nadie|abandonad[oa]s?)\b/],
  ['hopeful', /\b(esperanza|esperanzad[oa]s?|confio|confianza|ilusion|ilusionad[oa]s?)\b/],
  [
    'peace',
    /\b(ansiedad|ansios[oa]s?|preocupacion|preocupad[oa]s?|miedo|temor|estres|paz)\b/,
  ],
];

const sharedPassage = {
  reference: 'Salmos 46:10 · RVR1909',
  verse: 'Estad quietos, y conoced que yo soy Dios.',
};

const reflections: Record<StandardReflectionId, MockReflection> = {
  peace: {
    ...sharedPassage,
    id: 'peace',
    eyebrow: 'Cuando todo pesa',
    title: 'Haz espacio antes de resolverlo todo.',
    reflection:
      'La quietud no niega lo que ocurre. Puede ser una pausa honesta para respirar, nombrar lo que pesa y decidir el siguiente paso con más claridad.',
    prayer:
      'Dios, acompáñame en esta pausa. Dame serenidad para reconocer lo que sí puedo hacer hoy y sabiduría para pedir ayuda cuando la necesite.',
    action: 'Pon ambos pies en el suelo y toma tres respiraciones lentas antes de continuar.',
  },
  grateful: {
    ...sharedPassage,
    id: 'grateful',
    eyebrow: 'Reconocer el bien',
    title: 'Deja que la gratitud se vuelva presencia.',
    reflection:
      'Agradecer no exige que todo sea perfecto. Es detenerse lo suficiente para reconocer una gracia concreta sin ignorar el resto de tu historia.',
    prayer:
      'Dios, gracias por el bien que hoy alcanzo a ver. Ayúdame a recibirlo con humildad y a convertirlo en cuidado para otras personas.',
    action: 'Escribe el nombre de una persona o un momento por el que hoy quieres dar gracias.',
  },
  lonely: {
    ...sharedPassage,
    id: 'lonely',
    eyebrow: 'No cargarlo a solas',
    title: 'Tu historia merece compañía y escucha.',
    reflection:
      'La soledad puede sentirse muy pesada. Nombrarla ya es un comienzo; el siguiente puede ser acercarte a alguien seguro que pueda escucharte sin prisa.',
    prayer:
      'Dios, recíbeme como estoy y dame valor para buscar compañía segura. Muéstrame a quién puedo acercarme hoy con honestidad.',
    action: 'Envía un mensaje breve a una persona de confianza: “¿Tienes unos minutos para hablar?”.',
  },
  hopeful: {
    ...sharedPassage,
    id: 'hopeful',
    eyebrow: 'Un paso a la vez',
    title: 'Cuida la esperanza sin exigirle respuestas rápidas.',
    reflection:
      'La esperanza también puede ser pequeña: una decisión amable, una conversación pendiente o la disposición de volver a intentarlo mañana.',
    prayer:
      'Dios, gracias por la esperanza que permanece. Ayúdame a cuidarla con paciencia y a caminar con atención al paso que tengo delante.',
    action: 'Elige una acción pequeña y posible que puedas completar antes de terminar el día.',
  },
  other: {
    ...sharedPassage,
    id: 'other',
    eyebrow: 'Puedes llegar sin nombre',
    title: 'No tienes que entenderlo todo para empezar.',
    reflection:
      'Algunas experiencias tardan en encontrar palabras. Puedes comenzar con una pausa, notar lo que ocurre en tu cuerpo y compartirlo con alguien seguro cuando estés listo.',
    prayer:
      'Dios, aquí estoy, incluso sin saber explicar todo lo que siento. Dame claridad, paciencia y personas confiables para este momento.',
    action: 'Completa esta frase en privado: “Lo que más necesito en este momento es…”.',
  },
};

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function resolveMockReflectionId({ emotion, note }: CheckInInput): ReflectionId {
  const normalizedNote = normalizeText(note);

  if (!moderateReflectionInput(note).canGenerateReflection) {
    return 'urgent';
  }

  if (emotion) {
    return emotion;
  }

  const inferredEmotion = emotionPatterns.find(([, pattern]) => pattern.test(normalizedNote));
  return inferredEmotion?.[0] ?? 'other';
}

export function isReflectionId(value: unknown): value is ReflectionId {
  return (
    value === 'peace' ||
    value === 'grateful' ||
    value === 'lonely' ||
    value === 'hopeful' ||
    value === 'other' ||
    value === 'urgent'
  );
}

export function getMockReflection(id: StandardReflectionId): MockReflection {
  return reflections[id];
}
