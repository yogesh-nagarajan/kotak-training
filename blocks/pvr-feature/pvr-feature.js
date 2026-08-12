import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the pvr-feature block — an alternating text/image row
 * matching the live Kotak PVR INOX feature sections.
 *
 * Authored rows (model order): image, imageAlt, title, text (richtext).
 * Add the class `pvr-feature-reverse` to place the image on the left.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const [imageRow, imageAltRow, titleRow, textRow] = rows;
  const cellOf = (row) => row?.firstElementChild;

  // --- Media column ---
  const media = document.createElement('div');
  media.className = 'pvr-feature-media';
  const imageCell = cellOf(imageRow);
  const imageAlt = cellOf(imageAltRow)?.textContent.trim() || '';
  if (imageCell) {
    let picture = imageCell.querySelector('picture');
    const img = imageCell.querySelector('img');
    if (!picture && img) {
      picture = document.createElement('picture');
      picture.append(img);
    }
    if (picture) {
      const finalImg = picture.querySelector('img');
      if (finalImg) {
        if (imageAlt) finalImg.alt = imageAlt;
        finalImg.loading = 'lazy';
      }
      if (imageRow) moveInstrumentation(imageRow, media);
      media.append(picture);
    }
  }

  // --- Content column ---
  const content = document.createElement('div');
  content.className = 'pvr-feature-content';

  const titleText = cellOf(titleRow)?.textContent.trim();
  if (titleText) {
    const h2 = document.createElement('h2');
    h2.className = 'pvr-feature-title';
    h2.textContent = titleText;
    if (titleRow) moveInstrumentation(titleRow, h2);
    content.append(h2);
  }

  const textCell = cellOf(textRow);
  if (textCell && textCell.textContent.trim()) {
    const text = document.createElement('div');
    text.className = 'pvr-feature-text';
    if (textRow) moveInstrumentation(textRow, text);
    text.append(...textCell.childNodes);
    content.append(text);
  }

  const children = [];
  if (media.childElementCount) children.push(media);
  children.push(content);
  block.replaceChildren(...children);
}
