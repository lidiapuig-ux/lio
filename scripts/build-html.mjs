/**
 * Builds the whole site as ONE self-contained HTML file that works offline,
 * opened straight from disk: scripts, styles, fonts and icon are all inlined.
 *
 *   npm run build:html  →  export/lio - an organic typeface by Lidia & Oli.html
 */
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { build } from 'vite';

const root = resolve(import.meta.dirname, '..');
const outDir = join(root, 'node_modules/.cache/lio-single');
const exportDir = join(root, 'export');
const fileName = 'lio - an organic typeface by Lidia & Oli.html';

await rm(outDir, { recursive: true, force: true });
await build({
  root,
  logLevel: 'warn',
  build: {
    outDir,
    emptyOutDir: true,
    // Inline every imported asset (the Instrument fonts) as data URIs.
    assetsInlineLimit: () => true,
    cssCodeSplit: false,
    modulePreload: false,
    copyPublicDir: false,
  },
});

const read = (path) => readFile(join(root, path));
const dataUri = (buffer, type) => `data:${type};base64,${buffer.toString('base64')}`;

const assets = await readdir(join(outDir, 'assets'));
const jsFile = assets.filter((f) => f.endsWith('.js'));
const cssFile = assets.filter((f) => f.endsWith('.css'));
if (jsFile.length !== 1 || cssFile.length !== 1) {
  throw new Error(`Expected one JS and one CSS bundle, got ${assets.join(', ')}`);
}

let css = await readFile(join(outDir, 'assets', cssFile[0]), 'utf8');
// Lio itself lives in public/, which Vite does not inline: embed the woff2 by hand.
const lio = dataUri(await read('public/fonts/lio-Regular.woff2'), 'font/woff2');
css = css.replace(
  /url\(\/fonts\/lio-Regular\.woff2\)\s*format\(["']woff2["']\)\s*,\s*url\(\/fonts\/lio-Regular\.otf\)\s*format\(["']opentype["']\)/,
  () => `url(${lio}) format("woff2")`,
);
// Every browser that can run this page reads woff2, so the woff fallbacks are dead weight.
css = css.replace(/,\s*url\(data:font\/woff;base64,[^)]*\)\s*format\(["']woff["']\)/g, '');
if (css.includes('/fonts/lio-Regular')) throw new Error('Lio font was not inlined');

const js = (await readFile(join(outDir, 'assets', jsFile[0]), 'utf8')).replace(/<\/script/gi, '<\\/script');
const themeInit = (await read('public/theme-init.js')).toString();
const favicon = dataUri(await read('public/favicon.svg'), 'image/svg+xml');

let html = await readFile(join(outDir, 'index.html'), 'utf8');
const swap = (pattern, replacement) => {
  if (!pattern.test(html)) throw new Error(`Pattern not found: ${pattern}`);
  html = html.replace(pattern, () => replacement);
};

swap(/<link rel="icon"[^>]*>/, `<link rel="icon" type="image/svg+xml" href="${favicon}" />`);
swap(/\s*<link rel="preload"[^>]*lio-Regular[^>]*>/, '');
swap(/<!--[^>]*-->\s*<script src="\/theme-init\.js"><\/script>/, `<script>\n${themeInit}</script>`);
swap(/<script type="module"[^>]*src="[^"]*"><\/script>/, '');
swap(/<link rel="stylesheet"[^>]*>/, `<style>\n${css}</style>`);
// Module scripts run after parsing, so placing it at the end keeps the original order.
swap(/<\/body>/, `<script type="module">\n${js}</script>\n</body>`);

await mkdir(exportDir, { recursive: true });
await writeFile(join(exportDir, fileName), html);
await rm(outDir, { recursive: true, force: true });

console.log(`✓ export/${fileName} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
