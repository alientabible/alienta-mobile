export type SupportResource = {
  id: 'emergency' | 'emotional-support' | 'official-directory' | 'trusted-person';
  kind: 'phone' | 'url' | 'instruction';
  label: string;
  href?: string;
};

export type SupportResourcePlan = {
  region: string;
  resources: readonly SupportResource[];
};

const colombiaPlan: SupportResourcePlan = {
  region: 'CO',
  resources: [
    { id: 'emergency', kind: 'phone', label: 'Emergencias — 123', href: 'tel:123' },
    {
      id: 'emotional-support',
      kind: 'phone',
      label: 'Línea 106 — donde esté disponible',
      href: 'tel:106',
    },
    {
      id: 'official-directory',
      kind: 'url',
      label: 'Directorio oficial de salud mental de Colombia',
      href: 'https://www.minsalud.gov.co/sites/rid/Lists/BibliotecaDigital/RIDE/VS/PP/ET/directorio-salud-mental-prevencion-suicidio-minsalud.pdf',
    },
    {
      id: 'trusted-person',
      kind: 'instruction',
      label: 'Permanece con una persona de confianza y cuéntale lo que está pasando.',
    },
  ],
};

const fallbackPlan: SupportResourcePlan = {
  region: 'GLOBAL',
  resources: [
    {
      id: 'emergency',
      kind: 'instruction',
      label: 'Contacta ahora al servicio de emergencias de tu país si existe peligro inmediato.',
    },
    {
      id: 'trusted-person',
      kind: 'instruction',
      label: 'Permanece con una persona de confianza y cuéntale lo que está pasando.',
    },
  ],
};

export function getSupportResourcePlan(countryCode: string | undefined): SupportResourcePlan {
  return countryCode?.toUpperCase() === 'CO' ? colombiaPlan : fallbackPlan;
}

export function getSupportResource(
  plan: SupportResourcePlan,
  id: SupportResource['id'],
): SupportResource | null {
  return plan.resources.find((resource) => resource.id === id) ?? null;
}
