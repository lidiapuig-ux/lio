import { renderLetter } from './engine';

/**
 * Waveforms are drawn from the actual audio: each letter's sound is rendered
 * offline once, reduced to peaks and drawn as a mirrored envelope. Renders run
 * one at a time in the background and are cached per letter.
 */

const peakCache = new Map<string, Promise<Float32Array>>();
let queue: Promise<unknown> = Promise.resolve();

const BUCKETS = 240;

function peaksOf(letter: string): Promise<Float32Array> {
  let pending = peakCache.get(letter);
  if (!pending) {
    pending = queue.then(async () => {
      // Yield between renders so the page stays responsive.
      await new Promise((r) => setTimeout(r, 0));
      const data = await renderLetter(letter);
      const peaks = new Float32Array(BUCKETS);
      const size = Math.floor(data.length / BUCKETS);
      let max = 0;
      for (let b = 0; b < BUCKETS; b++) {
        let sum = 0;
        for (let i = b * size; i < (b + 1) * size; i++) sum += data[i]! * data[i]!;
        // RMS reads as loudness; it draws a smoother, more natural outline than raw peaks.
        peaks[b] = Math.sqrt(sum / size);
        max = Math.max(max, peaks[b]!);
      }
      return peaks.map((p) => p / (max || 1));
    });
    queue = pending.catch(() => undefined);
    peakCache.set(letter, pending);
  }
  return pending;
}

function envelopePath(peaks: Float32Array, width: number, height: number, points: number): string {
  const mid = height / 2;
  const step = peaks.length / points;
  const top: string[] = [];
  const bottom: string[] = [];
  for (let i = 0; i < points; i++) {
    let p = 0;
    for (let j = Math.floor(i * step); j < Math.floor((i + 1) * step); j++) p = Math.max(p, peaks[j]!);
    const x = ((i / (points - 1)) * width).toFixed(1);
    const dy = Math.max(p * (mid - 0.5), 0.35);
    top.push(`${i ? 'L' : 'M'}${x} ${(mid - dy).toFixed(1)}`);
    bottom.unshift(`L${x} ${(mid + dy).toFixed(1)}`);
  }
  return `${top.join('')}${bottom.join('')}Z`;
}

/** An SVG that fills in with the letter's rendered waveform once it is ready. */
export function waveformSvg(letter: string, width = 120, height = 28, points = 80): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('wave');
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', `M0 ${height / 2}L${width} ${height / 2}`);
  svg.append(path);

  peaksOf(letter)
    .then((peaks) => {
      path.setAttribute('d', envelopePath(peaks, width, height, points));
      svg.classList.add('is-ready');
    })
    .catch(() => svg.classList.add('is-unavailable'));

  return svg;
}
