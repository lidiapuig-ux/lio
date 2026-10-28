import '@fontsource-variable/instrument-sans';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import './styles/index.css';

import { $ } from './lib/dom';
import { observeReveals } from './lib/motion';
import { mountAlphabet } from './sections/alphabet';
import { mountDirections } from './sections/directions';
import { mountHero } from './sections/hero';
import { mountOrigins } from './sections/origins';
import { mountPoems } from './sections/poems';
import { mountSounds } from './sections/sounds';
import { mountStudio } from './sections/studio';
import { mountThemeToggle } from './sections/theme';

mountThemeToggle($<HTMLButtonElement>('[data-theme-toggle]'));
mountHero($('[data-hero-specimen]'));
mountDirections($('[data-directions]'), $('[data-sentence]'), $('[data-sentence-reading]'));
mountAlphabet($('[data-alphabet]'));
mountOrigins($('[data-origins]'));
mountSounds($('[data-sounds]'));
mountPoems($('[data-poems]'), $<HTMLInputElement>('[data-poem-readings]'));
mountStudio($('[data-studio]'));

// Start the hero only once Lio is ready, so the reveal never animates a fallback font.
document.fonts.load('1em Lio').finally(() => {
  document.documentElement.classList.add('fonts-ready');
  observeReveals();
});
