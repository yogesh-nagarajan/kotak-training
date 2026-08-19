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

  // Check if first row is a block-level main title (single cell without picture/img)
  let titleEl = null;
  const firstRow = rows[0];
  const firstRowCells = [...firstRow.children];
  if (
    rows.length > 1
    && firstRowCells.length === 1
    && !firstRow.querySelector('picture, img')
  ) {
    const heading = firstRow.querySelector('h1, h2, h3, h4, h5, h6');
    titleEl = document.createElement('h2');
    titleEl.className = 'feature-nri-main-title';
    if (heading) {
      titleEl.innerHTML = heading.innerHTML;
    } else {
      titleEl.textContent = firstRow.textContent.trim();
    }
    moveInstrumentation(firstRow, titleEl);
    rows.shift();
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
      const optimizedPic = createOptimizedPicture(
        img.src,
        img.alt || '',
        false,
        [{ width: '750' }],
      );
      moveInstrumentation(img, optimizedPic.querySelector('img'));
      imageWrapper.append(optimizedPic);
    }
    li.append(imageWrapper);

    // Body container
    const body = document.createElement('div');
    body.className = 'feature-nri-body';

    const textWrapper = document.createElement('div');
    textWrapper.className = 'feature-nri-content';

    const links = [];

    contentCells.forEach((cell) => {
      const directLink = cell.querySelector('a');
      const directChildren = [...cell.children];

      const isSingleLinkCell = directLink
        && directChildren.length <= 1
        && cell.textContent.trim() === directLink.textContent.trim();

      if (isSingleLinkCell) {
        links.push(directLink);
        return;
      }

      if (directChildren.length === 0 && cell.textContent.trim()) {
        const p = document.createElement('h3');
        p.className = 'feature-nri-title';
        p.textContent = cell.textContent.trim();
        textWrapper.append(p);
        return;
      }

      directChildren.forEach((el) => {
        const isStandaloneLink = el.tagName === 'P'
          && el.querySelector('a')
          && el.textContent.trim() === el.querySelector('a').textContent.trim();

        if (isStandaloneLink) {
          links.push(el.querySelector('a'));
        } else if (el.tagName === 'A') {
          links.push(el);
        } else {
          if (/^H[1-6]$/.test(el.tagName)) {
            el.classList.add('feature-nri-title');
          }
          textWrapper.append(el);
        }
      });
    });

    body.append(textWrapper);

    // Actions container
    if (links.length > 0) {
      const actions = document.createElement('div');
      actions.className = 'feature-nri-actions';

      links.forEach((link) => {
        const text = link.textContent.trim().toLowerCase();
        if (text.includes('apply') || text.includes('open') || text.includes('get')) {
          link.className = 'button feature-nri-apply';
        } else {
          link.className = 'feature-nri-link feature-nri-know-more';
        }
        actions.append(link);
      });

      body.append(actions);
    }

    li.append(body);
    ul.append(li);
  });

  const elementsToReplace = titleEl ? [titleEl, ul] : [ul];
  block.replaceChildren(...elementsToReplace);
}
