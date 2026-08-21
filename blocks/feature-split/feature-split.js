import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the feature-split block.
 *
 * A stack of alternating "zigzag" panels: each panel has an image on one side
 * and text (heading, description, CTA) on the other. Odd panels place the image
 * on the left / text on the right; even panels flip it — handled purely in CSS
 * so authoring stays simple (author just adds panels in order).
 *
 * Each authored panel row has an image cell and a richtext cell. Cells are
 * found by content (never by a fixed index). The block ships no images — they
 * are authored in AEM. Panels are below the first fold, so images are lazy.
 *
 * @param {Element} block The feature-split block element
 */

/**
 * Build a single panel from an authored row.
 * @param {Element} row The authored row (image + richtext)
 * @returns {Element} The decorated panel element
 */
function buildPanel(row) {
  const panel = document.createElement('div');
  panel.className = 'feature-split-panel';
  moveInstrumentation(row, panel);

  const cells = [...row.children];
  const imageCell = cells.find((cell) => cell.querySelector('picture, img'));
  const textCells = cells.filter((cell) => cell !== imageCell && cell.textContent.trim());

  // media column
  const media = document.createElement('div');
  media.className = 'feature-split-media';
  const img = imageCell?.querySelector('img');
  if (img) {
    const alt = (img.getAttribute('alt') || '').trim();
    const picture = createOptimizedPicture(
      img.getAttribute('src') || img.src,
      alt,
      false,
      [
        { media: '(min-width: 900px)', width: '900' },
        { width: '750' },
      ],
    );
    const optimized = picture.querySelector('img');
    optimized.setAttribute('loading', 'lazy');
    moveInstrumentation(img, optimized);
    media.append(picture);
  }

  // text column
  const text = document.createElement('div');
  text.className = 'feature-split-text';
  textCells.forEach((cell) => {
    while (cell.firstElementChild) text.append(cell.firstElementChild);
    if (!cell.firstElementChild && cell.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = cell.textContent.trim();
      text.append(p);
    }
  });

  // style the CTA link as the primary button
  const cta = text.querySelector('a');
  if (cta) {
    cta.classList.add('button', 'feature-split-cta');
    const wrapper = cta.closest('p');
    if (wrapper) wrapper.classList.add('button-container');
  }

  panel.append(media, text);
  return panel;
}

export default function decorate(block) {
  const rows = [...block.children];
  const panels = rows.map(buildPanel);
  block.textContent = '';
  panels.forEach((panel) => block.append(panel));
}
