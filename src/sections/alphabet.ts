import { ALPHABET, DIRECTIONS, directionOf, type Direction } from '../data/alphabet';
import { soundButton } from '../audio/sound-button';
import { waveformSvg } from '../audio/waveform';
import { soundOf } from '../data/sounds';
import { h, lioGuides } from '../lib/dom';

type Filter = Direction | 'all';

const FILTERS: ReadonlyArray<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All' },
  ...DIRECTIONS.map((d) => ({ id: d.id, label: d.id[0]!.toUpperCase() + d.id.slice(1) })),
];

/** Specimen view: a large stage for the chosen glyph beside a filterable grid. */
export function mountAlphabet(root: HTMLElement): void {
  let selected = 'g';

  const stageGlyph = h('span', { class: 'stage__glyph-text' });
  const stageLetter = h('span', { class: 'stage__letter' });
  const stageDirection = h('span', { class: 'stage__direction' });
  const stageNote = h('p', { class: 'stage__note' });
  const stageWord = h('span', { class: 'lio stage__word', 'aria-hidden': 'true' });
  const stageSound = h('div', { class: 'stage__sound' });
  const stage = h(
    'div',
    { class: 'stage', 'aria-live': 'polite' },
    h(
      'div',
      { class: 'stage__canvas' },
      h('span', { class: 'lio lio--guided stage__glyph', 'aria-hidden': 'true' }, lioGuides(), stageGlyph),
    ),
    h('div', { class: 'stage__meta' }, stageLetter, stageDirection),
    stageNote,
    stageSound,
    stageWord,
  );

  const tiles = ALPHABET.map((letter) => {
    const dir = directionOf(letter)!;
    const tile = h(
      'button',
      {
        type: 'button',
        class: `tile tile--${dir}`,
        'data-letter': letter,
        'data-direction': dir,
        'aria-pressed': 'false',
        'aria-label': `${letter}, ${dir} letter`,
      },
      h('span', { class: 'lio tile__glyph', 'aria-hidden': 'true' }, letter),
      h('span', { class: 'tile__letter', 'aria-hidden': 'true' }, letter),
    );
    tile.addEventListener('click', () => select(letter));
    return tile;
  });

  const filterButtons = FILTERS.map(({ id, label }) => {
    const button = h(
      'button',
      { type: 'button', class: `chip chip--${id}`, 'aria-pressed': String(id === 'all') },
      label,
    );
    button.addEventListener('click', () => applyFilter(id));
    return button;
  });

  function select(letter: string): void {
    selected = letter;
    const dir = directionOf(letter)!;
    const info = DIRECTIONS.find((d) => d.id === dir)!;
    stage.dataset.direction = dir;
    stageGlyph.textContent = letter;
    stageLetter.textContent = letter;
    stageDirection.textContent = info.name;
    stageNote.textContent = `${info.verb}. ${info.description}`;
    // A short repeating chain shows how the glyph joins its neighbours.
    stageWord.textContent = letter.repeat(5);
    renderSound(letter);
    for (const tile of tiles) tile.setAttribute('aria-pressed', String(tile.dataset.letter === selected));
  }

  function renderSound(letter: string): void {
    const sound = soundOf(letter)!;
    stageSound.replaceChildren(
      h(
        'div',
        { class: 'stage__sound-head' },
        h('div', {}, h('p', { class: 'stage__sound-name' }, sound.sound), h('p', { class: 'stage__sound-meta' }, `${sound.materials.join(' · ')} · ${sound.frequency}`)),
        soundButton(letter, { label: 'Play', className: 'sound-button--pill', wave: { width: 28, height: 10 } }),
      ),
      waveformSvg(letter, 480, 56, 120),
      h('p', { class: 'stage__sound-relation' }, sound.relation),
    );
  }

  function applyFilter(filter: Filter): void {
    filterButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(FILTERS[i]!.id === filter)));
    for (const tile of tiles) {
      tile.classList.toggle('is-dimmed', filter !== 'all' && tile.dataset.direction !== filter);
    }
  }

  root.append(
    stage,
    h(
      'div',
      { class: 'alphabet__index' },
      h('div', { class: 'chips', role: 'group', 'aria-label': 'Filter by direction' }, ...filterButtons),
      h('div', { class: 'tiles' }, ...tiles),
    ),
  );

  select(selected);
}
