/* eslint-disable */
/* global WebImporter */
/** Parser for hero. Base: hero. Source: local draft 811-business. */
export default function parse(element, { document }) {
  // Convention: 1 column, 3 rows -> [name], [background image], [title/subheading/CTA].
  // Source markup: an image row (background) followed by a content row holding an
  // eyebrow paragraph, an h1, subtext paragraph(s), and an optional CTA link.
  const rows = Array.from(element.children);

  const imageRow = rows.find((row) => row.querySelector('picture, img'));
  const image = imageRow ? imageRow.querySelector('picture, img') : null;

  // gather all text/CTA content from the non-image rows into the single 3rd-row cell.
  // Collect element references from a static snapshot — createBlock moves them into
  // the table, so never loop on firstElementChild (that spins forever).
  const contentRows = rows.filter((row) => row !== imageRow);
  const contentCell = [];
  contentRows.forEach((row) => {
    Array.from(row.children).forEach((cell) => {
      Array.from(cell.children).forEach((node) => contentCell.push(node));
    });
  });

  // empty-block guard
  if (!image && contentCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cells.push([image || '']); // row 2: background image (optional)
  cells.push([contentCell]); // row 3: title + subheading + CTA (single cell)

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
