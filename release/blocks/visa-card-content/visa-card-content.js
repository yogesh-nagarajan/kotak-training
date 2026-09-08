import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the visa-card-content block
 *
 * Authoring model (one field per row, positional):
 *   Row 1: pretitle (p)
 *   Row 2: description (richtext)
 *   Row 3: image (DAM reference)
 *   Row 4: imageAlt (text)
 *
 * The `image-left` / `image-right` class (from the variation field) controls
 * which side the image sits on; the layout stacks on mobile.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const [pretitleCell, descriptionCell, imageCell, imageAltCell] = rows
    .map((row) => row.firstElementChild);

  const content = document.createElement('div');
  content.className = 'visa-card-content-content';

  // pretitle
  const pretitle = (pretitleCell?.textContent || '').trim();
  if (pretitle) {
    const el = document.createElement('p');
    el.className = 'visa-card-content-pretitle';
    el.textContent = pretitle;
    if (rows[0]) moveInstrumentation(rows[0], el);
    content.append(el);
  }

  // description (richtext)
  if (descriptionCell && descriptionCell.textContent.trim()) {
    const desc = document.createElement('div');
    desc.className = 'visa-card-content-description';
    if (rows[1]) moveInstrumentation(rows[1], desc);
    [...descriptionCell.childNodes].forEach((node) => desc.append(node));
    content.append(desc);
  }

  // image
  const media = document.createElement('div');
  media.className = 'visa-card-content-media';
  const img = imageCell?.querySelector('img');
  if (img) {
    const alt = (imageAltCell?.textContent || img.getAttribute('alt') || '').trim();
    const picture = createOptimizedPicture(img.src, alt, false, [{ width: '750' }]);
    const pictureImg = picture.querySelector('img');
    pictureImg.className = 'visa-card-content-image';
    moveInstrumentation(img, pictureImg);
    media.append(picture);
  }

  // default the variation when the author hasn't picked one
  if (!block.classList.contains('image-left') && !block.classList.contains('image-right')) {
    block.classList.add('image-left');
  }

  block.textContent = '';
  block.append(content);
  if (media.childElementCount) block.append(media);
}
