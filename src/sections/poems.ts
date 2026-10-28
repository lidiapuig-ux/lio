import { POEMS } from '../data/poems';
import { h } from '../lib/dom';

/**
 * Each line is set in Lio with its Latin reading underneath. Readings appear
 * on hover/focus, or all together via the switch. The Lio line is the real
 * text for assistive tech; the reading duplicates it and stays aria-hidden.
 */
export function mountPoems(root: HTMLElement, toggle: HTMLInputElement): void {
  root.append(
    ...POEMS.map((poem, i) =>
      h(
        'article',
        { class: 'poem', 'data-reveal': true, 'aria-labelledby': `poem-${poem.id}` },
        h(
          'header',
          { class: 'poem__head' },
          h('span', { class: 'poem__num' }, String(i + 1).padStart(2, '0')),
          h('h3', { id: `poem-${poem.id}`, class: 'poem__title' }, poem.title),
          poem.lang && h('p', { class: 'poem__lang' }, poem.lang.label),
        ),
        h(
          'div',
          { class: 'poem__lines', lang: poem.lang?.code ?? 'en' },
          ...poem.lines.map((line) =>
            h(
              'p',
              { class: 'poem__line', tabindex: 0 },
              h('span', { class: 'lio poem__lio' }, line),
              h('span', { class: 'poem__reading', 'aria-hidden': 'true' }, line),
            ),
          ),
        ),
        poem.lang && h('p', { class: 'poem__translation' }, poem.lang.translation),
      ),
    ),
  );

  const sync = () => root.classList.toggle('show-readings', toggle.checked);
  toggle.addEventListener('change', sync);
  sync();
}
