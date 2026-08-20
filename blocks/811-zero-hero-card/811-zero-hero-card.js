import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the 811 zero hero card block
 *
 * A single self-contained block: four fixed cards (icon + title) followed by a
 * full-width rich-text description.
 *
 * The model uses element grouping, so Universal Editor delivers one cell per
 * group, in order:
 *   Row 1: Card 1 group — [image (+ alt), title]
 *   Row 2: Card 2 group — [image (+ alt), title]
 *   Row 3: Card 3 group — [image (+ alt), title]
 *   Row 4: Card 4 group — [image (+ alt), title]
 *   Row 5: Description (richtext)
 * Any field may be empty; each case is handled gracefully.
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
    const cell = row.firstElementChild || row;
    const img = cell.querySelector('img');
    // the title is the text content of the cell excluding the image
    const titleEl = [...cell.children].find((el) => !el.querySelector('picture, img') && el.tagName !== 'PICTURE' && el.textContent.trim());

    const item = document.createElement('li');
    item.className = 'four-cards-item';
    moveInstrumentation(row, item);

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

    const titleText = (titleEl?.textContent || '').trim();
    if (titleText) {
      const title = document.createElement('h3');
      title.className = 'four-cards-title';
      title.textContent = titleText;
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
