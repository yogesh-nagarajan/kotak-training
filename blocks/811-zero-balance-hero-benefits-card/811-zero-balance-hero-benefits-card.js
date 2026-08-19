import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the 811 zero-balance benefits card block
 * Renders a horizontal list of benefit cards (icon + title).
 *
 * Block structure:
 *   - One row per authored Benefit Card item — each item cell-group is
 *     [Icon Image (+ alt), Card Title (richtext)].
 *
 * @param {Element} block The 811-zero-balance-hero-benefits-card block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // each card row carries an image icon and a title
  const cardRows = rows.filter((row) => row.querySelector('picture, img'));

  // --- benefit cards --------------------------------------------------------
  const list = document.createElement('ul');
  list.className = 'benefits-list';

  cardRows.forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((cell) => cell.querySelector('picture, img'));
    const titleCell = cells.find((cell) => cell !== imageCell && cell.textContent.trim());

    const li = document.createElement('li');
    li.className = 'benefit-card';
    moveInstrumentation(row, li);

    // icon
    const icon = document.createElement('div');
    icon.className = 'benefit-icon';
    const img = imageCell?.querySelector('img');
    if (img) {
      const src = img.getAttribute('src') || img.src;
      const alt = (img.getAttribute('alt') || '').trim();
      // SVG icons are already vector/optimized; only raster icons benefit from
      // the image optimization pipeline
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
    }
    li.append(icon);

    // title (rendered as an h2, matching the reference markup)
    if (titleCell && titleCell.textContent.trim()) {
      const title = document.createElement('h2');
      // keep authored richtext markup where present, otherwise plain text
      if (titleCell.firstElementChild) {
        title.innerHTML = titleCell.innerHTML;
      } else {
        title.textContent = titleCell.textContent.trim();
      }
      li.append(title);
    }

    list.append(li);
  });

  // --- assemble -------------------------------------------------------------
  const container = document.createElement('div');
  container.className = 'container';
  if (list.children.length) container.append(list);

  block.replaceChildren();
  block.append(container);
}
