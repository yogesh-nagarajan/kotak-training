/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the supermoney-footer block.
 *
 * Runs on the live site footer (footer.footer) and emits the authored block:
 *   Row 1: brand (logo + social links)
 *   Row 2: link columns  -> one cell per column (h3 + link list)
 *   Row 3: legal bar (copyright + legal links)
 */
export default function parse(element, { document }) {
  const cells = [];

  // --- Row 1: brand (logo + social) ---
  const brandCell = [];
  const logo = element.querySelector('img');
  if (logo) {
    const p = document.createElement('p');
    p.append(logo);
    brandCell.push(p);
  }
  // Social links = the "Follow us" list (first small list of external social links).
  const socialList = [...element.querySelectorAll('ul')].find((ul) => ul.querySelector('a[href*="facebook"], a[href*="instagram"], a[href*="twitter"], a[href*="youtube"]'));
  if (socialList) {
    const clean = document.createElement('ul');
    socialList.querySelectorAll(':scope > li a').forEach((a) => {
      const li = document.createElement('li');
      const na = document.createElement('a');
      na.href = a.getAttribute('href') || '#';
      na.textContent = (a.getAttribute('href') || '').replace(/https?:\/\/(www\.)?/, '').split('.')[0] || 'link';
      li.append(na);
      clean.append(li);
    });
    brandCell.push(clean);
  }
  cells.push([brandCell]);

  // --- Row 2: link columns (each h3 + following list becomes one cell) ---
  const columnCells = [];
  element.querySelectorAll('h3').forEach((h3) => {
    const heading = (h3.textContent || '').trim();
    // Skip non-column headings (e.g. brand headings without a following list).
    let list = h3.nextElementSibling;
    while (list && list.tagName !== 'UL') list = list.nextElementSibling;
    if (!list) return;
    const cell = [];
    const newH3 = document.createElement('h3');
    newH3.textContent = heading;
    cell.push(newH3);
    const clean = document.createElement('ul');
    list.querySelectorAll(':scope > li a').forEach((a) => {
      const li = document.createElement('li');
      const na = document.createElement('a');
      na.href = a.getAttribute('href') || '#';
      na.textContent = (a.textContent || '').trim();
      li.append(na);
      clean.append(li);
    });
    if (clean.children.length) {
      cell.push(clean);
      columnCells.push(cell);
    }
  });
  if (columnCells.length) cells.push(columnCells);

  // --- Row 3: legal bar (bottom list with copyright + legal links) ---
  const legalList = [...element.querySelectorAll('ul')].reverse()
    .find((ul) => ul.querySelector('a[href*="privacy"], a[href*="terms"], a[href*="disclaimer"]'));
  if (legalList) {
    const clean = document.createElement('ul');
    legalList.querySelectorAll(':scope > li').forEach((li) => {
      const a = li.querySelector('a');
      const newLi = document.createElement('li');
      if (a) {
        const na = document.createElement('a');
        na.href = a.getAttribute('href') || '#';
        na.textContent = (li.textContent || '').trim();
        newLi.append(na);
      } else {
        newLi.textContent = (li.textContent || '').trim();
      }
      clean.append(newLi);
    });
    cells.push([[clean]]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'supermoney-footer', cells });
  // Footer lives outside main; append the generated block into the body so it
  // survives the cleanup transformer (which only strips inside main sections).
  element.replaceWith(block);
}
