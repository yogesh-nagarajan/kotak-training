/* eslint-disable */
/* global WebImporter */
/** Parser for usp-cards. Base: usp-cards. Source: 811-business draft page. */
export default function parse(element, { document }) {
  // Convention: 2 columns, one row per card -> [ icon/image, text content ].
  // First row is the block name (added by createBlock).
  const cardRows = Array.from(element.children);
  const cells = [];

  cardRows.forEach((card) => {
    const image = card.querySelector('picture, img');
    // text content is everything that isn't the image-only cell.
    // Collect element references from a static snapshot — createBlock moves them
    // into the table, so never loop on firstElementChild.
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'usp-cards', cells });
  element.replaceWith(block);
}
