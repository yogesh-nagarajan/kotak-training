import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * supermoney-eligibility block.
 *
 * A rich-text section for the "Eligibility Criteria / Fees & Charges" content.
 * Authors paste headings, lists, and tables into the Content field in Universal
 * Editor. Optional Title renders as the section heading.
 *
 * Authored fields (each a row): Title, Content (richtext).
 *
 * @param {Element} block The supermoney-eligibility block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  let titleRow = null;
  let contentRow = null;
  rows.forEach((row) => {
    const cell = row.firstElementChild || row;
    if (cell.querySelector('table, ul, ol, h1, h2, h3, h4, h5, h6') || cell.children.length > 1) {
      contentRow = row;
    } else if (cell.textContent.trim() && !titleRow) {
      titleRow = row;
    } else if (!contentRow) {
      contentRow = row;
    }
  });

  if (titleRow && titleRow !== contentRow) {
    const h2 = document.createElement('h2');
    h2.className = 'supermoney-eligibility-title';
    moveInstrumentation(titleRow.firstElementChild, h2);
    h2.textContent = titleRow.textContent.trim();
    block.prepend(h2);
    titleRow.remove();
  }

  const inner = document.createElement('div');
  inner.className = 'supermoney-eligibility-inner';
  if (contentRow) {
    const cell = contentRow.firstElementChild || contentRow;
    while (cell.firstElementChild) inner.append(cell.firstElementChild);
    contentRow.remove();
  }

  // Wrap tables for horizontal scrolling on small screens.
  inner.querySelectorAll('table').forEach((table) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'supermoney-eligibility-table';
    table.replaceWith(wrapper);
    wrapper.append(table);
  });

  block.append(inner);
}
