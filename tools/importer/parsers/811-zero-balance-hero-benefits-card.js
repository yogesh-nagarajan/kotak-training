/* eslint-disable */
/* global WebImporter */
/**
 * Parser for: 811-zero-balance-hero-benefits-card
 * Base block: container block with repeatable "benefit-card" items.
 * Source: http://localhost:3000/drafts/811-zero-balance-hero-benefits-card.plain.html
 *
 * xwalk container block. Each authored card row maps to one "benefit-card" item.
 * Model fields (blocks/811-zero-balance-hero-benefits-card/_811-zero-balance-hero-benefits-card.json
 * -> model "benefit-card"):
 *   - image    (reference) -> first cell, field:image (an <img> or <picture>)
 *   - imageAlt (text)      -> collapses into the <img> alt attribute (no own cell)
 *   - title    (richtext)  -> second cell, field:title (the card title)
 * => 2 columns per card row: [image, title]
 */

/**
 * Wrap cell content with a Universal Editor field hint comment placed BEFORE the content.
 */
function withFieldHint(document, fieldName, content) {
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${fieldName} `));
  if (Array.isArray(content)) {
    content.forEach((node) => {
      if (node) frag.appendChild(node);
    });
  } else if (content) {
    frag.appendChild(content);
  }
  return frag;
}

export default function parse(element, { document }) {
  // Each direct child row of the block is one benefit card: [image cell, title cell].
  const rows = Array.from(element.children).filter(
    (row) => row.querySelector('picture, img'),
  );

  // Empty-block guard: no card rows -> unwrap so content isn't lost.
  if (!rows.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  rows.forEach((row) => {
    const cellEls = Array.from(row.children);
    const imageCellSrc = cellEls.find((c) => c.querySelector('picture, img'));
    const titleCellSrc = cellEls.find((c) => c !== imageCellSrc && c.textContent.trim());

    // image field: prefer <picture> (keeps responsive sources), fall back to <img>.
    const iconSource = imageCellSrc?.querySelector('picture')
      || imageCellSrc?.querySelector('img');
    let iconEl = '';
    if (iconSource) {
      if (iconSource.tagName === 'IMG') {
        const img = document.createElement('img');
        if (iconSource.getAttribute('src')) img.setAttribute('src', iconSource.getAttribute('src'));
        if (iconSource.getAttribute('alt')) img.setAttribute('alt', iconSource.getAttribute('alt'));
        iconEl = img;
      } else {
        iconEl = iconSource;
      }
    }
    const imageCell = iconEl ? withFieldHint(document, 'image', iconEl) : '';

    // title field: card title text, wrapped in a <p> so it renders as visible text.
    const titleText = titleCellSrc?.textContent.trim();
    let titleCell = '';
    if (titleText) {
      const p = document.createElement('p');
      p.textContent = titleText;
      titleCell = withFieldHint(document, 'title', p);
    }

    cells.push([imageCell, titleCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: '811-zero-balance-hero-benefits-card',
    cells,
  });
  element.replaceWith(block);
}
