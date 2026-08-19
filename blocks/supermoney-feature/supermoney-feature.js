import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * supermoney-feature block — a single image + text feature row.
 *
 * Authored fields (each a row): Image, Title, Description, Image Position.
 * "Image Position" (left|right) controls which side the image sits on, so one
 * block covers left-image, right-image ("reverse"), Scan & pay, How it works…
 *
 * @param {Element} block The supermoney-feature block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  let imageRow = null;
  let positionRow = null;
  const textRows = [];

  rows.forEach((row) => {
    const cell = row.firstElementChild || row;
    const text = cell.textContent.trim();
    if (cell.querySelector('picture, img')) {
      imageRow = row;
    } else if (/^(left|right)$/i.test(text)) {
      positionRow = row;
    } else if (text) {
      textRows.push(row);
    }
  });

  const position = positionRow ? positionRow.textContent.trim().toLowerCase() : 'left';
  const [titleRow, ...descRows] = textRows;

  // Media side.
  const media = document.createElement('div');
  media.className = 'supermoney-feature-media';
  if (imageRow) {
    const pic = imageRow.querySelector('picture, img');
    if (pic) media.append(pic.closest('picture') || pic);
  }

  // Text side.
  const body = document.createElement('div');
  body.className = 'supermoney-feature-body';
  if (titleRow) {
    const h2 = document.createElement('h2');
    h2.className = 'supermoney-feature-title';
    moveInstrumentation(titleRow.firstElementChild, h2);
    h2.textContent = titleRow.textContent.trim();
    body.append(h2);
  }
  descRows.forEach((row) => {
    const desc = document.createElement('div');
    desc.className = 'supermoney-feature-description';
    const cell = row.firstElementChild || row;
    moveInstrumentation(cell, desc);
    while (cell.firstElementChild) desc.append(cell.firstElementChild);
    if (!desc.firstElementChild && cell.textContent.trim()) {
      desc.textContent = cell.textContent.trim();
    }
    body.append(desc);
  });

  block.classList.add(position === 'right' ? 'image-right' : 'image-left');
  block.replaceChildren(media, body);
}
