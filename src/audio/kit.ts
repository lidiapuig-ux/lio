/**
 * Physical sound primitives for natural materials, built on Web Audio.
 *
 *  - noise:  coloured noise through a moving filter (wind, waves, flow, rumble)
 *  - bubble: a damped sine whose pitch rises as it nears the surface; the
 *            single-bubble model behind van den Doel's liquid sounds
 *  - grain:  a few milliseconds of filtered noise (leaves, rain, sand, seeds)
 *  - knock:  a bank of decaying resonant modes struck by a click; modal
 *            synthesis as in FoleyAutomatic (stone, wood, seed shells)
 *
 * Recipes describe a sound with these, and every value can be randomised so
 * no two plays are identical, as in nature.
 */

export type Space = 'open' | 'forest' | 'cave';
export type NoiseColor = 'white' | 'pink' | 'brown';
export type Rand = () => number;

export interface NoiseOptions {
  at?: number;
  dur: number;
  color?: NoiseColor;
  filter?: BiquadFilterType;
  /** Filter frequency in Hz, or a curve across the duration. */
  freq: number | number[];
  q?: number;
  /** Amplitude envelope across the duration, 0–1. */
  gain: number[];
  level?: number;
  pan?: number;
  /** 0–1: random slow fluctuation of level and filter, like turbulence. */
  flutter?: number;
}

export interface BubbleOptions {
  at: number;
  freq: number;
  /** Decay time in seconds; larger bubbles ring longer. */
  dur?: number;
  /** Fractional pitch rise over the decay. */
  rise?: number;
  level?: number;
  pan?: number;
}

export interface GrainOptions {
  at: number;
  freq: number;
  q?: number;
  dur?: number;
  level?: number;
  pan?: number;
  filter?: BiquadFilterType;
}

export interface KnockOptions {
  at: number;
  /** Resonant modes as [frequency Hz, decay seconds, relative amplitude]. */
  modes: Array<[number, number, number?]>;
  level?: number;
  pan?: number;
  /** Brightness of the contact click, 0–1. */
  click?: number;
}

export interface Kit {
  rand: Rand;
  between(min: number, max: number): number;
  /** Log-uniform pick, natural for frequencies. */
  logBetween(min: number, max: number): number;
  noise(o: NoiseOptions): void;
  bubble(o: BubbleOptions): void;
  grain(o: GrainOptions): void;
  knock(o: KnockOptions): void;
}

/* ---------- Shared buffers (AudioBuffers can be reused across contexts) ---------- */

const noiseCache = new Map<string, AudioBuffer>();

function noiseBuffer(sampleRate: number, color: NoiseColor): AudioBuffer {
  const key = `${color}@${sampleRate}`;
  const cached = noiseCache.get(key);
  if (cached) return cached;

  const length = sampleRate * 3;
  const buffer = new AudioBuffer({ length, sampleRate, numberOfChannels: 1 });
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, last = 0, peak = 0;
  for (let i = 0; i < length; i++) {
    const w = Math.random() * 2 - 1;
    let v = w;
    if (color === 'pink') {
      // Paul Kellet's economy pink filter.
      b0 = 0.99765 * b0 + w * 0.099046;
      b1 = 0.963 * b1 + w * 0.2965164;
      b2 = 0.57 * b2 + w * 1.0526913;
      v = b0 + b1 + b2 + w * 0.1848;
    } else if (color === 'brown') {
      last = (last + 0.02 * w) / 1.02;
      v = last;
    }
    data[i] = v;
    peak = Math.max(peak, Math.abs(v));
  }
  for (let i = 0; i < length; i++) data[i]! /= peak;
  noiseCache.set(key, buffer);
  return buffer;
}

const SPACES: Record<Space, { seconds: number; damping: number }> = {
  open: { seconds: 1.1, damping: 0.35 },
  forest: { seconds: 1.8, damping: 0.55 },
  cave: { seconds: 4.2, damping: 0.75 },
};

const impulseCache = new Map<string, AudioBuffer>();

/** A synthetic room: decaying stereo noise that darkens as it fades. */
function impulse(sampleRate: number, space: Space): AudioBuffer {
  const key = `${space}@${sampleRate}`;
  const cached = impulseCache.get(key);
  if (cached) return cached;

  const { seconds, damping } = SPACES[space];
  const length = Math.floor(sampleRate * seconds);
  const buffer = new AudioBuffer({ length, sampleRate, numberOfChannels: 2 });
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let smooth = 0;
    for (let i = 0; i < length; i++) {
      const t = i / length;
      const k = damping * t; // more smoothing (darker) later in the tail
      smooth = smooth * k + (Math.random() * 2 - 1) * (1 - k);
      data[i] = smooth * Math.pow(1 - t, 2.2) * Math.exp(-3 * t);
    }
  }
  impulseCache.set(key, buffer);
  return buffer;
}

/* ---------- Kit factory ---------- */

/** Cosine-interpolates a short curve to `n` points so automation never has corners. */
function smooth(values: number[], n = 48): Float32Array {
  const src = values.length > 1 ? values : [values[0] ?? 0, values[0] ?? 0];
  return Float32Array.from({ length: n }, (_, i) => {
    const pos = (i / (n - 1)) * (src.length - 1);
    const j = Math.floor(pos);
    const a = src[j]!;
    const b = src[Math.min(j + 1, src.length - 1)]!;
    const f = (1 - Math.cos((pos - j) * Math.PI)) / 2;
    return a + (b - a) * f;
  });
}

export function createKit(
  ctx: BaseAudioContext,
  destination: AudioNode,
  t0: number,
  rand: Rand,
): Kit {
  const between = (min: number, max: number) => min + (max - min) * rand();
  const logBetween = (min: number, max: number) => min * Math.pow(max / min, rand());

  const panned = (node: AudioNode, pan = 0) => {
    const p = ctx.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, pan));
    node.connect(p).connect(destination);
  };

  /** Random slow drift around 1, for turbulence. */
  const drift = (amount: number, points = 9) =>
    Array.from({ length: points }, () => 1 - amount / 2 + amount * rand());

  return {
    rand,
    between,
    logBetween,

    noise(o) {
      const start = t0 + (o.at ?? 0);
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer(ctx.sampleRate, o.color ?? 'pink');
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = o.filter ?? 'bandpass';
      filter.Q.value = o.q ?? 0.8;
      const flutter = o.flutter ?? 0;
      const freqs = Array.isArray(o.freq) ? o.freq : [o.freq, o.freq];
      if (flutter) {
        const d = drift(flutter * 0.6, freqs.length * 2);
        const f = smooth(freqs, d.length).map((v, i) => v * d[i]!);
        filter.frequency.setValueCurveAtTime(smooth(Array.from(f)), start, o.dur);
      } else {
        filter.frequency.setValueCurveAtTime(smooth(freqs), start, o.dur);
      }

      const amp = ctx.createGain();
      amp.gain.value = 0;
      const env = smooth(o.gain, 64);
      if (flutter) {
        const d = smooth(drift(flutter, 12), 64);
        env.forEach((v, i) => (env[i] = v * d[i]!));
      }
      env.forEach((v, i) => (env[i] = Math.max(0, v) * (o.level ?? 1)));
      env[env.length - 1] = 0;
      amp.gain.setValueCurveAtTime(env, start, o.dur);

      src.connect(filter).connect(amp);
      panned(amp, o.pan);
      src.start(start, rand() * 2.5);
      src.stop(start + o.dur + 0.05);
    },

    bubble(o) {
      const start = t0 + o.at;
      const dur = o.dur ?? Math.min(0.4, 150 / o.freq);
      const osc = ctx.createOscillator();
      osc.frequency.setValueAtTime(o.freq, start);
      osc.frequency.exponentialRampToValueAtTime(o.freq * (1 + (o.rise ?? 0.35)), start + dur);
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0, start);
      amp.gain.linearRampToValueAtTime(o.level ?? 0.5, start + 0.002);
      amp.gain.exponentialRampToValueAtTime(0.0005, start + dur);
      osc.connect(amp);
      panned(amp, o.pan);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    },

    grain(o) {
      const start = t0 + o.at;
      const dur = o.dur ?? 0.008;
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer(ctx.sampleRate, 'white');
      const filter = ctx.createBiquadFilter();
      filter.type = o.filter ?? 'bandpass';
      filter.frequency.value = o.freq;
      filter.Q.value = o.q ?? 1.2;
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0, start);
      amp.gain.linearRampToValueAtTime(o.level ?? 0.3, start + 0.0008);
      amp.gain.exponentialRampToValueAtTime(0.0005, start + dur);
      src.connect(filter).connect(amp);
      panned(amp, o.pan);
      src.start(start, rand() * 2.5);
      src.stop(start + dur + 0.01);
    },

    knock(o) {
      const start = t0 + o.at;
      const level = o.level ?? 0.4;
      const amp = ctx.createGain();
      amp.gain.value = 1;
      panned(amp, o.pan);

      for (const [freq, decay, rel = 1] of o.modes) {
        const osc = ctx.createOscillator();
        osc.frequency.value = freq * between(0.97, 1.03);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(level * rel, start + 0.0015);
        g.gain.exponentialRampToValueAtTime(0.0004, start + decay);
        osc.connect(g).connect(amp);
        osc.start(start);
        osc.stop(start + decay + 0.02);
      }

      // The contact itself: a very short broadband click.
      const click = o.click ?? 0.5;
      if (click > 0) {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer(ctx.sampleRate, 'white');
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 1500;
        const g = ctx.createGain();
        g.gain.setValueAtTime(level * click, start);
        g.gain.exponentialRampToValueAtTime(0.0005, start + 0.004);
        src.connect(hp).connect(g).connect(amp);
        src.start(start, rand() * 2.5);
        src.stop(start + 0.01);
      }
    },
  };
}

/** Wires a sound's dry signal and its reverb send into `out`. */
export function createSpace(
  ctx: BaseAudioContext,
  out: AudioNode,
  space: Space,
  send: number,
): AudioNode {
  const input = ctx.createGain();
  input.connect(out);
  if (send > 0) {
    const wet = ctx.createGain();
    wet.gain.value = send;
    const convolver = ctx.createConvolver();
    convolver.buffer = impulse(ctx.sampleRate, space);
    input.connect(wet).connect(convolver).connect(out);
  }
  return input;
}
