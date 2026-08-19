import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * supermoney-content block — long-form rich text with headings, lists, and
 * fee/cashback tables.
 *
 * Authored fields (each a row): Title, Content (richtext).
 *
 * @param {Element} block The supermoney-content block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  let titleRow = null;
  let contentRow = null;
  rows.forEach((row) => {
    const cell = row.firstElementChild || row;
    if (cell.querySelector('table, ul, ol, h1, h2, h3, h4, h5, h6, p') || cell.children.length > 1) {
      contentRow = row;
    } else if (cell.textContent.trim() && !titleRow) {
      titleRow = row;
    } else if (!contentRow) {
      contentRow = row;
    }
  });

  if (titleRow && titleRow !== contentRow) {
    const h2 = document.createElement('h2');
    h2.className = 'supermoney-content-title';
    moveInstrumentation(titleRow.firstElementChild, h2);
    h2.textContent = titleRow.textContent.trim();
    block.prepend(h2);
    titleRow.remove();
  }

  const inner = document.createElement('div');
  inner.className = 'supermoney-content-inner';
  if (contentRow) {
    const cell = contentRow.firstElementChild || contentRow;
    // Move all nodes (elements and text) so rich-text content renders intact.
    while (cell.firstChild) inner.append(cell.firstChild);
    contentRow.remove();
  }

  // Make tables horizontally scrollable on small screens.
  inner.querySelectorAll('table').forEach((table) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'supermoney-content-table';
    table.replaceWith(wrapper);
    wrapper.append(table);
  });

  block.append(inner);
}
