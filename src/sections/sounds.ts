import { soundButton } from '../audio/sound-button';
import { waveformSvg } from '../audio/waveform';
import { DIRECTIONS } from '../data/alphabet';
import { BANDS, SOUNDS, SOURCES, type LetterSound, type SourceId } from '../data/sounds';
import { h } from '../lib/dom';

/** Log-scaled frequency axis for the map. */
const AXIS = { min: 50, max: 12000 };
const TICKS = [50, 100, 200, 500, 1000, 2000, 5000, 10000];
const position = (hz: number) => (Math.log(hz / AXIS.min) / Math.log(AXIS.max / AXIS.min)) * 100;
const formatHz = (hz: number) => (hz >= 1000 ? `${hz / 1000}k` : String(hz));

export function mountSounds(root: HTMLElement): void {
  // Number sources in the order they are first cited.
  const cited: SourceId[] = [...new Set(SOUNDS.flatMap((s) => s.sources))];
  const note = (id: SourceId) => cited.indexOf(id) + 1;

  root.append(
    h(
      'div',
      { class: 'bands' },
      ...DIRECTIONS.map((d) =>
        h(
          'article',
          { class: `band band--${d.id}`, 'data-reveal': true },
          h('p', { class: 'band__range' }, `${d.name} · ${BANDS[d.id].range}`),
          h('h3', { class: 'band__name' }, BANDS[d.id].element),
          h('p', {}, BANDS[d.id].character),
        ),
      ),
    ),
    frequencyMap(),
    ...DIRECTIONS.map((d) =>
      h(
        'section',
        { class: 'sound-group', 'aria-label': d.name },
        h('h3', { class: `sound-group__title sound-group__title--${d.id}` }, `${d.name} · ${BANDS[d.id].element.toLowerCase()}`, h('span', {}, BANDS[d.id].range)),
        h('div', { class: 'sound-cards' }, ...SOUNDS.filter((s) => s.direction === d.id).map((s) => card(s, note))),
      ),
    ),
    h(
      'footer',
      { class: 'sound-sources' },
      h(
        'p',
        {},
        'Every sound is synthesised live in your browser from physical models of its material: bubbles for water, resonant modes for stone, wood and seeds, and turbulent filtered noise for air. Nothing is pre-recorded, so each play is slightly different, as in nature. The waveforms are drawn from the rendered audio itself.',
      ),
      h(
        'ol',
        {},
        ...cited.map((id, i) =>
          h(
            'li',
            { id: `source-${i + 1}` },
            h('a', { href: SOURCES[id].url, target: '_blank', rel: 'noopener noreferrer' }, SOURCES[id].label),
          ),
        ),
      ),
    ),
  );
}

const MARKER_SPACE = 30; // px a marker needs before the next one must move up a row

function frequencyMap(): HTMLElement {
  const lanes = DIRECTIONS.map((d) => {
    const markers = SOUNDS.filter((s) => s.direction === d.id)
      .sort((a, b) => a.hz - b.hz)
      .map((s) => {
        const marker = soundButton(s.letter, { label: s.letter, className: 'freq-map__marker', wave: false });
        marker.style.setProperty('--x', `${position(s.hz)}%`);
        return marker;
      });
    const track = h('div', { class: 'freq-map__track' }, ...markers);
    const lane = h(
      'div',
      { class: `freq-map__lane freq-map__lane--${d.id}` },
      h('span', { class: 'freq-map__label' }, d.id),
      track,
    );
    return { lane, track, markers };
  });

  // Stack markers that would overlap into rows; depends on the rendered width.
  const layout = () => {
    for (const { lane, track, markers } of lanes) {
      const width = track.clientWidth || 1;
      const lastX: number[] = [];
      for (const marker of markers) {
        const x = (parseFloat(marker.style.getPropertyValue('--x')) / 100) * width;
        let row = lastX.findIndex((prev) => x - prev >= MARKER_SPACE);
        if (row === -1) row = lastX.length;
        lastX[row] = x;
        marker.style.setProperty('--row', String(row));
      }
      lane.style.setProperty('--rows', String(Math.max(lastX.length, 1)));
    }
  };

  const body = h(
    'div',
    { class: 'freq-map__body' },
    ...lanes.map((l) => l.lane),
    h(
      'div',
      { class: 'freq-map__axis', 'aria-hidden': 'true' },
      ...TICKS.map((t) => h('span', { style: `--x: ${position(t)}%` }, `${formatHz(t)}Hz`)),
    ),
  );
  new ResizeObserver(layout).observe(body);

  return h(
    'figure',
    { class: 'freq-map', 'data-reveal': true },
    h('figcaption', {}, 'Where each letter sounds · logarithmic, 50 Hz to 12 kHz · press a letter to hear it'),
    body,
  );
}

function card(sound: LetterSound, note: (id: SourceId) => number): HTMLElement {
  return h(
    'article',
    { class: `sound-card sound-card--${sound.direction}`, 'data-reveal': true },
    h(
      'header',
      { class: 'sound-card__head' },
      h('span', { class: 'lio sound-card__glyph', 'aria-hidden': 'true' }, sound.letter),
      h(
        'div',
        { class: 'sound-card__title' },
        h('p', { class: 'sound-card__letter' }, sound.letter, h('span', {}, ` · ${sound.form}`)),
        h('h4', {}, sound.sound),
      ),
      soundButton(sound.letter, { label: 'Play', className: 'sound-button--pill', wave: { width: 28, height: 10 } }),
    ),
    waveformSvg(sound.letter, 320, 44, 110),
    h(
      'dl',
      { class: 'sound-card__meta' },
      h('div', {}, h('dt', {}, 'Frequency'), h('dd', {}, sound.frequency)),
      h('div', {}, h('dt', {}, 'Material'), h('dd', {}, sound.materials.join(', '))),
      h('div', {}, h('dt', {}, 'Texture'), h('dd', {}, sound.texture)),
    ),
    h('p', {}, h('strong', {}, 'Shape. '), sound.shape),
    h('p', {}, h('strong', {}, 'Sound. '), sound.relation),
    h(
      'p',
      { class: 'sound-card__refs' },
      ...sound.sources.map((id) => h('a', { href: `#source-${note(id)}`, 'aria-label': `Source ${note(id)}` }, `[${note(id)}]`)),
    ),
  );
}
