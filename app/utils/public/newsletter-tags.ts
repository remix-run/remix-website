export const newsletterTagIds = {
  jam2025Updates: 6280341,
  jam2026Updates: 19736081,
} as const;

let allowedNewsletterTagIds = new Set<number>(Object.values(newsletterTagIds));

export function isAllowedNewsletterTagId(tagId: number) {
  return Number.isSafeInteger(tagId) && allowedNewsletterTagIds.has(tagId);
}
