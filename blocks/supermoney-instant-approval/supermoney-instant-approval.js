import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * supermoney-instant-approval block — dedicated "Instant approval without CIBIL
 * score" section.
 *
 * Hard-coded layout: text on the left, image on the right (matching live).
 * Fields: Title, Description (richtext), Image, Image Alt.
 *
 * @param {Element} block The supermoney-instant-approval block element
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
  body.className = 'supermoney-instant-approval-body';
  if (titleRow) {
    const h2 = document.createElement('h2');
    h2.className = 'supermoney-instant-approval-title';
    moveInstrumentation(titleRow.firstElementChild, h2);
    h2.textContent = titleRow.textContent.trim();
    body.append(h2);
  }
  descRows.forEach((row) => {
    const desc = document.createElement('div');
    desc.className = 'supermoney-instant-approval-description';
    const cell = row.firstElementChild || row;
    moveInstrumentation(cell, desc);
    while (cell.firstChild) desc.append(cell.firstChild);
    body.append(desc);
  });

  // Media side (right).
  const media = document.createElement('div');
  media.className = 'supermoney-instant-approval-media';
  if (imageRow) {
    const pic = imageRow.querySelector('picture, img');
    if (pic) media.append(pic.closest('picture') || pic);
  }

  block.replaceChildren(body, media);
}
