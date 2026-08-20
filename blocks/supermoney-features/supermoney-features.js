import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * supermoney-features block — alternating image + text feature rows
 * ("One account - 3X benefits": lifetime free, instant approval, scan & pay…).
 *
 * Authored structure:
 *   Row 1 (single cell): Title       [optional]
 *   Row 2 (single cell): Subtitle    [optional]
 *   Row 3..N (two cells): image + text
 * Image position follows the authored cell order: image-cell-first renders the
 * image on the left; text-cell-first renders it on the right. This lets the
 * author reproduce the live page's irregular (non-alternating) layout.
 *
 * @param {Element} block The supermoney-features block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const headingRows = rows.filter((row) => row.children.length === 1);
  const featureRows = rows.filter((row) => row.children.length >= 2);

  // Optional heading (title + subtitle).
  if (headingRows.length) {
    const header = document.createElement('div');
    header.className = 'supermoney-features-header';
    const [titleRow, subtitleRow] = headingRows;
    const titleText = titleRow && titleRow.textContent.trim();
    if (titleText) {
      const h2 = document.createElement('h2');
      h2.className = 'supermoney-features-title';
      moveInstrumentation(titleRow.firstElementChild, h2);
      h2.textContent = titleText;
      header.append(h2);
    }
    const subtitleText = subtitleRow && subtitleRow.textContent.trim();
    if (subtitleText) {
      const p = document.createElement('p');
      p.className = 'supermoney-features-subtitle';
      moveInstrumentation(subtitleRow.firstElementChild, p);
      p.textContent = subtitleText;
      header.append(p);
    }
    if (header.childElementCount) block.prepend(header);
    headingRows.forEach((row) => row.remove());
  }

  const list = document.createElement('div');
  list.className = 'supermoney-features-list';
  featureRows.forEach((row) => {
    const item = document.createElement('div');
    item.className = 'supermoney-feature';
    // If the first authored cell is text (no image), render the image on the
    // right; otherwise image stays on the left.
    const firstCell = row.firstElementChild;
    const imageFirst = firstCell && firstCell.querySelector('picture, img');
    if (!imageFirst) item.classList.add('supermoney-feature-reverse');
    moveInstrumentation(row, item);
    while (row.firstElementChild) item.append(row.firstElementChild);
    [...item.children].forEach((cell) => {
      if (cell.querySelector('picture, img')) {
        cell.className = 'supermoney-feature-media';
      } else {
        cell.className = 'supermoney-feature-body';
      }
    });
    list.append(item);
    row.remove();
  });

  block.append(list);
}
