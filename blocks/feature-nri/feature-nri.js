import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the feature-nri block
 * @param {Element} block The feature-nri block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) {
    block.replaceChildren();
    return;
  }

  const ul = document.createElement('ul');

  rows.forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const li = document.createElement('li');
    li.className = 'feature-nri-card';
    moveInstrumentation(row, li);

    // Find the cell with image
    const imageCell = cells.find((cell) => cell.querySelector('picture, img'));
    const contentCells = cells.filter((cell) => cell !== imageCell);

    // Image container
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'feature-nri-image';
    const img = imageCell?.querySelector('img');
    if (img) {
      const optimizedPic = createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]);
      moveInstrumentation(img, optimizedPic.querySelector('img'));
      imageWrapper.append(optimizedPic);
    }
    li.append(imageWrapper);

    // Body container
    const body = document.createElement('div');
    body.className = 'feature-nri-body';

    const textWrapper = document.createElement('div');
    textWrapper.className = 'feature-nri-content';

    // Collect all elements from content cells
    const rawElements = [];
    contentCells.forEach((cell) => {
      while (cell.firstElementChild) {
        rawElements.push(cell.firstElementChild);
      }
    });

    const links = [];
    rawElements.forEach((el) => {
      // Extract links if whole paragraph is just a link or contains action links
      if (el.tagName === 'P' && el.querySelector('a') && el.textContent.trim() === el.querySelector('a').textContent.trim()) {
        const link = el.querySelector('a');
        links.push(link);
      } else if (el.tagName === 'A') {
        links.push(el);
      } else {
        if (/^H[1-6]$/.test(el.tagName)) {
          el.classList.add('feature-nri-title');
        }
        textWrapper.append(el);
      }
    });

    body.append(textWrapper);

    // Actions container
    if (links.length > 0) {
      const actions = document.createElement('div');
      actions.className = 'feature-nri-actions';

      links.forEach((link) => {
        const text = link.textContent.trim().toLowerCase();
        if (text.includes('know more') || text.includes('view') || text.includes('details')) {
          link.className = 'feature-nri-link feature-nri-know-more';
        } else if (text.includes('apply') || text.includes('open') || text.includes('get')) {
          link.className = 'button feature-nri-apply';
        } else {
          link.className = 'feature-nri-link';
        }
        actions.append(link);
      });

      body.append(actions);
    }

    li.append(body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
