/**
 * Line illustrations of the Modernisme structures Lio draws from.
 * Each returns a static SVG string on a 240×240 canvas; colours come from
 * CSS classes (`.ill-*`) so the drawings follow the active theme.
 */

const open = (label: string) =>
  `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">`;

/** Small deterministic PRNG so generated patterns are identical on every render. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r = (n: number) => Math.round(n * 10) / 10;

export function catenary(): string {
  const weights = [0.15, 0.3, 0.5, 0.7, 0.85]
    .map((t) => {
      // Point on the quadratic M50 22 Q120 158 190 22.
      const x = (1 - t) ** 2 * 50 + 2 * (1 - t) * t * 120 + t ** 2 * 190;
      const y = (1 - t) ** 2 * 22 + 2 * (1 - t) * t * 158 + t ** 2 * 22;
      return `<line x1="${r(x)}" y1="${r(y)}" x2="${r(x)}" y2="${r(y + 10)}" class="ill-stroke" stroke-width="1"/><circle cx="${r(x)}" cy="${r(y + 13)}" r="3" class="ill-ink"/>`;
    })
    .join('');

  return `${open('A hanging chain mirrored into a catenary arch')}
    <line x1="34" y1="22" x2="206" y2="22" class="ill-stroke" stroke-width="2"/>
    <path d="M50 22 Q120 158 190 22" class="ill-stroke" stroke-width="1.5" stroke-dasharray="3 4" fill="none"/>
    ${weights}
    <line x1="20" y1="120" x2="220" y2="120" class="ill-faint" stroke-width="1" stroke-dasharray="1 5"/>
    <path d="M50 218 Q120 82 190 218 L174 218 Q120 110 66 218 Z" class="ill-sky"/>
    <path d="M78 218 Q120 136 162 218" class="ill-stroke" stroke-width="1" fill="none"/>
    <line x1="30" y1="218" x2="210" y2="218" class="ill-stroke" stroke-width="2"/>
  </svg>`;
}

export function panot(): string {
  const size = 30;
  const w = Math.sqrt(3) * size;
  const cells: string[] = [];

  for (let row = -1; row < 7; row++) {
    for (let col = -1; col < 6; col++) {
      const cx = col * w + (row % 2 ? w / 2 : 0) + 14;
      const cy = row * size * 1.5 + 18;
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 180) * (60 * i - 30);
        return `${r(cx + size * Math.cos(a))},${r(cy + size * Math.sin(a))}`;
      }).join(' ');
      const accent = row === 3 && col === 2;
      cells.push(
        `<polygon points="${pts}" class="${accent ? 'ill-root' : 'ill-tile'} ill-grout"/>`,
        // Three nested arcs: the shell/wave motif that runs through the tile.
        ...[8, 15, 22].map(
          (rad) =>
            `<path d="M${r(cx - rad)} ${r(cy)} A${rad} ${rad} 0 0 1 ${r(cx + rad)} ${r(cy)}" class="${accent ? 'ill-paper' : 'ill-faint'}" fill="none" stroke-width="1.2"/>`,
        ),
      );
    }
  }

  return `${open('Hexagonal paving tiles with a wave motif and one accent tile')}
    <defs><clipPath id="panot-clip"><rect x="0" y="0" width="240" height="240" rx="16"/></clipPath></defs>
    <g clip-path="url(#panot-clip)">${cells.join('')}</g>
  </svg>`;
}

export function chimneys(): string {
  // One warrior-like chimney: a twisting shaft, a swollen collar and a pointed crest.
  const figure = (x: number, base: number, height: number, cls: string) => {
    const top = base - height;
    return `<g>
      <path d="M${x - 18} ${base} C${x - 22} ${base - height * 0.4}, ${x - 12} ${top + 46}, ${x - 20} ${top + 34}
        C${x - 26} ${top + 22}, ${x - 10} ${top + 10}, ${x} ${top}
        C${x + 10} ${top + 10}, ${x + 26} ${top + 22}, ${x + 20} ${top + 34}
        C${x + 12} ${top + 46}, ${x + 22} ${base - height * 0.4}, ${x + 18} ${base} Z" class="${cls}"/>
      <path d="M${x - 19} ${top + 36} Q${x} ${top + 28} ${x + 19} ${top + 36}" class="ill-stroke" stroke-width="1.2" fill="none"/>
      <path d="M${x - 16} ${base - height * 0.25} Q${x} ${base - height * 0.35} ${x + 16} ${base - height * 0.55}" class="ill-stroke" stroke-width="1" fill="none"/>
      <path d="M${x - 17} ${base - height * 0.5} Q${x} ${base - height * 0.6} ${x + 17} ${base - height * 0.75}" class="ill-stroke" stroke-width="1" fill="none"/>
      <path d="M${x} ${top} L${x} ${top - 16}" class="ill-stroke" stroke-width="1.5"/>
    </g>`;
  };

  return `${open('Three twisting rooftop chimneys with pointed crests')}
    ${figure(70, 214, 120, 'ill-sand')}
    ${figure(170, 214, 140, 'ill-sand')}
    ${figure(120, 214, 168, 'ill-sand-strong')}
    <line x1="24" y1="214" x2="216" y2="214" class="ill-stroke" stroke-width="2"/>
  </svg>`;
}

export function trencadis(): string {
  const rand = mulberry32(1926);
  const n = 9;
  const step = 240 / (n - 1);
  const grid: Array<Array<[number, number]>> = [];

  for (let y = 0; y < n; y++) {
    const row: Array<[number, number]> = [];
    for (let x = 0; x < n; x++) {
      const edge = x === 0 || y === 0 || x === n - 1 || y === n - 1;
      const j = edge ? 0 : step * 0.32;
      row.push([x * step + (rand() - 0.5) * 2 * j, y * step + (rand() - 0.5) * 2 * j]);
    }
    grid.push(row);
  }

  const fills = ['ill-sky', 'ill-grass', 'ill-root', 'ill-sand', 'ill-tile', 'ill-grass', 'ill-sky'];
  const shards: string[] = [];
  for (let y = 0; y < n - 1; y++) {
    for (let x = 0; x < n - 1; x++) {
      const a = grid[y]![x]!;
      const b = grid[y]![x + 1]!;
      const c = grid[y + 1]![x + 1]!;
      const d = grid[y + 1]![x]!;
      // Split every quad along a random diagonal so the pieces read as broken tile.
      const tris = rand() > 0.5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
      for (const tri of tris) {
        const cls = fills[Math.floor(rand() * fills.length)]!;
        shards.push(
          `<polygon points="${tri.map(([px, py]) => `${r(px)},${r(py)}`).join(' ')}" class="${cls} ill-grout"/>`,
        );
      }
    }
  }

  return `${open('A round mosaic of broken ceramic shards')}
    <defs><clipPath id="trencadis-clip"><circle cx="120" cy="120" r="104"/></clipPath></defs>
    <g clip-path="url(#trencadis-clip)">${shards.join('')}</g>
    <circle cx="120" cy="120" r="104" class="ill-stroke" fill="none" stroke-width="2"/>
  </svg>`;
}

export function rose(): string {
  const petal = (angle: number, len: number, width: number, cls: string) =>
    `<path d="M0 0 C${width} ${-len * 0.35}, ${width} ${-len * 0.75}, 0 ${-len} C${-width} ${-len * 0.75}, ${-width} ${-len * 0.35}, 0 0 Z" transform="translate(120 120) rotate(${angle})" class="${cls} ill-lead"/>`;

  const outer = Array.from({ length: 8 }, (_, i) => petal(i * 45 + 22.5, 92, 34, 'ill-grass')).join('');
  const inner = Array.from({ length: 8 }, (_, i) => petal(i * 45, 70, 26, 'ill-root')).join('');

  return `${open('A stained-glass rose of petals held in lead lines')}
    <circle cx="120" cy="120" r="108" class="ill-sky ill-lead"/>
    ${outer}${inner}
    <circle cx="120" cy="120" r="20" class="ill-sand ill-lead"/>
    <circle cx="120" cy="120" r="7" class="ill-root ill-lead"/>
  </svg>`;
}

export function ironLeaves(): string {
  const leaf = (y: number, side: 1 | -1, reach: number, drop: number) => {
    const x = 120;
    const tipX = x + side * reach;
    const tipY = y + drop;
    return `<path d="M${x} ${y}
      C${x + side * reach * 0.35} ${y - 26}, ${tipX - side * 6} ${tipY - 40}, ${tipX} ${tipY}
      C${tipX - side * 18} ${tipY - 26}, ${x + side * reach * 0.3} ${y - 4}, ${x} ${y + 14} Z" class="ill-grass"/>`;
  };

  return `${open('A wrought-iron stem with curling leaves on both sides')}
    <path d="M120 226 L120 14" class="ill-stroke" stroke-width="3"/>
    ${leaf(108, -1, 70, 34)}${leaf(92, 1, 64, 30)}
    ${leaf(144, -1, 86, 50)}${leaf(128, 1, 90, 52)}
    ${leaf(70, -1, 40, 18)}${leaf(58, 1, 36, 16)}
    <path d="M120 226 C 108 200, 112 186, 120 176" class="ill-grass-stroke" stroke-width="3" fill="none"/>
  </svg>`;
}
