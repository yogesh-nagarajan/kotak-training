/**
 * supermoney-footer block.
 *
 * Expected authored structure (one column table), each row is a section:
 *   Row 1: brand row  -> logo + social links (single cell, image + links)
 *   Row 2..N-1: link columns -> each row = one or more cells, each cell holds
 *               an <h3> heading followed by a list/links (a column)
 *   Last row: legal bar -> copyright + legal links
 *
 * The block groups each cell that contains an <h3> into a footer column, and
 * treats the final row as the legal bar.
 *
 * @param {Element} block The supermoney-footer block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  const footer = document.createElement('div');
  footer.className = 'supermoney-footer-inner';

  // First row: brand (logo + social/contact)
  const brandRow = rows[0];
  if (brandRow) {
    const brand = document.createElement('div');
    brand.className = 'supermoney-footer-brand';
    [...brandRow.children].forEach((cell) => {
      while (cell.firstElementChild) brand.append(cell.firstElementChild);
    });
    // Tag social links by network so CSS can render the right icon.
    const NETWORKS = ['facebook', 'instagram', 'twitter', 'youtube'];
    brand.querySelectorAll('a[href]').forEach((a) => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      const net = NETWORKS.find((n) => href.includes(n)) || (href.includes('x.com') ? 'twitter' : null);
      if (net) {
        a.classList.add(`social-${net}`);
        a.setAttribute('aria-label', net);
      }
    });
    footer.append(brand);
  }

  // Middle rows: link columns
  const columnRows = rows.slice(1, -1);
  if (columnRows.length) {
    const columns = document.createElement('div');
    columns.className = 'supermoney-footer-columns';
    columnRows.forEach((row) => {
      [...row.children].forEach((cell) => {
        const col = document.createElement('div');
        col.className = 'supermoney-footer-column';
        while (cell.firstElementChild) col.append(cell.firstElementChild);
        if (col.children.length) columns.append(col);
      });
    });
    footer.append(columns);
  }

  // Last row: legal bar
  const legalRow = rows[rows.length - 1];
  if (legalRow && legalRow !== brandRow) {
    const legal = document.createElement('div');
    legal.className = 'supermoney-footer-legal';
    [...legalRow.children].forEach((cell) => {
      while (cell.firstElementChild) legal.append(cell.firstElementChild);
    });
    footer.append(legal);
  }

  block.replaceChildren(footer);
}
