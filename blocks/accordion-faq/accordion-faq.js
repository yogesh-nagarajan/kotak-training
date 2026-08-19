/*
 * Accordion FAQ Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 *
 * Container fields (optional): Title + Subtitle render as the heading above the
 * list (e.g. "Ask 811" / "Frequently Asked Questions"). Each FAQ is a two-cell
 * item row: summary (question) + body (answer).
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];

  // Optional heading rows are single-cell; FAQ items are two-cell rows.
  const headingRows = rows.filter((row) => row.children.length === 1);
  const itemRows = rows.filter((row) => row.children.length >= 2);

  // Build the heading (title + subtitle) if authored.
  if (headingRows.length) {
    const header = document.createElement('div');
    header.className = 'accordion-faq-header';
    const [titleRow, subtitleRow] = headingRows;
    const titleText = titleRow && titleRow.textContent.trim();
    if (titleText) {
      const h2 = document.createElement('h2');
      h2.className = 'accordion-faq-title';
      moveInstrumentation(titleRow.firstElementChild, h2);
      h2.textContent = titleText;
      header.append(h2);
    }
    const subtitleText = subtitleRow && subtitleRow.textContent.trim();
    if (subtitleText) {
      const p = document.createElement('p');
      p.className = 'accordion-faq-subtitle';
      moveInstrumentation(subtitleRow.firstElementChild, p);
      p.textContent = subtitleText;
      header.append(p);
    }
    if (header.childElementCount) block.prepend(header);
    headingRows.forEach((row) => row.remove());
  }

  itemRows.forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    summary.append(...label.childNodes);
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-faq-item-body';
    // decorate accordion item
    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = 'accordion-faq-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
