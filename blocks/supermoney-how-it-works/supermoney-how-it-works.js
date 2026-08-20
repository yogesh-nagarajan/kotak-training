import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * supermoney-how-it-works block — dedicated "How it works" section.
 *
 * Hard-coded image-right layout (text on the left, image on the right) matching
 * the live page. Handles multi-paragraph descriptions.
 *
 * Authored fields (each a row): Title, Description (richtext), Image, Image Alt.
 *
 * @param {Element} block The supermoney-how-it-works block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  let imageRow = null;
  const textRows = [];
  rows.forEach((row) => {
    const cell = row.firstElementChild || row;
    if (cell.querySelector('picture, img')) {
      imageRow = row;
    } else if (cell.textContent.trim() || cell.children.length) {
      textRows.push(row);
    }
  });

  const [titleRow, ...descRows] = textRows;

  // Text side (left).
  const body = document.createElement('div');
  body.className = 'supermoney-how-it-works-body';
  if (titleRow) {
    const h2 = document.createElement('h2');
    h2.className = 'supermoney-how-it-works-title';
    moveInstrumentation(titleRow.firstElementChild, h2);
    h2.textContent = titleRow.textContent.trim();
    body.append(h2);
  }
  descRows.forEach((row) => {
    const desc = document.createElement('div');
    desc.className = 'supermoney-how-it-works-description';
    const cell = row.firstElementChild || row;
    moveInstrumentation(cell, desc);
    while (cell.firstChild) desc.append(cell.firstChild);
    body.append(desc);
  });

  // Media side (right).
  const media = document.createElement('div');
  media.className = 'supermoney-how-it-works-media';
  if (imageRow) {
    const pic = imageRow.querySelector('picture, img');
    if (pic) media.append(pic.closest('picture') || pic);
  }

  // Wrap in a grey rounded box (matching supermoney-steps).
  const inner = document.createElement('div');
  inner.className = 'supermoney-how-it-works-inner';
  inner.append(body, media);

  block.replaceChildren(inner);
}
