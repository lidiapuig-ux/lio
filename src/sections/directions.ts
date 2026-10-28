import { DIRECTIONS } from '../data/alphabet';
import { h, lioGuides } from '../lib/dom';
import { directionRuns } from '../lib/lio';

const SENTENCE = 'the light falls through the leaves and the roots drink deep';

export function mountDirections(root: HTMLElement, sentence: HTMLElement, reading: HTMLElement): void {
  root.append(
    ...DIRECTIONS.map((dir) =>
      h(
        'article',
        { class: `direction direction--${dir.id}`, 'data-reveal': true },
        h(
          'div',
          { class: 'direction__specimen', 'aria-hidden': 'true' },
          h('span', { class: 'lio lio--guided direction__glyphs' }, lioGuides(), dir.letters.join('')),
        ),
        h(
          'div',
          { class: 'direction__body' },
          h('h3', { class: 'direction__name' }, dir.name),
          h('p', { class: 'direction__verb' }, dir.verb),
          h('p', {}, dir.description),
          h('p', { class: 'direction__letters' }, dir.letters.join(' ')),
        ),
      ),
    ),
  );

  sentence.replaceChildren(
    ...directionRuns(SENTENCE).map(({ dir, text }) =>
      dir ? h('span', { class: `tint tint--${dir}` }, text) : text,
    ),
  );
  reading.textContent = `“${SENTENCE}”`;
}
