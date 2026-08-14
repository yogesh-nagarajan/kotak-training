/* eslint-disable */
/* global WebImporter */
/** Parser for img-container. Base: img-container. Source: 811-business draft. */
export default function parse(element, { document }) {
  // Source markup: a text row (heading + paragraph) and an image row.
  // Model: 1 column, 2 content rows -> [ text ], [ image ].
  const rows = Array.from(element.children);

  const imageRow = rows.find((row) => row.querySelector('picture, img'));
  const image = imageRow ? imageRow.querySelector('picture, img') : null;

  // gather authored text (heading + paragraph) from the non-image rows.
  // Collect element references from a static snapshot — createBlock moves them
  // into the table, so never loop on firstElementChild.
  const textRows = rows.filter((row) => row !== imageRow);
  const textCell = [];
  textRows.forEach((row) => {
    Array.from(row.children).forEach((cell) => {
      Array.from(cell.children).forEach((node) => textCell.push(node));
    });
  });

  // empty-block guard
  if (!image && textCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cells.push([textCell]); // row: authored heading + paragraph
  cells.push([image || '']); // row: authored image

  const block = WebImporter.Blocks.createBlock(document, { name: 'img-container', cells });
  element.replaceWith(block);
}
