import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * supermoney-content block — long-form rich text with headings, lists, and
 * fee/cashback tables.
 *
 * Authored fields (each a row): Title, Content (richtext), Read more/less.
 * When "Read more / read less" is enabled, long content is clamped and a
 * toggle button expands/collapses it.
 *
 * @param {Element} block The supermoney-content block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  let titleRow = null;
  let collapsibleRow = null;
  let contentRow = null;
  rows.forEach((row) => {
    const cell = row.firstElementChild || row;
    const text = cell.textContent.trim();
    if (cell.querySelector('table, ul, ol, h1, h2, h3, h4, h5, h6, p') || cell.children.length > 1) {
      contentRow = row;
    } else if (/^(on|off)$/i.test(text)) {
      collapsibleRow = row;
    } else if (text && !titleRow) {
      titleRow = row;
    }
  });

  const collapsible = collapsibleRow
    ? collapsibleRow.textContent.trim().toLowerCase() !== 'off'
    : true;

  if (titleRow && titleRow !== contentRow) {
    const h2 = document.createElement('h2');
    h2.className = 'supermoney-content-title';
    moveInstrumentation(titleRow.firstElementChild, h2);
    h2.textContent = titleRow.textContent.trim();
    block.prepend(h2);
    titleRow.remove();
  }
  if (collapsibleRow) collapsibleRow.remove();

  const inner = document.createElement('div');
  inner.className = 'supermoney-content-inner';
  if (contentRow) {
    const cell = contentRow.firstElementChild || contentRow;
    while (cell.firstElementChild) inner.append(cell.firstElementChild);
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

  // Read more / read less.
  if (collapsible) {
    block.classList.add('is-collapsible', 'is-collapsed');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'supermoney-content-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Read More';
    toggle.addEventListener('click', () => {
      const collapsed = block.classList.toggle('is-collapsed');
      toggle.setAttribute('aria-expanded', String(!collapsed));
      toggle.textContent = collapsed ? 'Read More' : 'Read Less';
    });
    block.append(toggle);
  }
}
