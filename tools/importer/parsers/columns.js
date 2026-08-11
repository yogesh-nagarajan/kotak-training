/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: columns
 * Base block: columns (boilerplate columns block)
 * Source: https://www.kotak811.bank.in/credit-cards/811-super-money-credit-card
 * Generated: 2026-08-11
 *
 * Block library structure (columns): first row = block name (handled by createBlock),
 * second row = N cells, one per column. Additional rows must keep the same column count.
 * Cells hold default content (images, headings, text) side by side.
 *
 * xwalk note: columns blocks do NOT get field-hint comments (hinting.md Rule 4).
 *
 * Source: each callout is a `.grid` container whose direct-child <div>s are the
 * columns (image column + text column; one instance has three cells: text, image, text).
 * Column count varies per instance, which the boilerplate columns block supports.
 */
export default function parse(element, { document }) {
  // --- INPUT EXTRACTION (selectors validated against source.html) ---
  // The grid wrapper holds the columns as its direct-child divs.
  const grid = element.querySelector('div[class*="grid-cols"], div[class*="grid"]')
    || element.querySelector('.container > div')
    || element.querySelector('.container');

  if (!grid) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Each direct-child element of the grid is one column.
  let columns = Array.from(grid.children).filter((c) => c.nodeType === 1);

  // Empty-block guard: nothing to lay out.
  if (columns.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Build one cell per column. Preserve the column's inner content nodes so
  // images stay as <picture>/<img> and headings/paragraphs keep their semantics.
  const row = columns.map((col) => {
    const contentNodes = Array.from(col.children).filter((n) => n.nodeType === 1);
    // If the column has no element children, fall back to the column element itself
    // so its text content is not lost.
    return contentNodes.length ? contentNodes : [col];
  });

  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
