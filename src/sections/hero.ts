import { soundButton } from '../audio/sound-button';
import { h } from '../lib/dom';

/**
 * Annotates each hero glyph with its Latin letter and the organic sound it is
 * paired with. The full line stays readable to assistive tech as plain text;
 * the glyphs themselves are decorative and the buttons carry their own labels.
 */
export function mountHero(root: HTMLElement): void {
  for (const line of root.querySelectorAll<HTMLElement>('.lio')) {
    const text = line.textContent ?? '';
    line.replaceChildren(
      h('span', { class: 'visually-hidden' }, text),
      ...[...text].map((c) =>
        c === ' '
          ? ' '
          : h(
              'span',
              { class: 'glyph' },
              h('span', { 'aria-hidden': 'true' }, c),
              soundButton(c, { label: c, className: 'glyph__key', wave: { width: 30, height: 10, points: 24 } }),
            ),
      ),
    );
  }
}
