import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the hero
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  // The block delivers rows: typically one with the background image (a picture),
  // and one (or more) with the text content (eyebrow, heading, subtext, CTA).
  const rows = [...block.children];

  // is this block in the first section? Only then is the background above the
  // fold (the page's LCP element) and worth prioritizing; otherwise lazy-load.
  const section = block.closest('.section');
  const isFirstSection = section && !section.previousElementSibling;

  const imageRow = rows.find((row) => row.querySelector('picture, img'));
  const contentRows = rows.filter((row) => row !== imageRow);

  if (imageRow) {
    imageRow.classList.add('hero-image');
    // rebuild the image as a responsive, optimized picture (small on mobile,
    // large on desktop) so it can be positioned as a full-bleed background
    const img = imageRow.querySelector('img');
    if (img) {
      const alt = (img.getAttribute('alt') || '').trim();
      const picture = createOptimizedPicture(
        img.getAttribute('src') || img.src,
        alt,
        isFirstSection,
        [
          { media: '(min-width: 900px)', width: '1600' },
          { width: '750' },
        ],
      );
      const optimized = picture.querySelector('img');
      if (isFirstSection) {
        optimized.setAttribute('fetchpriority', 'high');
        optimized.setAttribute('loading', 'eager');
      } else {
        optimized.setAttribute('loading', 'lazy');
      }
      moveInstrumentation(img, optimized);
      imageRow.replaceChildren(picture);
    }
  }

  // gather all text content into a single positioned wrapper, flattening the
  // row/cell wrapper divs so headings, paragraphs and the CTA sit directly
  // inside .hero-content
  const content = document.createElement('div');
  content.className = 'hero-content';
  contentRows.forEach((row) => {
    [...row.children].forEach((cell) => {
      while (cell.firstElementChild) content.append(cell.firstElementChild);
    });
    row.remove();
  });

  if (content.children.length) {
    // style the last link as the primary call-to-action button
    const cta = content.querySelector('a');
    if (cta) {
      cta.classList.add('button');
      const wrapper = cta.closest('p');
      if (wrapper) wrapper.classList.add('button-container');
    }
    block.append(content);
  }
}
