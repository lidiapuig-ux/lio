import { directionOf, type Direction } from '../data/alphabet';

/** Lio ships lowercase a–z and the space; everything else has to be folded into that set. */
const SUPPORTED = /[a-z \n]/;

export interface NormalizedText {
  text: string;
  /** Distinct characters that could not be represented and were dropped. */
  dropped: string[];
}

/**
 * Folds arbitrary input into the glyph set Lio can draw:
 * lowercases, strips diacritics (à → a, ç → c, l·l → ll) and drops the rest.
 */
export function normalizeForLio(input: string): NormalizedText {
  const dropped = new Set<string>();
  let text = '';

  for (const char of input.replace(/\r\n?/g, '\n')) {
    const folded = char
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();

    for (const c of folded) {
      if (SUPPORTED.test(c)) text += c;
      else if (c === '\t') text += ' ';
      else if (c !== '·' && c.trim() !== '') dropped.add(char);
    }
  }

  // Dropped punctuation leaves gaps behind ("gaudí & co" → "gaudi  co"); close them up.
  text = text.replace(/ {2,}/g, ' ').replace(/ +$/gm, '');

  return { text, dropped: [...dropped] };
}

export type DirectionCounts = Record<Direction, number>;

export function countDirections(text: string): DirectionCounts {
  const counts: DirectionCounts = { sky: 0, grass: 0, root: 0 };
  for (const c of text) {
    const dir = directionOf(c);
    if (dir) counts[dir] += 1;
  }
  return counts;
}

/**
 * Splits text into runs of the same direction so it can be coloured
 * without wrapping every glyph in its own element.
 */
export function directionRuns(text: string): Array<{ dir: Direction | null; text: string }> {
  const runs: Array<{ dir: Direction | null; text: string }> = [];
  for (const c of text) {
    const dir = directionOf(c) ?? null;
    const last = runs.at(-1);
    if (last && last.dir === dir) last.text += c;
    else runs.push({ dir, text: c });
  }
  return runs;
}
