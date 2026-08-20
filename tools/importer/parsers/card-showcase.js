/* eslint-disable */
/* global WebImporter */
/** Parser for card-showcase. Base: card-showcase. Source: local draft feature-811-home. */
export default function parse(element, { document }) {
  // Convention:
  //   row 2  -> banner visual (image only)
  //   row 3  -> banner content (eyebrow, h1, subheading, CTA) in a single cell
  //   row 4+ -> benefit cards, one per row, 2 columns: [ icon, title + description ]
  // First row is the block name (added by createBlock).
  const rows = Array.from(element.children);

  // banner content = first row that owns the main heading
  const contentRow = rows.find((row) => row.querySelector('h1, h2'));
  // banner visual = first image-only row that is not the content row
  const visualRow = rows.find(
    (row) => row !== contentRow
      && row.querySelector('picture, img')
      && !row.querySelector('h1, h2, h3'),
  );
  // benefit cards = the remaining rows
  const cardRows = rows.filter((row) => row !== contentRow && row !== visualRow);

  // Collect element references from static snapshots — createBlock moves them into
  // the table, so never loop on firstElementChild (that spins forever).
  const visualImage = visualRow ? visualRow.querySelector('picture, img') : null;

  const contentCell = [];
  if (contentRow) {
    Array.from(contentRow.children).forEach((cell) => {
      Array.from(cell.children).forEach((node) => contentCell.push(node));
    });
  }

  const cells = [];
  cells.push([visualImage || '']); // row 2: banner visual (optional)
  cells.push([contentCell]); // row 3: banner content (single cell)

  cardRows.forEach((card) => {
    const image = card.querySelector('picture, img');
    const bodyCell = [];
    Array.from(card.children).forEach((cell) => {
      if (cell.querySelector('picture, img') && cell.children.length === 1) return;
      Array.from(cell.children).forEach((node) => bodyCell.push(node));
    });
    if (!image && bodyCell.length === 0) return;
    cells.push([image || '', bodyCell]); // row 4+: [ icon, title + description ]
  });

  // empty-block guard
  if (!visualImage && contentCell.length === 0 && cells.length <= 2) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Card Showcase', cells });
  element.replaceWith(block);
}
