import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the 811 zero hero card block
 *
 * Renders a row of cards (icon + title) followed by a full-width rich-text
 * description below the cards.
 *
 * Authored structure (container block with child items):
 *   - One row per Card item: [Icon Image (+ alt), Card Title]
 *   - One Description item (no image): rich text
 *
 * @param {Element} block The 811-zero-hero-card block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const cardRows = rows.filter((row) => row.querySelector('picture, img'));
  const descRows = rows.filter((row) => !row.querySelector('picture, img'));

  // --- cards ----------------------------------------------------------------
  const list = document.createElement('ul');
  list.className = 'four-cards-list';

  cardRows.forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((cell) => cell.querySelector('picture, img'));
    const titleCell = cells.find((cell) => cell !== imageCell && cell.textContent.trim());

    const item = document.createElement('li');
    item.className = 'four-cards-item';
    moveInstrumentation(row, item);

    const img = imageCell?.querySelector('img');
    if (img) {
      const icon = document.createElement('div');
      icon.className = 'four-cards-icon';
      const src = img.getAttribute('src') || img.src;
      const alt = (img.getAttribute('alt') || '').trim();
      // SVGs are already optimized; only raster icons go through the pipeline
      if (/\.svg(\?|$)/i.test(src)) {
        const svg = img.cloneNode(true);
        svg.loading = 'lazy';
        moveInstrumentation(img, svg);
        icon.append(svg);
      } else {
        const picture = createOptimizedPicture(src, alt, false, [{ width: '150' }]);
        moveInstrumentation(img, picture.querySelector('img'));
        icon.append(picture);
      }
      item.append(icon);
    }

    if (titleCell && titleCell.textContent.trim()) {
      const title = document.createElement('h3');
      title.className = 'four-cards-title';
      title.textContent = titleCell.textContent.trim();
      item.append(title);
    }

    list.append(item);
  });

  // --- description (below the cards) ----------------------------------------
  const description = document.createElement('div');
  description.className = 'four-cards-description';
  descRows.forEach((row) => {
    const cell = row.firstElementChild || row;
    moveInstrumentation(row, description);
    while (cell.firstElementChild) description.append(cell.firstElementChild);
  });

  block.replaceChildren();
  if (list.children.length) block.append(list);
  if (description.children.length) block.append(description);
}
