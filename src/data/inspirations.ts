import type { Direction } from './alphabet';
import { catenary, chimneys, ironLeaves, panot, rose, trencadis } from '../lib/illustrations';

export interface Inspiration {
  id: string;
  title: string;
  place: string;
  structure: string;
  letterform: string;
  /** Text set in Lio to show the matching letterforms. */
  sample: string;
  direction: Direction | 'all';
  illustration: () => string;
}

export const INSPIRATIONS: readonly Inspiration[] = [
  {
    id: 'catenary',
    title: 'Catenary arch',
    place: 'Casa Milà attic · Antoni Gaudí',
    structure:
      'Gaudí hung chains loaded with small weights and turned the curve upside down. What hangs in pure tension stands in pure compression.',
    letterform:
      'Sky letters are drawn the same way: the stroke is pulled up from the thread and tapers to a point, all of it balanced on one stem.',
    sample: 'bdhk',
    direction: 'sky',
    illustration: catenary,
  },
  {
    id: 'chimneys',
    title: 'Rooftop chimneys',
    place: 'La Pedrera · Antoni Gaudí',
    structure:
      'The chimneys on the roof twist as they climb and finish in a crest, like a row of helmeted guards watching the city.',
    letterform:
      'The ascenders of f, k and t turn on themselves before ending, so every sky letter has its own small crest.',
    sample: 'tfl',
    direction: 'sky',
    illustration: chimneys,
  },
  {
    id: 'panot',
    title: 'Hexagonal panot',
    place: 'Passeig de Gràcia · Antoni Gaudí',
    structure:
      'A paving tile of shells, starfish and algae. Laid edge to edge, it turns a whole avenue into one slow pattern of sea.',
    letterform:
      'Grass letters share that pulse. They hold the same height on the baseline and repeat without effort, like tiles.',
    sample: 'waves',
    direction: 'grass',
    illustration: panot,
  },
  {
    id: 'rose',
    title: 'Stained-glass rose',
    place: 'Palau de la Música Catalana · Lluís Domènech i Montaner',
    structure:
      'Petals of coloured glass held in lead lines. The frame is as much a drawing as the glass inside it.',
    letterform:
      'The counters of o, e and r are leaf shapes caught in a frame. Light passes through the middle of each letter.',
    sample: 'rose',
    direction: 'grass',
    illustration: rose,
  },
  {
    id: 'iron',
    title: 'Wrought-iron leaves',
    place: 'Casa Vicens gate · Antoni Gaudí',
    structure:
      'Palm leaves cast in iron curl away from a single stem, and the gate becomes a plant again.',
    letterform:
      'Root letters hang from the thread the same way. They drop, curl and turn back towards the line they came from.',
    sample: 'gjpqy',
    direction: 'root',
    illustration: ironLeaves,
  },
  {
    id: 'trencadis',
    title: 'Trencadís',
    place: 'Park Güell · Antoni Gaudí & Josep Maria Jujol',
    structure:
      'Broken tiles and plates, pieced together into one shining skin that can follow any curve.',
    letterform:
      'Lio is built the same way. Small, simple pieces (leaf, bud, thorn, tendril) are joined into one continuous line.',
    sample: 'tiles',
    direction: 'all',
    illustration: trencadis,
  },
] as const;
