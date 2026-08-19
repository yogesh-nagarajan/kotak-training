import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the nri-banner block
 * @param {Element} block The nri-banner block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) {
    return;
  }

  let img = null;
  let titleEl = null;
  const descNodes = [];
  let buttonEl = null;

  // Flatten all cells across rows to parse fields flexibly
  const allCells = rows.flatMap((row) => [...row.children]);

  allCells.forEach((cell) => {
    // 1. Check for image
    const picOrImg = cell.querySelector('picture, img');
    if (picOrImg && !img) {
      img = cell.querySelector('img');
    }

    // Process all children/nodes inside this cell
    const children = [...cell.children];

    // If cell contains plain text without child tags
    if (children.length === 0 && cell.textContent.trim()) {
      const text = cell.textContent.trim();
      if (!titleEl) {
        const h1 = document.createElement('h1');
        h1.textContent = text;
        titleEl = h1;
      } else if (!buttonEl && (text.startsWith('http') || text.includes('apply'))) {
        const a = document.createElement('a');
        a.href = text;
        a.textContent = 'Apply Now';
        buttonEl = a;
      } else {
        const p = document.createElement('p');
        p.textContent = text;
        descNodes.push(p);
      }
      return;
    }

    children.forEach((el) => {
      // Check if image element
      if (el.matches('picture') || el.querySelector('picture, img')) {
        return;
      }

      // Check if button/link
      if (el.matches('a')) {
        if (!buttonEl) buttonEl = el;
        return;
      }

      if (el.matches('p') && el.querySelector('a') && el.textContent.trim() === el.querySelector('a').textContent.trim()) {
        if (!buttonEl) buttonEl = el.querySelector('a');
        return;
      }

      // Check if heading / title
      if (/^H[1-6]$/.test(el.tagName)) {
        if (!titleEl) titleEl = el;
        return;
      }

      // Remaining elements are description/text
      descNodes.push(el);
    });
  });

  // Create block DOM structure
  const container = document.createElement('div');
  container.className = 'nri-banner-container';

  // Image wrapper
  if (img) {
    const bgWrapper = document.createElement('div');
    bgWrapper.className = 'nri-banner-image';
    const optimizedPic = createOptimizedPicture(
      img.src,
      img.alt || 'NRI Banner',
      false,
      [{ width: '1600' }],
    );
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    bgWrapper.append(optimizedPic);
    container.append(bgWrapper);
  }

  // Content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'nri-banner-content';

  const innerContent = document.createElement('div');
  innerContent.className = 'nri-banner-inner';

  if (titleEl) {
    const h1 = document.createElement('h1');
    h1.className = 'nri-banner-title';
    h1.innerHTML = titleEl.innerHTML;
    moveInstrumentation(titleEl, h1);
    innerContent.append(h1);
  }

  if (descNodes.length > 0) {
    const desc = document.createElement('div');
    desc.className = 'nri-banner-desc';
    descNodes.forEach((node) => desc.append(node));
    innerContent.append(desc);
  }

  if (buttonEl) {
    const btnBox = document.createElement('p');
    btnBox.className = 'nri-banner-btn-box';
    buttonEl.className = 'button nri-banner-btn';
    btnBox.append(buttonEl);
    innerContent.append(btnBox);
  }

  contentWrapper.append(innerContent);
  container.append(contentWrapper);

  block.replaceChildren(container);
}
