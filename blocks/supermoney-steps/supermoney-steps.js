import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * supermoney-steps block — "How to get started?" steps.
 *
 * Authored structure:
 *   Row 1 (single cell): Title
 *   Row 2..N (two cells): icon image + step text
 *
 * Rendered as a grey rounded box: heading on the left, the list of icon+text
 * steps on the right (matching the live page).
 *
 * @param {Element} block The supermoney-steps block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const titleRow = rows.find((row) => row.children.length === 1);
  const stepRows = rows.filter((row) => row.children.length >= 2);

  const inner = document.createElement('div');
  inner.className = 'supermoney-steps-inner';

  if (titleRow) {
    const title = titleRow.textContent.trim();
    if (title) {
      const h2 = document.createElement('h2');
      h2.className = 'supermoney-steps-title';
      moveInstrumentation(titleRow.firstElementChild, h2);
      h2.textContent = title;
      inner.append(h2);
    }
    titleRow.remove();
  }

  const ul = document.createElement('ul');
  ul.className = 'supermoney-steps-list';
  stepRows.forEach((row) => {
    const li = document.createElement('li');
    li.className = 'supermoney-step';
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((cell) => {
      if (cell.querySelector('picture, img')) {
        cell.className = 'supermoney-step-icon';
      } else {
        cell.className = 'supermoney-step-body';
      }
    });
    ul.append(li);
    row.remove();
  });
  inner.append(ul);

  block.replaceChildren(inner);
}
