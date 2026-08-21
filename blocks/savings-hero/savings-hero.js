import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the savings-hero block.
 *
 * A full-bleed background image (the "811 Savings Account" photo) with the text
 * content overlaid on the left: a heading, a line of sub-text and a primary CTA
 * button. Text and CTA are authored in a single richtext cell.
 *
 * Rows are classified by content (never by a fixed index): the row carrying an
 * image is the background, the remaining row(s) hold the text.
 *
 * The block ships no images — the background is authored in AEM. The image is
 * only eager/high-priority when this block is in the first section (i.e. it is
 * the page's LCP element); when it appears further down the page it is lazily
 * loaded so it does not compete with the real above-the-fold LCP image.
 *
 * @param {Element} block The savings-hero block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  const imageRow = rows.find((row) => row.querySelector('picture, img'));
  const contentRows = rows.filter((row) => row !== imageRow);

  // Is this block in the first section? Only then is its image above the fold
  // and worth prioritizing. Otherwise it is below the fold -> lazy load.
  const section = block.closest('.section');
  const isFirstSection = section && !section.previousElementSibling;

  // background image, served responsively
  if (imageRow) {
    const media = document.createElement('div');
    media.className = 'savings-hero-image';
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
      media.append(picture);
    }
    imageRow.remove();
    block.prepend(media);
  }

  // gather text content into a single overlaid wrapper, flattening the
  // row/cell wrappers so heading, subtext and CTA sit directly inside it
  const content = document.createElement('div');
  content.className = 'savings-hero-content';
  contentRows.forEach((row) => {
    [...row.children].forEach((cell) => {
      while (cell.firstElementChild) content.append(cell.firstElementChild);
    });
    row.remove();
  });

  if (content.children.length) {
    // style the CTA link as the primary button
    const cta = content.querySelector('a');
    if (cta) {
      cta.classList.add('button', 'savings-hero-cta');
      const wrapper = cta.closest('p');
      if (wrapper) wrapper.classList.add('button-container');
    }
    block.append(content);
  }
}
