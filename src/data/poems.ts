/**
 * Poems written for Lio. They use only lowercase a–z and spaces,
 * the characters the typeface draws, so nothing falls back to another font.
 */
export interface Poem {
  id: string;
  title: string;
  /** Language note shown beside the title, when it is not English. */
  lang?: { code: string; label: string; translation: string };
  lines: string[];
}

export const POEMS: readonly Poem[] = [
  {
    id: 'stone-that-breathes',
    title: 'Stone that breathes',
    lines: [
      'the roof wakes up in waves',
      'the chimneys keep watch',
      'like old knights in the sun',
      'and the stone remembers',
      'it was once a hill',
    ],
  },
  {
    id: 'three-directions',
    title: 'Three directions',
    lines: [
      'some letters reach for the sky',
      'some lie down in the grass',
      'some go quietly into the dark',
      'to drink',
    ],
  },
  {
    id: 'arrel-herba-cel',
    title: 'Arrel, herba, cel',
    lang: {
      code: 'ca',
      label: 'Catalan',
      translation: 'root / grass / sky / the word grows / like a tree of light',
    },
    lines: ['arrel', 'herba', 'cel', 'la paraula creix', 'com un arbre de llum'],
  },
  {
    id: 'trencadis',
    title: 'Trencadís',
    lines: [
      'break the plate',
      'keep every piece',
      'a broken thing',
      'can still become a dragon',
      'shining on the stairs',
    ],
  },
  {
    id: 'one-thread',
    title: 'One thread',
    lines: [
      'i never lift the pen',
      'from root to leaf to light',
      'one breath',
      'one line',
      'one city growing',
    ],
  },
] as const;
