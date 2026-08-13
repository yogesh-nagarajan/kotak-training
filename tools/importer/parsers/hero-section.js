/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-section. Base: hero-section (custom composite block, NOT the library Hero).
 * Source: local draft hero-section-test.
 *
 * Block contract (blocks/hero-section/hero-section.js + _hero-section.json):
 *   - Top-level rows WITHOUT an image = the intro. decorate() flattens every child
 *     and classifies by element type (H1..H6 = heading, an <a> = CTA button, text
 *     before the heading = eyebrow, after = subtitle). These belong in ONE cell.
 *   - Top-level rows WITH an image = feature cards. Each card = [ icon image, body ].
 *
 * Produced block table (mixed column counts, matching the block's own contract):
 *   row 1 (auto): block name.
 *   row 2:        single cell holding the full intro (eyebrow <p>, <h1>, subtitle <p>, CTA <p><a>).
 *   rows 3..n:    one per card -> [ icon image, body description ] (2 columns).
 */
export default function parse(element, { document }) {
  const rows = Array.from(element.children);

  // Mirror decorate(): rows carrying an image are cards, everything else is the intro.
  const cardRows = rows.filter((row) => row.querySelector('picture, img'));
  const introRows = rows.filter((row) => !cardRows.includes(row));

  // Gather the intro content into a single cell. Collect element references from a
  // static snapshot (Array.from) — createBlock moves nodes into the table, so never
  // loop on firstElementChild (that spins forever).
  const introCell = [];
  introRows.forEach((row) => {
    Array.from(row.children).forEach((cell) => {
      Array.from(cell.children).forEach((node) => introCell.push(node));
    });
  });

  // Gather each card row as [ icon image, body ].
  const cardCells = [];
  cardRows.forEach((card) => {
    const image = card.querySelector('picture, img');
    // Body = everything that isn't the image-only icon cell.
    const bodyCell = [];
    Array.from(card.children).forEach((cell) => {
      if (cell.querySelector('picture, img') && cell.children.length === 1) return;
      Array.from(cell.children).forEach((node) => bodyCell.push(node));
    });
    if (!image && bodyCell.length === 0) return;
    cardCells.push([image || '', bodyCell]);
  });

  // Empty-block guard: nothing usable found.
  if (introCell.length === 0 && cardCells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (introCell.length) cells.push([introCell]); // intro: 1-column row, one cell holds all elements
  cardCells.forEach((card) => cells.push(card)); // cards: 2-column rows [icon, body]

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-section', cells });
  element.replaceWith(block);
}
