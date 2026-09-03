export const SAFETY_CATEGORIES = [
  'none',
  'self_harm',
  'violence',
  'abuse',
  'hate',
  'sexual_safety',
] as const;

export type SafetyCategory = (typeof SAFETY_CATEGORIES)[number];
export type SafetyLevel = 'standard' | 'support' | 'urgent';

export type SafetyDecision = {
  category: SafetyCategory;
  level: SafetyLevel;
  canGenerateReflection: boolean;
  matchedRule: string | null;
};

type SafetyRule = {
  category: Exclude<SafetyCategory, 'none'>;
  id: string;
  pattern: RegExp;
};

const urgentRules: readonly SafetyRule[] = [
  {
    id: 'self-harm-first-person-intent',
    category: 'self_harm',
    pattern:
      /\b(quiero|voy a|planeo|pienso|estoy por)\s+(matarme|suicidarme|quitarme la vida|morir)\b/,
  },
  {
    id: 'self-harm-no-will-to-live',
    category: 'self_harm',
    pattern: /\b(no quiero|no deseo|ya no quiero)\s+(seguir\s+)?(vivir|viviendo)\b/,
  },
  {
    id: 'self-harm-reflexive-intent',
    category: 'self_harm',
    pattern: /\bme\s+(quiero|voy a|pienso)\s+(matar|suicidar)\b/,
  },
  {
    id: 'self-harm-end-my-life',
    category: 'self_harm',
    pattern: /\b(quiero|voy a|pienso en)\s+acabar\s+con\s+mi\s+vida\b/,
  },
  {
    id: 'self-harm-plan',
    category: 'self_harm',
    pattern: /\b(tengo|hice|prepare)\s+un\s+plan\s+para\s+(matarme|suicidarme|morir)\b/,
  },
  {
    id: 'violence-first-person-intent',
    category: 'violence',
    pattern: /\b(quiero|voy a|planeo|pienso)\s+(matar|herir|hacerle dano)\s+a\b/,
  },
  {
    id: 'violence-immediate-weapon',
    category: 'violence',
    pattern: /\b(tengo|llevo)\s+(un arma|una pistola|un cuchillo)\s+para\s+(matar|herir|atacar)\b/,
  },
];

const supportRules: readonly SafetyRule[] = [
  {
    id: 'self-harm-sensitive-mention',
    category: 'self_harm',
    pattern: /\b(suicid|autolesi|hacerme dano|quitarse la vida|matarme|matarse)\w*\b/,
  },
  {
    id: 'abuse-disclosure',
    category: 'abuse',
    pattern: /\b(me pega|me golpea|me amenaza|abuso de mi|abusaron de mi|violencia en casa)\b/,
  },
  {
    id: 'hate-threat',
    category: 'hate',
    pattern: /\b(matar|atacar|expulsar)\s+a\s+(todos|todas)\s+los\b/,
  },
  {
    id: 'sexual-safety',
    category: 'sexual_safety',
    pattern: /\b(abuso sexual|agresion sexual|me obligo a tener relaciones|explotacion sexual)\b/,
  },
];

const negatedFirstPersonSelfHarm =
  /\b(no|nunca)\s+((quiero|voy a|planeo|pienso)\s+(matarme|suicidarme|quitarme la vida)|me\s+(quiero|voy a|pienso)\s+(matar|suicidar))\b/;

export function normalizeSafetyText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function moderateReflectionInput(note: string): SafetyDecision {
  const normalized = normalizeSafetyText(note);
  if (!normalized) {
    return { category: 'none', level: 'standard', canGenerateReflection: true, matchedRule: null };
  }

  const excludesFirstPersonIntent = negatedFirstPersonSelfHarm.test(normalized);
  for (const rule of urgentRules) {
    if (
      rule.pattern.test(normalized) &&
      !(
        (rule.id === 'self-harm-first-person-intent' ||
          rule.id === 'self-harm-reflexive-intent') &&
        excludesFirstPersonIntent
      )
    ) {
      return {
        category: rule.category,
        level: 'urgent',
        canGenerateReflection: false,
        matchedRule: rule.id,
      };
    }
  }

  for (const rule of supportRules) {
    if (rule.pattern.test(normalized)) {
      return {
        category: rule.category,
        level: 'support',
        canGenerateReflection: false,
        matchedRule: rule.id,
      };
    }
  }

  return { category: 'none', level: 'standard', canGenerateReflection: true, matchedRule: null };
}
