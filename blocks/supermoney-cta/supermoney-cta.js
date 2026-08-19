import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * supermoney-cta block — "Get cashback on every swipe".
 *
 * Authored fields (each a row): Background Image, Title, Button (link + text).
 * Renders the image as a full-width background with the title and CTA button
 * overlaid.
 *
 * @param {Element} block The supermoney-cta block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  let imageRow = null;
  let titleRow = null;
  let ctaRow = null;

  rows.forEach((row) => {
    const cell = row.firstElementChild || row;
    const text = cell.textContent.trim();
    if (cell.querySelector('picture, img')) {
      imageRow = row;
    } else if (cell.querySelector('a')) {
      ctaRow = row;
    } else if (text && !titleRow) {
      titleRow = row;
    }
  });

  // Background image.
  if (imageRow) {
    const pic = imageRow.querySelector('picture, img');
    if (pic) {
      const bg = document.createElement('div');
      bg.className = 'supermoney-cta-bg';
      bg.append(pic.closest('picture') || pic);
      block.prepend(bg);
    }
  }

  // Content overlay.
  const content = document.createElement('div');
  content.className = 'supermoney-cta-content';

  if (titleRow) {
    const h2 = document.createElement('h2');
    h2.className = 'supermoney-cta-title';
    moveInstrumentation(titleRow.firstElementChild, h2);
    h2.textContent = titleRow.textContent.trim();
    content.append(h2);
  }

  if (ctaRow) {
    const cta = ctaRow.querySelector('a');
    if (cta) {
      cta.classList.add('button', 'supermoney-cta-button');
      const p = document.createElement('p');
      p.className = 'button-container';
      moveInstrumentation(ctaRow.firstElementChild, p);
      p.append(cta);
      content.append(p);
    }
  }

  const bg = block.querySelector('.supermoney-cta-bg');
  block.replaceChildren(...(bg ? [bg] : []), content);
}
