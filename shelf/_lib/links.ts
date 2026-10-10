export const CATEGORIES = ['fashion', 'food', 'travel', 'tech', 'news', 'health', 'home', 'other'] as const;
export type Category = (typeof CATEGORIES)[number];

export function normaliseCategory(value: string | null | undefined): Category {
  return (CATEGORIES as readonly string[]).includes(value ?? '') ? (value as Category) : 'other';
}

// Links come from other people's pages and from anything pasted into the app,
// so only plain web links are ever allowed to become a clickable href.
// This blocks javascript:, data:, file: and similar.
export function safeHref(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null;
  } catch {
    return null;
  }
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export type UrlCheck = { ok: true; url: string } | { ok: false; reason: 'empty' | 'invalid' };

// Accepts "example.com/page" as well as "https://example.com/page".
// A full address is kept exactly as typed, matching how the app stores links.
export function normaliseUrl(input: string): UrlCheck {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, reason: 'empty' };
  if (/\s/.test(trimmed)) return { ok: false, reason: 'invalid' };

  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed);
  const candidate = hasScheme ? trimmed : 'https://' + trimmed;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return { ok: false, reason: 'invalid' };
    if (!parsed.hostname.includes('.')) return { ok: false, reason: 'invalid' };
    return { ok: true, url: candidate };
  } catch {
    return { ok: false, reason: 'invalid' };
  }
}
