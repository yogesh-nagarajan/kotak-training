/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards
 * Base block: cards
 * Source: https://www.kotak811.bank.in/credit-cards/811-super-money-credit-card
 * Generated: 2026-08-11
 *
 * Block library structure (cards): container block, 2 columns.
 *   Row 1: block name (handled by createBlock)
 *   Row N: one row per card -> [ image cell, text cell ]
 *     - Cell 1: card icon/image        -> model field: image (imageAlt collapses into <img alt>)
 *     - Cell 2: heading + description   -> model field: text (richtext)
 * xwalk field hints: <!-- field:image --> on cell 1, <!-- field:text --> on cell 2.
 * Note: an image or text cell may be empty, but the empty cell must still be included.
 */
export default function parse(element, { document }) {
  // --- INPUT EXTRACTION (selectors validated against source.html) ---
  // Each card is an <li class="SuperMoney_card__..."> inside a <ul>.
  let cardItems = Array.from(element.querySelectorAll('li[class*="card"]'));
  // Fallbacks for cross-page variation: any list item, else direct card containers.
  if (cardItems.length === 0) {
    cardItems = Array.from(element.querySelectorAll('ul > li'));
  }

  // Empty-block guard: bail gracefully if no cards found.
  if (cardItems.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cardItems.forEach((item) => {
    // Cell 1: icon/image. Source wraps it in div.SuperMoney_usp_icons__...; grab the img.
    const image = item.querySelector('img');
    const imageCell = [document.createComment(' field:image ')];
    if (image) imageCell.push(image);

    // Cell 2: heading + description (rich text). Preserve semantic nodes.
    const heading = item.querySelector('h2, h3, h4');
    // Description paragraphs (skip empty ones so we don't emit blank text).
    const paragraphs = Array.from(item.querySelectorAll('p'))
      .filter((p) => p.textContent.trim().length > 0);

    const textCell = [document.createComment(' field:text ')];
    if (heading) textCell.push(heading);
    paragraphs.forEach((p) => textCell.push(p));

    // Both cells always present (2-column row), even when a cell is otherwise empty.
    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
