import type { SaveRow } from './types';
import { normaliseCategory } from './links';

// Same matching as the ShelfIt app: every word must match somewhere in the
// title, summary, address or category, and small typos are forgiven.

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] =
        a[i - 1] === b[j - 1]
          ? matrix[i - 1][j - 1]
          : 1 + Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1]);
    }
  }
  return matrix[a.length][b.length];
}

function fuzzyIncludes(text: string, searchWord: string): boolean {
  if (text.includes(searchWord)) return true;
  if (searchWord.length < 4) return false;

  const maxDistance = searchWord.length <= 6 ? 1 : 2;
  for (const word of text.split(/\s+/)) {
    if (levenshteinDistance(word, searchWord) <= maxDistance) return true;
    if (word.length > searchWord.length) {
      for (let len = searchWord.length - 1; len <= searchWord.length + 1; len++) {
        for (let start = 0; start + len <= word.length; start++) {
          if (levenshteinDistance(word.slice(start, start + len), searchWord) <= maxDistance) return true;
        }
      }
    }
  }
  return false;
}

export function matchesQuery(save: SaveRow, query: string): boolean {
  if (!query.trim()) return true;
  const words = query.toLowerCase().trim().split(/\s+/);
  const haystack = [save.links?.title, save.links?.ai_summary, save.links?.url, save.links?.ai_category]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return words.every((word) => fuzzyIncludes(haystack, word));
}

export function filterSaves(saves: SaveRow[], category: string, query: string): SaveRow[] {
  return saves.filter((save) => {
    if (!save.links) return false;
    if (category !== 'all' && normaliseCategory(save.links.ai_category) !== category) return false;
    return matchesQuery(save, query);
  });
}
