import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * supermoney-feature block — a single image + text feature row.
 *
 * Authored fields (each a row): Image, Title, Description. The "Image Position"
 * select maps to the `classes` field, so Universal Editor adds an
 * `image-left` or `image-right` class to the block directly — this decoration
 * just arranges the media and text.
 *
 * @param {Element} block The supermoney-feature block element
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
    while (cell.firstChild) desc.append(cell.firstChild);
    body.append(desc);
  });

  // Default to image-left when no layout class was authored.
  if (!block.classList.contains('image-left') && !block.classList.contains('image-right')) {
    block.classList.add('image-left');
  }

  block.replaceChildren(media, body);
}
