import { INSPIRATIONS } from '../data/inspirations';
import { h, svg } from '../lib/dom';
import { directionRuns } from '../lib/lio';

export function mountOrigins(root: HTMLElement): void {
  root.append(
    ...INSPIRATIONS.map((item, i) =>
      h(
        'article',
        { class: `origin origin--${item.direction}`, 'data-reveal': true },
        h(
          'div',
          { class: 'origin__compare' },
          h('figure', { class: 'origin__structure' }, svg(item.illustration())),
          h('span', { class: 'origin__arrow', 'aria-hidden': 'true' }, '→'),
          h(
            'figure',
            { class: 'origin__letter' },
            h(
              'span',
              { class: 'lio origin__sample', 'aria-hidden': 'true' },
              // Mixed samples show every direction in its own colour.
              ...(item.direction === 'all'
                ? directionRuns(item.sample).map(({ dir, text }) => h('span', { class: `tint tint--${dir}` }, text))
                : [item.sample]),
            ),
            h('figcaption', {}, item.sample),
          ),
        ),
        h(
          'div',
          { class: 'origin__body' },
          h('p', { class: 'origin__num' }, String(i + 1).padStart(2, '0')),
          h('h3', { class: 'origin__title' }, item.title),
          h('p', { class: 'origin__place' }, item.place),
          h('p', {}, h('strong', {}, 'Structure. '), item.structure),
          h('p', {}, h('strong', {}, 'Letter. '), item.letterform),
        ),
      ),
    ),
  );
}
