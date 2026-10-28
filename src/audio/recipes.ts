import type { Kit, Space } from './kit';

/**
 * One procedural recipe per letter. Times are in seconds from the start of
 * the sound; every call to the kit's random functions makes each play unique.
 */
export interface Recipe {
  /** Length of the dry sound in seconds (reverb tails ring past it). */
  duration: number;
  space: Space;
  /** Reverb send, 0–1. */
  send: number;
  /** Loudness calibration so every letter plays at a similar level. */
  gain?: number;
  play(k: Kit): void;
}

/** Picks `count` times in [from, to], denser where `envelope` is higher. */
function times(k: Kit, count: number, from: number, to: number, envelope: number[] = [1]): number[] {
  const out: number[] = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 50) {
    const x = k.rand();
    const pos = x * (envelope.length - 1);
    const i = Math.floor(pos);
    const a = envelope[i] ?? 0;
    const b = envelope[Math.min(i + 1, envelope.length - 1)] ?? 0;
    if (k.rand() <= a + (b - a) * (pos - i)) out.push(from + x * (to - from));
  }
  return out.sort((p, q) => p - q);
}

/** Leaf, grass and seed contact: many tiny grains. */
function rustle(k: Kit, count: number, from: number, to: number, envelope: number[], band: [number, number], level = 0.12) {
  for (const at of times(k, count, from, to, envelope)) {
    k.grain({
      at,
      freq: k.logBetween(...band),
      q: k.between(0.8, 2.5),
      dur: k.between(0.003, 0.02),
      level: level * k.between(0.3, 1),
      pan: k.between(-0.6, 0.6),
    });
  }
}

/** Stones and pebbles have bright, inharmonic, quickly damped modes. */
function stoneModes(k: Kit, base: number, decay = 0.04): Array<[number, number, number]> {
  return [
    [base * k.between(0.95, 1.05), decay * 1.4, 1],
    [base * k.between(2.0, 2.2), decay, 0.7],
    [base * k.between(3.0, 3.3), decay * 0.75, 0.5],
    [base * k.between(4.4, 4.7), decay * 0.55, 0.35],
  ];
}

export const RECIPES: Record<string, Recipe> = {
  /* ---------- Sky · air ---------- */

  b: {
    duration: 2.2,
    space: 'open',
    send: 0.25,
    gain: 1.9,
    play(k) {
      k.noise({ dur: 2.2, color: 'pink', freq: [300, 650, 1100, 800, 450], q: 1.1, gain: [0, 0.4, 0.9, 1, 0.6, 0.25, 0], level: 1.1, flutter: 0.5 });
      k.noise({ dur: 2.2, color: 'brown', filter: 'lowpass', freq: [250, 450, 350], gain: [0, 0.5, 0.8, 0.4, 0], level: 0.5, flutter: 0.4 });
    },
  },
  d: {
    duration: 2.4,
    space: 'open',
    send: 0.25,
    gain: 2.6,
    play(k) {
      k.noise({ dur: 2.4, color: 'pink', freq: [250, 400, 700, 1100, 1500], q: 0.9, gain: [0, 0.25, 0.5, 0.8, 1, 0.6, 0], level: 1.1, flutter: 0.45 });
      k.noise({ dur: 2.4, color: 'white', filter: 'highpass', freq: [3000, 5000], gain: [0, 0.1, 0.3, 0.5, 0], level: 0.08, flutter: 0.5 });
    },
  },
  f: {
    duration: 2.4,
    space: 'open',
    send: 0.2,
    gain: 3.2,
    play(k) {
      const gust = [0, 0.6, 1, 0.5, 0.9, 0.4, 0];
      k.noise({ dur: 2.4, color: 'pink', freq: [350, 600, 450, 700, 400], q: 0.9, gain: gust, level: 0.9, flutter: 0.5 });
      rustle(k, 160, 0, 2.3, gust, [3000, 7000], 0.1);
    },
  },
  h: {
    duration: 1.3,
    space: 'open',
    send: 0.2,
    gain: 1.15,
    play(k) {
      for (const at of [0, 0.55]) {
        k.noise({ at, dur: 0.45, color: 'pink', freq: [500, 1200, 400], q: 0.7, gain: [0, 1, 0.35, 0], level: 1.3 });
        k.noise({ at, dur: 0.3, color: 'brown', filter: 'lowpass', freq: 180, gain: [0, 1, 0], level: 0.8 });
      }
    },
  },
  k: {
    duration: 2.6,
    space: 'open',
    send: 0.3,
    gain: 2,
    play(k) {
      const swell = [0, 0.35, 0.8, 1, 0.75, 0.35, 0];
      k.noise({ dur: 2.6, color: 'pink', freq: [415, 440, 460, 430, 405], q: 16, gain: swell, level: 4, flutter: 0.35 });
      k.noise({ dur: 2.6, color: 'pink', freq: [640, 660, 650], q: 20, gain: swell, level: 1.6, flutter: 0.4 });
      k.noise({ dur: 2.6, color: 'pink', filter: 'lowpass', freq: [500, 800, 600], gain: swell, level: 0.35, flutter: 0.5 });
    },
  },
  l: {
    duration: 2.2,
    space: 'open',
    send: 0.3,
    gain: 1.2,
    play(k) {
      const swell = [0, 0.3, 0.75, 1, 0.8, 0.4, 0];
      k.noise({ dur: 2.2, color: 'white', freq: [900, 950, 1010, 985, 940], q: 40, gain: swell, level: 6, flutter: 0.3 });
      k.noise({ dur: 2.2, color: 'pink', filter: 'highpass', freq: 1800, gain: swell, level: 0.06, flutter: 0.5 });
    },
  },
  t: {
    duration: 2.8,
    space: 'forest',
    send: 0.3,
    gain: 1.5,
    play(k) {
      const roar = [0, 0.45, 0.85, 1, 0.8, 0.9, 0.5, 0];
      k.noise({ dur: 2.8, color: 'pink', freq: [500, 800, 650, 900, 600], q: 0.6, gain: roar, level: 0.9, flutter: 0.45 });
      k.noise({ dur: 2.8, color: 'brown', filter: 'lowpass', freq: 120, gain: [0, 0.6, 1, 0.6, 0], level: 0.6 });
      rustle(k, 260, 0, 2.7, roar, [2500, 6000], 0.07);
    },
  },

  /* ---------- Grass · water, leaves, seeds ---------- */

  a: {
    duration: 3.0,
    space: 'open',
    send: 0.25,
    gain: 0.9,
    play(k) {
      k.noise({ dur: 3.0, color: 'brown', filter: 'lowpass', freq: [300, 900, 1800, 1200, 600, 300], q: 0.5, gain: [0, 0.4, 0.9, 1, 0.7, 0.4, 0.15, 0], level: 1.2, flutter: 0.25 });
      k.noise({ at: 0.7, dur: 2.0, color: 'white', freq: [4000, 6000, 4500], q: 0.7, gain: [0, 1, 0.6, 0.3, 0], level: 0.12, flutter: 0.4 });
      for (const at of times(k, 45, 0.9, 2.6, [1, 0.6, 0.3])) {
        k.bubble({ at, freq: k.logBetween(2000, 6000), level: k.between(0.01, 0.04), rise: 0.2, pan: k.between(-0.7, 0.7) });
      }
    },
  },
  c: {
    duration: 1.8,
    space: 'forest',
    send: 0.2,
    gain: 2.3,
    play(k) {
      for (const at of times(k, 32, 0, 1.7)) {
        k.grain({ at, freq: k.logBetween(2000, 5000), q: 2, dur: 0.006, level: k.between(0.05, 0.18), pan: k.between(-0.7, 0.7) });
        if (k.rand() < 0.4) k.bubble({ at: at + 0.004, freq: k.logBetween(1500, 3500), level: k.between(0.04, 0.12), rise: 0.5, pan: k.between(-0.5, 0.5) });
      }
      // One big drop strikes the leaf.
      k.grain({ at: 0.45, freq: 2500, q: 0.8, dur: 0.012, level: 0.4 });
      k.bubble({ at: 0.452, freq: 1800, level: 0.35, rise: 0.9, dur: 0.09 });
    },
  },
  e: {
    duration: 1.3,
    space: 'forest',
    send: 0.18,
    gain: 0.95,
    play(k) {
      // Dry pod creaks under tension, then splits.
      rustle(k, 18, 0, 0.18, [0.3, 1], [800, 2000], 0.05);
      k.knock({ at: 0.2, modes: [[1800, 0.03, 1], [2900, 0.02, 0.7], [4200, 0.012, 0.5]], level: 0.45, click: 1 });
      // Seeds scatter and bounce.
      for (const at of times(k, 22, 0.24, 1.2, [1, 0.6, 0.25, 0.1])) {
        k.knock({ at, modes: [[k.logBetween(4000, 7000), 0.012, 1]], level: k.between(0.04, 0.12), click: 0.6, pan: k.between(-0.7, 0.7) });
      }
    },
  },
  i: {
    duration: 0.9,
    space: 'open',
    send: 0.35,
    gain: 1.85,
    play(k) {
      k.grain({ at: 0, freq: 6000, q: 1, dur: 0.003, level: 0.06 });
      k.bubble({ at: 0.004, freq: k.between(2400, 2800), dur: 0.08, rise: 0.9, level: 0.45 });
    },
  },
  m: {
    duration: 2.6,
    space: 'open',
    send: 0.2,
    gain: 4,
    play(k) {
      k.noise({ dur: 2.6, color: 'pink', freq: 900, q: 0.6, gain: [0, 0.7, 1, 1, 0.8, 0], level: 0.12, flutter: 0.3 });
      for (const at of times(k, 150, 0, 2.5, [0.3, 1, 1, 1, 0.4])) {
        k.bubble({ at, freq: k.logBetween(400, 2500), dur: k.between(0.02, 0.07), rise: k.between(0.1, 0.4), level: k.between(0.03, 0.14), pan: k.between(-0.8, 0.8) });
      }
    },
  },
  n: {
    duration: 2.6,
    space: 'open',
    send: 0.15,
    gain: 12,
    play(k) {
      const steady = [0, 0.8, 1, 1, 0.9, 0];
      k.noise({ dur: 2.6, color: 'pink', filter: 'highpass', freq: 3000, gain: steady, level: 0.08, flutter: 0.3 });
      rustle(k, 360, 0, 2.5, steady, [3000, 9000], 0.07);
      for (const at of times(k, 25, 0.1, 2.4, steady)) k.bubble({ at, freq: k.logBetween(2500, 5000), level: 0.03, rise: 0.4, pan: k.between(-0.8, 0.8) });
    },
  },
  o: {
    duration: 2.4,
    space: 'forest',
    send: 0.15,
    gain: 9,
    play(k) {
      const gusts = [0, 0.7, 0.25, 1, 0.45, 0.8, 0];
      k.noise({ dur: 2.4, color: 'pink', freq: 1500, q: 0.7, gain: gusts, level: 0.15, flutter: 0.5 });
      for (const at of times(k, 230, 0, 2.3, gusts)) {
        k.grain({ at, freq: k.logBetween(2000, 7000), q: k.between(1, 3), dur: k.between(0.005, 0.03), level: k.between(0.03, 0.14), pan: k.between(-0.8, 0.8) });
      }
    },
  },
  r: {
    duration: 1.0,
    space: 'open',
    send: 0.15,
    gain: 2.3,
    play(k) {
      k.noise({ dur: 0.6, color: 'white', freq: [1200, 4000, 6500, 3000], q: 1.4, gain: [0, 0.6, 1, 0.3, 0], level: 0.5 });
      rustle(k, 40, 0.05, 0.55, [0.2, 1, 0.4], [2500, 7000], 0.1);
    },
  },
  s: {
    duration: 1.1,
    space: 'forest',
    send: 0.12,
    gain: 5.5,
    play(k) {
      for (const start of [0, 0.48]) {
        for (const at of times(k, 45, start, start + 0.22, [1, 0.8, 0.3])) {
          k.grain({ at, freq: k.logBetween(3000, 8000), q: 3, dur: k.between(0.002, 0.006), level: k.between(0.05, 0.16), pan: k.between(-0.4, 0.4) });
        }
        for (const at of times(k, 6, start, start + 0.2)) {
          k.knock({ at, modes: [[k.logBetween(2500, 4000), 0.02, 1], [k.logBetween(5000, 7000), 0.01, 0.5]], level: 0.07, click: 0.3 });
        }
      }
    },
  },
  u: {
    duration: 1.4,
    space: 'open',
    send: 0.22,
    gain: 1.5,
    play(k) {
      k.noise({ dur: 0.18, color: 'white', freq: 1500, q: 0.7, gain: [1, 0.5, 0.1, 0], level: 0.5 });
      k.bubble({ at: 0.01, freq: 450, dur: 0.12, rise: 0.8, level: 0.25 });
      for (const at of times(k, 14, 0.05, 0.6, [1, 0.5, 0.2])) {
        k.bubble({ at, freq: k.logBetween(600, 2000), level: k.between(0.04, 0.15), rise: 0.5, pan: k.between(-0.6, 0.6) });
      }
    },
  },
  v: {
    duration: 1.5,
    space: 'open',
    send: 0.25,
    gain: 1.4,
    play(k) {
      k.noise({ dur: 0.4, color: 'white', filter: 'lowpass', freq: [5000, 2500, 1500], gain: [1, 0.6, 0.2, 0], level: 0.45 });
      k.bubble({ at: 0.01, freq: 600, dur: 0.1, rise: 0.6, level: 0.2 });
      // Spray falls back as droplets.
      for (const at of times(k, 30, 0.3, 1.4, [0.4, 1, 0.6, 0.2])) {
        k.bubble({ at, freq: k.logBetween(1500, 4000), level: k.between(0.03, 0.12), rise: 0.6, pan: k.between(-0.8, 0.8) });
      }
    },
  },
  w: {
    duration: 2.8,
    space: 'open',
    send: 0.2,
    gain: 1.55,
    play(k) {
      const flow = [0, 0.7, 1, 1, 0.9, 0.6, 0];
      k.noise({ dur: 2.8, color: 'pink', freq: [500, 560, 520], q: 0.8, gain: flow, level: 0.7, flutter: 0.2 });
      k.noise({ dur: 2.8, color: 'brown', filter: 'lowpass', freq: 220, gain: flow, level: 0.5 });
      for (const at of times(k, 22, 0.1, 2.6, flow)) {
        k.bubble({ at, freq: k.logBetween(400, 1200), dur: k.between(0.05, 0.12), rise: 0.2, level: k.between(0.03, 0.08), pan: k.between(-0.6, 0.6) });
      }
    },
  },
  x: {
    duration: 1.5,
    space: 'open',
    send: 0.25,
    gain: 1.75,
    play(k) {
      k.bubble({ at: 0, freq: 380, dur: 0.3, rise: 1.3, level: 0.45 });
      k.bubble({ at: 0.6, freq: 900, dur: 0.05, rise: 1.5, level: 0.3 });
      k.grain({ at: 0.6, freq: 4000, q: 0.7, dur: 0.01, level: 0.25 });
      for (const at of times(k, 10, 0.62, 1.1, [1, 0.3])) {
        k.bubble({ at, freq: k.logBetween(2500, 6000), level: k.between(0.02, 0.06), rise: 0.3, pan: k.between(-0.5, 0.5) });
      }
    },
  },
  z: {
    duration: 1.4,
    space: 'open',
    send: 0.3,
    gain: 1.8,
    play(k) {
      k.grain({ at: 0, freq: 6000, dur: 0.003, level: 0.05 });
      k.bubble({ at: 0.003, freq: k.between(1850, 1950), dur: 0.1, rise: 0.8, level: 0.4 });
      k.grain({ at: 0.58, freq: 5000, dur: 0.003, level: 0.05 });
      k.bubble({ at: 0.583, freq: k.between(1300, 1400), dur: 0.13, rise: 0.8, level: 0.45 });
    },
  },

  /* ---------- Root · stone, earth, wood ---------- */

  g: {
    duration: 2.0,
    space: 'forest',
    send: 0.2,
    gain: 1.2,
    play(k) {
      k.noise({ dur: 2.0, color: 'brown', filter: 'lowpass', freq: [200, 320, 250], gain: [0, 0.6, 1, 0.7, 0.3, 0], level: 0.9, flutter: 0.4 });
      for (const at of times(k, 30, 0.05, 1.8, [0.4, 1, 0.8, 0.3])) {
        k.grain({ at, freq: k.logBetween(300, 1200), q: 2, dur: k.between(0.005, 0.03), level: k.between(0.05, 0.2), pan: k.between(-0.5, 0.5) });
      }
      for (const at of times(k, 6, 0.2, 1.6)) {
        k.knock({ at, modes: [[220, 0.06, 1], [530, 0.04, 0.6], [870, 0.03, 0.4]], level: k.between(0.12, 0.25), click: 0.4, pan: k.between(-0.4, 0.4) });
      }
    },
  },
  j: {
    duration: 2.2,
    space: 'cave',
    send: 0.85,
    gain: 1.85,
    play(k) {
      k.noise({ dur: 2.2, color: 'brown', filter: 'lowpass', freq: 90, gain: [0, 0.5, 0.6, 0.5, 0], level: 0.3 });
      [
        [0, 1250],
        [0.85, 950],
        [1.55, 1150],
      ].forEach(([at, freq]) => {
        k.bubble({ at: at!, freq: freq! * k.between(0.97, 1.03), dur: 0.12, rise: 0.7, level: 0.4, pan: k.between(-0.3, 0.3) });
      });
    },
  },
  p: {
    duration: 1.1,
    space: 'open',
    send: 0.25,
    gain: 1.2,
    play(k) {
      k.knock({ at: 0, modes: stoneModes(k, 1300, 0.04), level: 0.35, click: 0.9, pan: -0.15 });
      k.knock({ at: 0.3, modes: stoneModes(k, 1450, 0.035), level: 0.3, click: 0.9, pan: 0.15 });
      k.knock({ at: 0.45, modes: stoneModes(k, 1500, 0.025), level: 0.1, click: 0.6, pan: 0.2 });
    },
  },
  q: {
    duration: 1.8,
    space: 'open',
    send: 0.3,
    gain: 1.1,
    play(k) {
      k.noise({ dur: 0.12, color: 'white', filter: 'lowpass', freq: [2500, 1200], gain: [1, 0.4, 0], level: 0.4 });
      k.bubble({ at: 0.02, freq: 260, dur: 0.32, rise: 1.2, level: 0.55 });
      for (const at of times(k, 12, 0.25, 1.4, [1, 0.6, 0.3, 0.1])) {
        k.bubble({ at, freq: k.logBetween(500, 1500), level: k.between(0.03, 0.1), rise: 0.6, pan: k.between(-0.5, 0.5) });
      }
    },
  },
  y: {
    duration: 2.6,
    space: 'cave',
    send: 0.3,
    gain: 0.9,
    play(k) {
      k.noise({ dur: 1.2, color: 'brown', filter: 'lowpass', freq: [260, 150], gain: [1, 0.6, 0.25, 0], level: 1.4 });
      k.knock({ at: 0, modes: [[180, 0.18, 1], [410, 0.12, 0.6], [760, 0.07, 0.4]], level: 0.45, click: 0.8 });
      // Pebbles break away and tumble, faster and quieter as they settle.
      const pebbles = times(k, 45, 0.08, 2.4, [1, 0.8, 0.5, 0.3, 0.15]);
      pebbles.forEach((at, i) => {
        k.knock({ at, modes: stoneModes(k, k.logBetween(1500, 3200), 0.02), level: 0.18 * (1 - (i / pebbles.length) * 0.8) * k.between(0.4, 1), click: 0.7, pan: k.between(-0.8, 0.8) });
      });
      rustle(k, 80, 0.05, 1.6, [1, 0.5, 0.2], [1500, 5000], 0.06);
    },
  },
};
