export type SupportedDeadlineCountry = 'US' | 'GB' | 'DE' | 'FR' | 'NL';

const DEADLINE_COUNTRY_SET: ReadonlySet<SupportedDeadlineCountry> = new Set([
  'US',
  'GB',
  'DE',
  'FR',
  'NL',
]);

export function canonicalizeCountryCode(country: string | null | undefined): string | null {
  if (!country) return null;
  const normalized = country.trim().toUpperCase();
  if (!normalized) return null;
  return normalized === 'UK' ? 'GB' : normalized;
}

export function toSupportedDeadlineCountry(
  country: string | null | undefined,
): SupportedDeadlineCountry | null {
  const canonical = canonicalizeCountryCode(country);
  if (!canonical) return null;
  return DEADLINE_COUNTRY_SET.has(canonical as SupportedDeadlineCountry)
    ? (canonical as SupportedDeadlineCountry)
    : null;
}
