import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the 811 zero-balance benefits card block
 *
 * Renders a row of benefit cards (icon + title), followed by an optional
 * full-width section description below the cards.
 *
 * Authored structure:
 *   - One row per Benefit Card item: [Icon Image (+ alt), Title]
 *   - An optional Text component row (no image) — the section description
 *
 * @param {Element} block The 811-zero-balance-hero-benefits-card block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const cardRows = rows.filter((row) => row.querySelector('picture, img'));
  const descRows = rows.filter((row) => !row.querySelector('picture, img'));

  // benefit cards
  const list = document.createElement('ul');
  list.className = 'benefits-cards';

  cardRows.forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((cell) => cell.querySelector('picture, img'));
    const titleCell = cells.find((cell) => cell !== imageCell && cell.textContent.trim());

    const li = document.createElement('li');
    li.className = 'benefit-card';
    moveInstrumentation(row, li);

    const img = imageCell?.querySelector('img');
    if (img) {
      const icon = document.createElement('div');
      icon.className = 'benefit-card-icon';
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
      li.append(icon);
    }

    if (titleCell && titleCell.textContent.trim()) {
      const title = document.createElement('h3');
      title.className = 'benefit-card-title';
      title.textContent = titleCell.textContent.trim();
      li.append(title);
    }

    list.append(li);
  });

  // full-width section description (below the cards)
  const description = document.createElement('div');
  description.className = 'benefits-description';
  descRows.forEach((row) => {
    const cell = row.firstElementChild || row;
    moveInstrumentation(row, description);
    while (cell.firstElementChild) description.append(cell.firstElementChild);
  });

  block.replaceChildren();
  if (list.children.length) block.append(list);
  if (description.children.length) block.append(description);
}
