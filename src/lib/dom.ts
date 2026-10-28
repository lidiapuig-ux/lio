type Child = Node | string | null | undefined | false;
type Attrs = Record<string, string | number | boolean | null | undefined>;

/**
 * Minimal hyperscript helper. Attributes set to `false`, `null` or `undefined`
 * are omitted; `true` renders a boolean attribute.
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value == null) continue;
    el.setAttribute(key, value === true ? '' : String(value));
  }
  el.append(...children.filter((c): c is Node | string => Boolean(c)));
  return el;
}

/** Parses a trusted, static SVG string authored in this codebase. */
export function svg(markup: string): SVGSVGElement {
  const template = document.createElement('template');
  template.innerHTML = markup.trim();
  return template.content.firstElementChild as SVGSVGElement;
}

export function $<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}

/**
 * Zero-size inline anchor that sits exactly on the text baseline. Its children
 * are Lio's guide lines (sky top, connecting thread, root bottom), positioned
 * in em so they track the glyph outlines at any font size.
 */
export function lioGuides(): HTMLSpanElement {
  return h(
    'span',
    { class: 'guides', 'aria-hidden': 'true' },
    h('i', { class: 'guide guide--sky' }),
    h('i', { class: 'guide guide--thread' }),
    h('i', { class: 'guide guide--root' }),
  );
}
