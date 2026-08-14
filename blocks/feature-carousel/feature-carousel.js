import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Build a single carousel item from an authored row.
 *
 * The authored row has two cells: an icon image and a label. Cells are
 * identified by their content rather than a fixed position so the block stays
 * resilient when a field is empty or an extra cell is present.
 * @param {Element} row The authored row element
 * @returns {Element} The decorated item
 */
function buildItem(row) {
  const cells = [...row.children];
  const imageCell = cells.find((cell) => cell.querySelector('picture, img'));
  const labelCell = cells.find((cell) => cell !== imageCell && cell.textContent.trim());

  const item = document.createElement('div');
  item.className = 'feature-carousel-item';
  moveInstrumentation(row, item);

  const icon = document.createElement('div');
  icon.className = 'feature-carousel-icon';

  const img = imageCell?.querySelector('img');
  if (img) {
    const alt = (img.getAttribute('alt') || '').trim();
    const src = img.getAttribute('src') || img.src;
    // SVG icons are already vector/optimized; only raster icons benefit from
    // the image optimization pipeline.
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
  item.append(icon);

  const label = document.createElement('div');
  label.className = 'feature-carousel-label';
  if (labelCell) {
    label.textContent = labelCell.textContent.trim();
  }
  item.append(label);

  return item;
}

/**
 * loads and decorates the feature-carousel block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const items = rows.map(buildItem);

  const track = document.createElement('div');
  track.className = 'feature-carousel-track';
  items.forEach((item) => track.append(item));

  block.textContent = '';
  block.setAttribute('role', 'region');
  block.setAttribute('aria-label', 'Feature carousel');

  // nothing authored -> render nothing further
  if (!items.length) return;

  block.append(track);

  // previous / next arrows
  const makeArrow = (dir, aria) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `feature-carousel-arrow feature-carousel-arrow-${dir}`;
    btn.setAttribute('aria-label', aria);
    return btn;
  };
  const prev = makeArrow('prev', 'Previous features');
  const next = makeArrow('next', 'Next features');
  block.append(prev, next);

  // scroll by roughly one visible group of items
  const getScrollAmount = () => {
    const first = track.querySelector('.feature-carousel-item');
    if (!first) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const itemWidth = first.getBoundingClientRect().width + gap;
    const perView = Math.max(1, Math.floor(track.clientWidth / itemWidth));
    return itemWidth * perView;
  };

  const updateArrows = () => {
    const scrollable = track.scrollWidth - track.clientWidth > 1;
    block.classList.toggle('feature-carousel-scrollable', scrollable);
    if (!scrollable) {
      prev.disabled = true;
      next.disabled = true;
      return;
    }
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
  };

  prev.addEventListener('click', () => {
    track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
  });
  next.addEventListener('click', () => {
    track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
  });

  track.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  updateArrows();
}
