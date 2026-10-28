/**
 * Lio sorts the lowercase alphabet into three growth directions,
 * following the classroom model of sky, grass and root letters.
 */
export type Direction = 'sky' | 'grass' | 'root';

export interface DirectionInfo {
  id: Direction;
  name: string;
  verb: string;
  description: string;
  letters: readonly string[];
}

export const DIRECTIONS: readonly DirectionInfo[] = [
  {
    id: 'sky',
    name: 'Sky letters',
    verb: 'Vertical growth',
    description:
      'Ascenders rise from the thread like shoots towards light, tapering to a point the way a spire or chimney finishes against the sky.',
    letters: ['b', 'd', 'f', 'h', 'k', 'l', 't'],
  },
  {
    id: 'grass',
    name: 'Grass letters',
    verb: 'Develop on the baseline',
    description:
      'The body of the alphabet. Buds, leaves and seeds swell along the baseline and keep the line moving forward, close to the ground.',
    letters: ['a', 'c', 'e', 'i', 'm', 'n', 'o', 'r', 's', 'u', 'v', 'w', 'x', 'z'],
  },
  {
    id: 'root',
    name: 'Root letters',
    verb: 'Downwards like roots',
    description:
      'Descenders drop beneath the line and curl like roots looking for water, anchoring each word to the ground it grows from.',
    letters: ['g', 'j', 'p', 'q', 'y'],
  },
] as const;

export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

const directionByLetter = new Map<string, Direction>(
  DIRECTIONS.flatMap((d) => d.letters.map((l) => [l, d.id] as const)),
);

export function directionOf(letter: string): Direction | undefined {
  return directionByLetter.get(letter);
}
