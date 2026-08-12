import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the pvr-cta block — a full-bleed banner with a background
 * image and centered heading + call-to-action, matching the live Kotak PVR INOX
 * "Exclusive rewards, ultimate entertainment!" section.
 *
 * Authored rows (model order): image, imageAlt, title, button (link), buttonText.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const [imageRow, imageAltRow, titleRow, buttonRow, buttonTextRow] = rows;
  const cellOf = (row) => row?.firstElementChild;

  // --- Background image ---
  const media = document.createElement('div');
  media.className = 'pvr-cta-media';
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

  // --- Overlay content ---
  const content = document.createElement('div');
  content.className = 'pvr-cta-content';

  const titleText = cellOf(titleRow)?.textContent.trim();
  if (titleText) {
    const h2 = document.createElement('h2');
    h2.className = 'pvr-cta-title';
    h2.textContent = titleText;
    if (titleRow) moveInstrumentation(titleRow, h2);
    content.append(h2);
  }

  const linkAnchor = cellOf(buttonRow)?.querySelector('a');
  const buttonLink = linkAnchor?.getAttribute('href') || cellOf(buttonRow)?.textContent.trim();
  const buttonText = (cellOf(buttonTextRow)?.textContent || linkAnchor?.textContent || '').trim();
  if (buttonLink && buttonText) {
    const cta = document.createElement('a');
    cta.className = 'button primary pvr-cta-button';
    cta.href = buttonLink;
    cta.textContent = buttonText;
    const target = linkAnchor?.getAttribute('target');
    if (target && target !== 'undefined') cta.target = target;
    if (buttonRow) moveInstrumentation(buttonRow, cta);
    content.append(cta);
  }

  const children = [];
  if (media.childElementCount) children.push(media);
  children.push(content);
  block.replaceChildren(...children);
}
