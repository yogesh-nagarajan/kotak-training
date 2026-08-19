/**
 * supermoney-content block — long-form rich text with headings, lists, and
 * fee/cashback tables. The whole body is one richtext field; this decoration
 * unwraps the single cell and wraps any tables for responsive scrolling.
 *
 * @param {Element} block The supermoney-content block element
 */
export default function decorate(block) {
  const inner = document.createElement('div');
  inner.className = 'supermoney-content-inner';

  [...block.children].forEach((row) => {
    const cell = row.firstElementChild || row;
    while (cell.firstElementChild) inner.append(cell.firstElementChild);
    row.remove();
  });

  // Make tables horizontally scrollable on small screens.
  inner.querySelectorAll('table').forEach((table) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'supermoney-content-table';
    table.replaceWith(wrapper);
    wrapper.append(table);
  });

  block.append(inner);
}
