/* eslint-disable */
/* global WebImporter */
/** Parser for cards. Base: cards. Source: local draft 811-business. */
export default function parse(element, { document }) {
  // Convention (with images): 2 columns, one row per card ->
  //   [ image/icon, text content (title + description + optional CTA) ].
  // First row is the block name (added by createBlock).
  const cardRows = Array.from(element.children);
  const cells = [];

  cardRows.forEach((card) => {
    const image = card.querySelector('picture, img');
    // the text content is everything that isn't the image-only cell.
    // Collect element references from a static snapshot — createBlock moves them
    // into the table, so never loop on firstElementChild (that spins forever).
    const bodyCell = [];
    Array.from(card.children).forEach((cell) => {
      if (cell.querySelector('picture, img') && cell.children.length === 1) return;
      Array.from(cell.children).forEach((node) => bodyCell.push(node));
    });

    if (!image && bodyCell.length === 0) return;
    cells.push([image || '', bodyCell]);
  });

  // empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
