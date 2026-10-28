import type { Direction } from './alphabet';

/**
 * Every Lio glyph is paired with a natural sound made of one material:
 * sky letters are air, grass letters are water, leaves and seeds, root
 * letters are stone, earth and wood. Read left to right, the glyph outline
 * behaves like the sound: a lens is a swell, a hook is a gust that turns
 * back, a thorn is the instant of an impact, a fork is a split.
 *
 * The audio itself is synthesised procedurally (see src/audio/recipes.ts)
 * from physical models: bubbles for water, resonant modes for stone and
 * wood, modulated filtered noise for air.
 */

export type Material = 'air' | 'water' | 'leaf' | 'seed' | 'stone' | 'earth' | 'wood';

export interface LetterSound {
  letter: string;
  direction: Direction;
  /** Materials the sound is made of, primary first. */
  materials: Material[];
  /** The organic form the glyph resembles. */
  form: string;
  /** What the outline does. */
  shape: string;
  /** The sound it is paired with. */
  sound: string;
  /** Representative frequency in Hz, used for the frequency map. */
  hz: number;
  /** Human-readable frequency content. */
  frequency: string;
  /** How the wave is built. */
  texture: string;
  /** How the shape and the sound correspond. */
  relation: string;
  sources: SourceId[];
}

export type SourceId = 'liquid' | 'rain' | 'drip' | 'modal' | 'wind' | 'aeolian' | 'procedural';

export const SOURCES: Record<SourceId, { label: string; url: string }> = {
  liquid: {
    label: 'van den Doel, “Physically-based models for liquid sounds”, ACM TAP (2005)',
    url: 'https://repository.gatech.edu/entities/publication/dcc121b6-5fdb-42db-b758-971522f01c70',
  },
  rain: {
    label: 'How do raindrops make sound underwater?, NASA Earth Observatory',
    url: 'https://earthobservatory.nasa.gov/features/Rain/rain_2.php',
  },
  drip: {
    label: 'The annoying dripping tap, Physics Today',
    url: 'https://physicstoday.aip.org/quick-study/the-annoying-dripping-tap',
  },
  modal: {
    label: 'van den Doel, Kry & Pai, “FoleyAutomatic”, SIGGRAPH (2001)',
    url: 'https://www.cs.mcgill.ca/~kry/pubs/foleyautomatic/foleyautomatic.pdf',
  },
  wind: {
    label: 'Wind flow model, Sound Design Toolkit',
    url: 'https://sdt.lim.di.unimi.it/docs/API/v2.2-078/group__windflow.html',
  },
  aeolian: {
    label: 'Aeolian tones, AMS Glossary of Meteorology',
    url: 'https://glossary.ametsoc.org/wiki/Aeolian_tones',
  },
  procedural: {
    label: 'Sound synthesis research, Centre for Digital Music, Queen Mary University of London',
    url: 'https://c4dm.eecs.qmul.ac.uk/archive/soundsynthesis/',
  },
};

/** The material family and frequency character of each direction. */
export const BANDS: Record<Direction, { element: string; range: string; character: string }> = {
  sky: {
    element: 'Air',
    range: '0.3 – 1.5 kHz, broadband',
    character: 'Wind in every form: gusts, breezes, wingbeats, a reed whistling, the roar of a canopy.',
  },
  grass: {
    element: 'Water, leaves and seeds',
    range: '0.4 – 9 kHz, bubbles and grains',
    character: 'Life at ground level: drops, streams, waves, rain on grass, rustling leaves and rattling seeds.',
  },
  root: {
    element: 'Stone, earth and wood',
    range: '0.2 – 6 kHz, low bodies and bright stone',
    character: 'What lies under the line: roots cracking, stones knocking, water falling into wells and caves.',
  },
};

export const SOUNDS: readonly LetterSound[] = [
  /* ---------- Sky · air ---------- */
  {
    letter: 'b',
    direction: 'sky',
    materials: ['air'],
    form: 'Fern crozier',
    shape: 'A stem rises from the thread and hooks back over itself.',
    sound: 'A gust that turns back',
    hz: 700,
    frequency: 'Broadband air, centre 300 Hz → 1.1 kHz → 450 Hz',
    texture: 'Pink noise in a sweeping band',
    relation: 'The gust climbs with the stem, then curls back down with the hook.',
    sources: ['wind', 'procedural'],
  },
  {
    letter: 'd',
    direction: 'sky',
    materials: ['air'],
    form: 'Frond unfurling forward',
    shape: 'The mirror of b: the stem rises and leans forward instead of back.',
    sound: 'A breeze lifting',
    hz: 900,
    frequency: 'Broadband air, centre rising 250 Hz → 1.5 kHz',
    texture: 'Pink noise in a rising band',
    relation: 'Where b turns back, d keeps going: the air lifts and carries on upward.',
    sources: ['wind'],
  },
  {
    letter: 'f',
    direction: 'sky',
    materials: ['air', 'leaf'],
    form: 'Grass blades bent by wind',
    shape: 'One stem rising, then two parallel blades swept sideways at the top.',
    sound: 'Wind combing tall grass',
    hz: 500,
    frequency: 'Air 350–700 Hz with blades ticking at 3–7 kHz',
    texture: 'Gusting noise with rustle grains',
    relation: 'Two blades swept the same way: the wind leans the grass over, twice.',
    sources: ['wind', 'procedural'],
  },
  {
    letter: 'h',
    direction: 'sky',
    materials: ['air'],
    form: 'Forked twig, a pair of wings',
    shape: 'A narrow V: the stem splits into two short arms.',
    sound: 'Two wingbeats of a heron',
    hz: 800,
    frequency: 'Two whooshes, 400 Hz – 1.2 kHz, with a soft low push',
    texture: 'Noise bursts in a falling band',
    relation: 'Two arms, two beats: each wing pushes the air once and lets it go.',
    sources: ['procedural'],
  },
  {
    letter: 'k',
    direction: 'sky',
    materials: ['air', 'stone'],
    form: 'Open tulip, a hollow',
    shape: 'The stem opens into two arms that curl outward like the lip of a hollow.',
    sound: 'Wind across a hollow stone',
    hz: 430,
    frequency: 'Cavity resonance ≈ 430 Hz and 650 Hz over broadband wind',
    texture: 'Resonant noise, narrow and breathy',
    relation: 'The open mouth of the letter is a cavity: the wind sings in it.',
    sources: ['aeolian', 'wind'],
  },
  {
    letter: 'l',
    direction: 'sky',
    materials: ['air'],
    form: 'Reed',
    shape: 'One straight hairline rising to a fine point.',
    sound: 'Wind whistling past a reed',
    hz: 960,
    frequency: '≈ 0.9–1 kHz aeolian tone (St ≈ 0.2, 2 mm reed, 10 m/s)',
    texture: 'A very narrow band of noise',
    relation: 'The thinnest stroke in Lio makes the thinnest sound: one thread of air.',
    sources: ['aeolian'],
  },
  {
    letter: 't',
    direction: 'sky',
    materials: ['air', 'leaf', 'wood'],
    form: 'Trunk and crown',
    shape: 'A narrow waist rising into a flat crown, like a trunk under its canopy.',
    sound: 'Wind in the treetops',
    hz: 700,
    frequency: 'Canopy roar 0.5–0.9 kHz, leaves 2.5–6 kHz, trunk sway below 120 Hz',
    texture: 'Noise roar with dense rustle',
    relation: 'The crown is where the wind lives: a broad roar over the steady trunk.',
    sources: ['wind', 'procedural'],
  },

  /* ---------- Grass · water, leaves, seeds ---------- */
  {
    letter: 'a',
    direction: 'grass',
    materials: ['water'],
    form: 'Seed, a wave',
    shape: 'A closed lens that swells evenly above and below the thread.',
    sound: 'A small wave on the shore',
    hz: 600,
    frequency: 'Wash 0.3–1.8 kHz, foam hiss near 5 kHz',
    texture: 'Swelling noise with fizzing bubbles',
    relation: 'The lens is the wave itself: it rises, breaks into foam and draws back.',
    sources: ['liquid'],
  },
  {
    letter: 'c',
    direction: 'grass',
    materials: ['water', 'leaf'],
    form: 'Leaf struck by rain',
    shape: 'A lens cut through by a sharp vertical thorn.',
    sound: 'Rain striking a leaf',
    hz: 3000,
    frequency: 'Drops ring at 1.5–3.5 kHz (a 1 mm bubble rings near 3.3 kHz)',
    texture: 'Noise ticks and bubble chirps',
    relation: 'The thorn through the lens is the instant a drop hits the leaf.',
    sources: ['rain', 'liquid'],
  },
  {
    letter: 'e',
    direction: 'grass',
    materials: ['seed', 'wood'],
    form: 'Seed pod',
    shape: 'A body that swells and then stops at a hard vertical edge.',
    sound: 'A seed pod cracking open',
    hz: 2900,
    frequency: 'Crack modes ≈ 1.8, 2.9 and 4.2 kHz; seeds 4–8 kHz',
    texture: 'Resonant crack with scattering grains',
    relation: 'The swelling body is the dry pod; the vertical edge is where it splits.',
    sources: ['modal'],
  },
  {
    letter: 'i',
    direction: 'grass',
    materials: ['water'],
    form: 'Bud',
    shape: 'A small lens with tiny thorns above and below its centre.',
    sound: 'A dew drop falling',
    hz: 2600,
    frequency: '≈ 2.6 kHz bubble, rising in pitch as it surfaces',
    texture: 'A single damped chirp',
    relation: 'The smallest grass letter makes the smallest water sound: one bright drop.',
    sources: ['drip', 'liquid'],
  },
  {
    letter: 'm',
    direction: 'grass',
    materials: ['water', 'stone'],
    form: 'Riverbed',
    shape: 'A full lens fed by doubled threads on both sides.',
    sound: 'A stream over pebbles',
    hz: 1100,
    frequency: 'A cloud of bubbles from 0.4 to 2.5 kHz',
    texture: 'Hundreds of tiny bubble chirps',
    relation: 'Two threads in and two threads out: water arriving and leaving, never still.',
    sources: ['liquid'],
  },
  {
    letter: 'n',
    direction: 'grass',
    materials: ['water', 'leaf'],
    form: 'Pair of grass stalks',
    shape: 'A slim lens with doubled threads, tighter than m.',
    sound: 'Light rain on grass',
    hz: 5000,
    frequency: 'Patter 3–9 kHz',
    texture: 'Dense, soft noise grains',
    relation: 'The doubled thread repeats evenly, like rain that settles into a rhythm.',
    sources: ['rain'],
  },
  {
    letter: 'o',
    direction: 'grass',
    materials: ['leaf'],
    form: 'Leaf turning in a gust',
    shape: 'A leaf tilted on the diagonal, its tips curling against the turn.',
    sound: 'Dry leaves rustling',
    hz: 4000,
    frequency: 'Crumple 2–7 kHz, arriving in gusts',
    texture: 'Clustered noise grains',
    relation: 'The diagonal twist is a gust lifting the leaves and dropping them again.',
    sources: ['procedural'],
  },
  {
    letter: 'r',
    direction: 'grass',
    materials: ['leaf'],
    form: 'Grass blade bending',
    shape: 'A blade angled sharply, as if pushed aside.',
    sound: 'A stalk swishing through grass',
    hz: 3500,
    frequency: 'Band sweeping 1.2 → 6.5 → 3 kHz',
    texture: 'Swept noise with small ticks',
    relation: 'The angled blade is the moment the grass is brushed aside.',
    sources: ['procedural'],
  },
  {
    letter: 's',
    direction: 'grass',
    materials: ['seed'],
    form: 'Seed head',
    shape: 'A lens with two fine spikes above and two below, like a seed head on its stalk.',
    sound: 'Seeds rattling in a dry pod',
    hz: 5000,
    frequency: 'Seed hits 3–8 kHz, in two shakes',
    texture: 'Bursts of grains with tiny knocks',
    relation: 'Spikes in every direction: seeds thrown against the shell from all sides.',
    sources: ['modal'],
  },
  {
    letter: 'u',
    direction: 'grass',
    materials: ['water'],
    form: 'Fish tail',
    shape: 'A lens whose thread splits into a fork where it enters.',
    sound: 'A fish flicking at the surface',
    hz: 1200,
    frequency: 'Splash ≈ 1.5 kHz, bubbles 0.6–2 kHz',
    texture: 'Noise burst with trailing bubbles',
    relation: 'The forked tail flicks once; the water answers with a scatter of bubbles.',
    sources: ['liquid'],
  },
  {
    letter: 'v',
    direction: 'grass',
    materials: ['water'],
    form: 'Splash crown',
    shape: 'A body with two leaves lifted upward, like water thrown into the air.',
    sound: 'A splash thrown upward',
    hz: 2500,
    frequency: 'Spray 1.5–4 kHz falling back',
    texture: 'Noise burst with falling droplets',
    relation: 'Two arms raised: the crown of a splash, and the drops coming down after it.',
    sources: ['liquid'],
  },
  {
    letter: 'w',
    direction: 'grass',
    materials: ['water', 'stone'],
    form: 'Water over a stone',
    shape: 'The same body as v, its arms folded down in a smooth glide.',
    sound: 'Water gliding over stone',
    hz: 520,
    frequency: 'Flow near 0.5 kHz, sparse bubbles 0.4–1.2 kHz',
    texture: 'A smooth band of noise with a few bubbles',
    relation: 'Arms down and still: water that has found its path and simply flows.',
    sources: ['liquid'],
  },
  {
    letter: 'x',
    direction: 'grass',
    materials: ['water'],
    form: 'Bubble dome',
    shape: 'A round dome with a small notch at the top.',
    sound: 'A bubble rising and breaking',
    hz: 380,
    frequency: 'Glug ≈ 380 Hz (a bubble about 9 mm across), pop ≈ 900 Hz',
    texture: 'Low bubble chirp, then a pop and fizz',
    relation: 'The dome is the bubble reaching the surface; the notch is where it breaks.',
    sources: ['liquid', 'drip'],
  },
  {
    letter: 'z',
    direction: 'grass',
    materials: ['water'],
    form: 'Two drops',
    shape: 'A small lens floating above a larger one.',
    sound: 'Drip, drip',
    hz: 1600,
    frequency: '1.9 kHz, then 1.35 kHz',
    texture: 'Two bubble chirps',
    relation: 'Small above, large below: a light drop, then a heavier one that rings lower.',
    sources: ['drip', 'liquid'],
  },

  /* ---------- Root · stone, earth, wood ---------- */
  {
    letter: 'g',
    direction: 'root',
    materials: ['earth', 'wood'],
    form: 'Root tip',
    shape: 'The body drops below the line and turns back, like a root finding its way.',
    sound: 'Roots cracking through soil',
    hz: 400,
    frequency: 'Fibres snapping ≈ 220–870 Hz, soil crumbling below 300 Hz',
    texture: 'Low crackle with woody knocks',
    relation: 'The root pushes down and turns: small snaps as it opens the ground.',
    sources: ['modal'],
  },
  {
    letter: 'j',
    direction: 'root',
    materials: ['water', 'stone'],
    form: 'Cavern',
    shape: 'A deep curl that drops and bends back under the line.',
    sound: 'Water dripping in a cave',
    hz: 1100,
    frequency: 'Drops 0.9–1.3 kHz inside a four-second stone echo',
    texture: 'Bubble chirps in a long reverb',
    relation: 'The deepest curve in the alphabet is a hollow in the rock that holds every sound.',
    sources: ['drip', 'liquid'],
  },
  {
    letter: 'p',
    direction: 'root',
    materials: ['stone'],
    form: 'Twin roots',
    shape: 'Two parallel tendrils sweeping down and away.',
    sound: 'Two river stones knocking',
    hz: 3500,
    frequency: 'Stone modes ≈ 1.3, 2.7, 4.1 and 5.9 kHz',
    texture: 'Resonant knocks',
    relation: 'Two tendrils side by side: two stones, struck together and bouncing once.',
    sources: ['modal'],
  },
  {
    letter: 'q',
    direction: 'root',
    materials: ['stone', 'water'],
    form: 'Taproot',
    shape: 'A straight, thick root dropping vertically.',
    sound: 'A stone dropped into deep water',
    hz: 260,
    frequency: 'Plunk ≈ 260 Hz from the trapped air, splash up to 2.5 kHz',
    texture: 'Splash with a deep bubble chirp',
    relation: 'Straight down: the stone falls and the water closes over it.',
    sources: ['liquid'],
  },
  {
    letter: 'y',
    direction: 'root',
    materials: ['stone', 'earth'],
    form: 'Forked root',
    shape: 'A root that splits in two at its tip.',
    sound: 'A rock splitting into pebbles',
    hz: 180,
    frequency: 'Impact ≈ 180–760 Hz, pebbles 1.5–4.5 kHz',
    texture: 'Low thud with cascading knocks',
    relation: 'The fork is the split: one heavy stone breaking into many small ones.',
    sources: ['modal'],
  },
];

const byLetter = new Map(SOUNDS.map((s) => [s.letter, s]));

export function soundOf(letter: string): LetterSound | undefined {
  return byLetter.get(letter);
}
