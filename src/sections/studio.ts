import { DIRECTIONS, type Direction } from '../data/alphabet';
import { POEMS } from '../data/poems';
import { h } from '../lib/dom';
import { countDirections, directionRuns, normalizeForLio } from '../lib/lio';

type Paper = 'paper' | 'stone' | 'night';
type ColourMode = 'ink' | 'directions';

interface StudioState {
  text: string;
  size: number;
  leading: number;
  paper: Paper;
  colour: ColourMode;
}

const DEFAULT_TEXT = 'la pedra respira\nthe stone breathes';
const PAPERS: ReadonlyArray<{ id: Paper; label: string }> = [
  { id: 'paper', label: 'Paper' },
  { id: 'stone', label: 'Stone' },
  { id: 'night', label: 'Night' },
];
const COLOURS: ReadonlyArray<{ id: ColourMode; label: string }> = [
  { id: 'ink', label: 'Ink' },
  { id: 'directions', label: 'By direction' },
];
const SHARE_PARAM = 'text';
const MAX_LENGTH = 400;

let fieldId = 0;
const uid = (name: string) => `studio-${name}-${++fieldId}`;

export function mountStudio(root: HTMLElement): void {
  const fromUrl = new URLSearchParams(location.search).get(SHARE_PARAM);
  const state: StudioState = {
    text: fromUrl?.slice(0, MAX_LENGTH) ?? DEFAULT_TEXT,
    size: 56,
    leading: 1.9,
    paper: 'paper',
    colour: 'directions',
  };

  /* ---------- Controls ---------- */

  const inputId = uid('input');
  const input = h('textarea', {
    id: inputId,
    class: 'studio__input',
    rows: 4,
    maxlength: MAX_LENGTH,
    spellcheck: 'false',
    autocomplete: 'off',
    placeholder: 'Type something to grow…',
  });
  input.value = state.text;

  const hint = h('p', { class: 'studio__hint', 'aria-live': 'polite' });

  const range = (label: string, min: number, max: number, step: number, value: number, format: (v: number) => string) => {
    const id = uid('range');
    const output = h('output', { for: id }, format(value));
    const control = h('input', { id, type: 'range', min, max, step, value: String(value) });
    control.addEventListener('input', () => (output.textContent = format(control.valueAsNumber)));
    const field = h('div', { class: 'field' }, h('label', { for: id }, label, output), control);
    return { field, control };
  };

  const size = range('Size', 24, 160, 1, state.size, (v) => `${v}px`);
  const leading = range('Line height', 1.4, 2.6, 0.05, state.leading, (v) => v.toFixed(2));

  const segmented = <T extends string>(
    label: string,
    options: ReadonlyArray<{ id: T; label: string }>,
    current: T,
    onChange: (value: T) => void,
  ) => {
    const buttons = options.map((opt) => {
      const button = h(
        'button',
        { type: 'button', class: 'segmented__option', 'aria-pressed': String(opt.id === current), 'data-value': opt.id },
        opt.label,
      );
      button.addEventListener('click', () => {
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
        onChange(opt.id);
      });
      return button;
    });
    return h(
      'div',
      { class: 'field' },
      h('span', { class: 'field__label' }, label),
      h('div', { class: 'segmented', role: 'group', 'aria-label': label }, ...buttons),
    );
  };

  const inspire = h('button', { type: 'button', class: 'button button--ghost' }, 'Inspire me');
  const clear = h('button', { type: 'button', class: 'button button--ghost' }, 'Clear');
  const download = h('button', { type: 'button', class: 'button' }, 'Download PNG');
  const share = h('button', { type: 'button', class: 'button button--ghost' }, 'Copy link');
  const status = h('p', { class: 'studio__status', role: 'status' });

  /* ---------- Preview ---------- */

  const output = h('div', { class: 'lio studio__output', lang: 'en' });
  const canvas = h('div', { class: 'studio__canvas' }, output);

  const bars = new Map<Direction, HTMLElement>();
  const counts = new Map<Direction, HTMLElement>();
  const meter = h(
    'div',
    { class: 'meter', role: 'img' },
    ...DIRECTIONS.map((d) => {
      const bar = h('span', { class: `meter__bar meter__bar--${d.id}` });
      bars.set(d.id, bar);
      return bar;
    }),
  );
  const meterLegend = h(
    'dl',
    { class: 'meter__legend' },
    ...DIRECTIONS.map((d) => {
      const value = h('dd', {}, '0%');
      counts.set(d.id, value);
      return h('div', { class: `meter__item meter__item--${d.id}` }, h('dt', {}, d.id), value);
    }),
  );

  root.append(
    h(
      'div',
      { class: 'studio__panel' },
      h('label', { class: 'field__label', for: inputId }, 'Your text'),
      input,
      hint,
      h('div', { class: 'studio__ranges' }, size.field, leading.field),
      segmented('Colour', COLOURS, state.colour, (v) => {
        state.colour = v;
        render();
      }),
      segmented('Paper', PAPERS, state.paper, (v) => {
        state.paper = v;
        render();
      }),
      h('div', { class: 'button-row' }, inspire, clear),
      h('div', { class: 'button-row' }, download, share),
      status,
    ),
    h('div', { class: 'studio__preview' }, canvas, h('div', { class: 'meter-wrap' }, meter, meterLegend)),
  );

  /* ---------- Behaviour ---------- */

  function render(): void {
    const { text, dropped } = normalizeForLio(state.text);

    canvas.dataset.paper = state.paper;
    canvas.style.setProperty('--studio-size', `${state.size}px`);
    canvas.style.setProperty('--studio-leading', String(state.leading));

    output.replaceChildren(
      ...(state.colour === 'directions'
        ? directionRuns(text).map(({ dir, text: run }) => (dir ? h('span', { class: `tint tint--${dir}` }, run) : run))
        : [text]),
    );
    output.classList.toggle('is-empty', text.trim() === '');
    output.setAttribute('aria-label', text.trim() ? `Preview in Lio: ${text}` : 'Preview is empty');

    hint.textContent = dropped.length
      ? `Lio has no glyph for ${dropped.map((c) => `“${c}”`).join(' ')}, so ${dropped.length === 1 ? 'it was' : 'they were'} left out.`
      : '';

    const tally = countDirections(text);
    const total = tally.sky + tally.grass + tally.root;
    for (const d of DIRECTIONS) {
      const pct = total ? Math.round((tally[d.id] / total) * 100) : 0;
      bars.get(d.id)!.style.flexGrow = String(total ? tally[d.id] : 1);
      counts.get(d.id)!.textContent = `${pct}%`;
    }
    meter.setAttribute(
      'aria-label',
      total
        ? `Your text is ${DIRECTIONS.map((d) => `${Math.round((tally[d.id] / total) * 100)}% ${d.id}`).join(', ')}`
        : 'No letters yet',
    );
  }

  const flash = (() => {
    let timer = 0;
    return (message: string) => {
      status.textContent = message;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => (status.textContent = ''), 2600);
    };
  })();

  input.addEventListener('input', () => {
    state.text = input.value;
    render();
  });
  size.control.addEventListener('input', () => {
    state.size = size.control.valueAsNumber;
    render();
  });
  leading.control.addEventListener('input', () => {
    state.leading = leading.control.valueAsNumber;
    render();
  });

  const inspirations = POEMS.map((p) => p.lines.slice(0, 2).join('\n'));
  let inspireIndex = -1;
  inspire.addEventListener('click', () => {
    inspireIndex = (inspireIndex + 1) % inspirations.length;
    input.value = state.text = inspirations[inspireIndex]!;
    render();
  });

  clear.addEventListener('click', () => {
    input.value = state.text = '';
    render();
    input.focus();
  });

  share.addEventListener('click', async () => {
    const url = new URL(location.href);
    url.searchParams.set(SHARE_PARAM, normalizeForLio(state.text).text);
    url.hash = 'write';
    try {
      await navigator.clipboard.writeText(url.toString());
      flash('Link copied to clipboard.');
    } catch {
      flash('Could not copy automatically. The link is in the address bar.');
    }
    history.replaceState(null, '', url);
  });

  download.addEventListener('click', async () => {
    try {
      // Export at the rendered size, which can be capped below the slider value on narrow screens.
      const renderedSize = parseFloat(getComputedStyle(output).fontSize);
      await exportPng(canvas, { ...state, size: renderedSize }, normalizeForLio(state.text).text, output.clientWidth);
      flash('Image saved.');
    } catch (err) {
      console.error(err);
      flash('Sorry, the image could not be created.');
    }
  });

  render();
}

/* ---------- PNG export ---------- */

async function exportPng(panel: HTMLElement, state: StudioState, text: string, maxWidth: number): Promise<void> {
  await document.fonts.load(`${state.size}px Lio`);

  const styles = getComputedStyle(panel);
  const colour = (name: string) => styles.getPropertyValue(name).trim();
  const ink = colour('--studio-ink');
  const tints: Record<Direction, string> = {
    sky: colour('--studio-sky'),
    grass: colour('--studio-grass'),
    root: colour('--studio-root'),
  };

  const scale = Math.min(window.devicePixelRatio || 1, 2) * 1.5;
  const pad = state.size * 0.75;
  const lineHeight = state.size * state.leading;
  const font = `${state.size}px Lio`;

  const measure = document.createElement('canvas').getContext('2d')!;
  measure.font = font;
  const rows = wrap(text.trim() ? text : ' ', maxWidth, (s) => measure.measureText(s).width);
  const width = Math.ceil(Math.max(maxWidth, ...rows.map((r) => measure.measureText(r).width)) + pad * 2);
  const height = Math.ceil(rows.length * lineHeight + pad * 2);

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);
  ctx.fillStyle = colour('--studio-bg');
  ctx.fillRect(0, 0, width, height);
  ctx.font = font;
  ctx.textBaseline = 'alphabetic';

  // Match CSS line-box placement: the font's 1.2em content area is centred in each line.
  const baselineOffset = ((state.leading - 1.2) / 2 + 1) * state.size;
  rows.forEach((row, i) => {
    let x = pad;
    const y = pad + i * lineHeight + baselineOffset;
    const runs = state.colour === 'directions' ? directionRuns(row) : [{ dir: null, text: row }];
    for (const run of runs) {
      ctx.fillStyle = run.dir ? tints[run.dir] : ink;
      ctx.fillText(run.text, x, y);
      x += ctx.measureText(run.text).width;
    }
  });

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Canvas export failed');
  const link = h('a', { href: URL.createObjectURL(blob), download: 'lio.png' });
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

/** Greedy word wrap that keeps hard line breaks. */
function wrap(text: string, maxWidth: number, width: (s: string) => number): string[] {
  const rows: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(' ').filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (line && width(next) > maxWidth) {
        rows.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    rows.push(line);
  }
  return rows;
}
