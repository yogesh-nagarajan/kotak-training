/* eslint-disable */
/* global WebImporter */
/**
 * Parser for: 811-zero-balance-hero-benefits-card
 * Container block with repeatable "benefit-card" items and a trailing section
 * description authored via the built-in Text component.
 *
 * Model fields (model "benefit-card"):
 *   - image    (reference) -> first cell, field:image
 *   - imageAlt (text)      -> collapses into the <img> alt (no own cell)
 *   - title    (text)      -> second cell, field:title
 * => 2 columns per card row: [image, title]
 *
 * The section description (authored via a Text component inside the block) is
 * emitted as a final image-less block row; the block JS renders it full-width
 * below the cards.
 */

function withFieldHint(document, fieldName, content) {
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${fieldName} `));
  if (Array.isArray(content)) {
    content.forEach((node) => { if (node) frag.appendChild(node); });
  } else if (content) {
    frag.appendChild(content);
  }
  return frag;
}

export default function parse(element, { document }) {
  const rows = Array.from(element.children);
  const cardRows = rows.filter((row) => row.querySelector('picture, img'));
  const descRow = rows.find((row) => !row.querySelector('picture, img') && row.textContent.trim());

  if (!cardRows.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cardRows.forEach((row) => {
    const cellEls = Array.from(row.children);
    const imageCellSrc = cellEls.find((c) => c.querySelector('picture, img'));
    const titleCellSrc = cellEls.find((c) => c !== imageCellSrc && c.textContent.trim());

    const iconSource = imageCellSrc?.querySelector('picture') || imageCellSrc?.querySelector('img');
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

    const titleText = titleCellSrc?.textContent.trim();
    let titleCell = '';
    if (titleText) {
      const p = document.createElement('p');
      p.textContent = titleText;
      titleCell = withFieldHint(document, 'title', p);
    }

    cells.push([imageCell, titleCell]);
  });

  // section description: a final image-less row (single cell, full width)
  if (descRow) {
    const text = descRow.textContent.trim();
    if (text) {
      const p = document.createElement('p');
      p.textContent = text;
      cells.push([p]);
    }
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: '811-zero-balance-hero-benefits-card',
    cells,
  });
  element.replaceWith(block);
}
