import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the usp-cards-811-business block
 *
 * A responsive grid of feature cards. Each row of the authored block table is
 * one card (icon image + text). Renders as a <ul>/<li> grid: 4 per row on
 * desktop, 2 on tablet, 1-2 on mobile.
 *
 * When placed in a section with the "overlap-cards" style, the block pulls up
 * to overlap the hero above it (see CSS); this is opt-in and resets on mobile.
 *
 * @param {Element} block The usp-cards-811-business block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture, img')) {
        div.className = 'usp-cards-811-business-icon';
      } else {
        div.className = 'usp-cards-811-business-body';
      }
    });
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(ul);
}
