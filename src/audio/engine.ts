import { createKit, createSpace, type Rand } from './kit';
import { RECIPES, type Recipe } from './recipes';

/**
 * Plays and renders the letter sounds. Nothing is pre-recorded: each sound is
 * rebuilt from its recipe on every play, so it varies a little each time.
 * The AudioContext is created on the first play, inside a user gesture.
 */

let live: { ctx: AudioContext; out: AudioNode } | null = null;

/**
 * Master bus: a gentle tanh soft clipper instead of a compressor, which would
 * squash single drops and knocks and flatten their natural dynamics.
 */
function master(ctx: BaseAudioContext): AudioNode {
  const curve = new Float32Array(1024);
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * 1.2) / Math.tanh(1.2);
  }
  const clipper = ctx.createWaveShaper();
  clipper.curve = curve;
  clipper.oversample = '2x';
  const gain = ctx.createGain();
  gain.gain.value = 0.9;
  gain.connect(clipper).connect(ctx.destination);
  return gain;
}

function liveContext() {
  if (!live) {
    const ctx = new AudioContext();
    live = { ctx, out: master(ctx) };
  }
  if (live.ctx.state === 'suspended') void live.ctx.resume();
  return live;
}

export function recipeOf(letter: string): Recipe {
  const recipe = RECIPES[letter];
  if (!recipe) throw new Error(`No recipe for “${letter}”`);
  return recipe;
}

function schedule(ctx: BaseAudioContext, out: AudioNode, recipe: Recipe, t0: number, rand: Rand): void {
  const loudness = ctx.createGain();
  loudness.gain.value = recipe.gain ?? 1;
  loudness.connect(out);
  const input = createSpace(ctx, loudness, recipe.space, recipe.send);
  recipe.play(createKit(ctx, input, t0, rand));
}

/** Plays a letter's sound and returns how long it lasts, in seconds. */
export function playLetter(letter: string): number {
  const recipe = recipeOf(letter);
  const { ctx, out } = liveContext();
  schedule(ctx, out, recipe, ctx.currentTime + 0.03, Math.random);
  return recipe.duration;
}

/** Deterministic PRNG so rendered waveforms are stable between visits. */
function mulberry32(seed: number): Rand {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Renders a letter's sound offline (mono) for drawing its real waveform. */
export async function renderLetter(letter: string, sampleRate = 22050): Promise<Float32Array> {
  const recipe = recipeOf(letter);
  const length = Math.ceil((recipe.duration + 0.3) * sampleRate);
  const ctx = new OfflineAudioContext(1, length, sampleRate);
  schedule(ctx, master(ctx), recipe, 0.01, mulberry32(letter.charCodeAt(0) * 7919));
  const buffer = await ctx.startRendering();
  return buffer.getChannelData(0);
}
