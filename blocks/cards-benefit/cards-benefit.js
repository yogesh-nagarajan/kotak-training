import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    [...row.children].forEach((cell) => {
      // Skip empty cells (e.g. the unused image slot in the text-only variant)
      if (!cell.textContent.trim() && !cell.querySelector('picture, img')) return;
      if (cell.querySelector('picture, img')) cell.className = 'cards-benefit-card-image';
      else cell.className = 'cards-benefit-card-body';
      li.append(cell);
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
