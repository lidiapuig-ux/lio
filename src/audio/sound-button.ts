import { soundOf } from '../data/sounds';
import { h } from '../lib/dom';
import { playLetter } from './engine';
import { waveformSvg } from './waveform';

interface SoundButtonOptions {
  /** Visible text inside the button, e.g. the Latin letter. */
  label?: string;
  className?: string;
  /** Size of the inline waveform, or false for a text-only button. */
  wave?: { width: number; height: number; points?: number } | false;
}

/** A button that plays the organic sound paired with a letter. */
export function soundButton(letter: string, options: SoundButtonOptions = {}): HTMLButtonElement {
  const sound = soundOf(letter);
  if (!sound) throw new Error(`No sound for “${letter}”`);

  const button = h(
    'button',
    {
      type: 'button',
      class: ['sound-button', `sound-button--${sound.direction}`, options.className].filter(Boolean).join(' '),
      'aria-label': `Play ${letter}: ${sound.sound}`,
      title: `${sound.sound} · ${sound.materials.join(', ')}`,
    },
    options.label && h('span', { class: 'sound-button__label' }, options.label),
    options.wave !== false &&
      waveformSvg(letter, options.wave?.width ?? 40, options.wave?.height ?? 12, options.wave?.points ?? 40),
  );

  let timer = 0;
  button.addEventListener('click', () => {
    const seconds = playLetter(letter);
    button.classList.add('is-playing');
    window.clearTimeout(timer);
    timer = window.setTimeout(() => button.classList.remove('is-playing'), seconds * 1000);
  });

  return button;
}
