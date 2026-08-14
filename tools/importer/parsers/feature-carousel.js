/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: feature-carousel
 * Base block: feature-carousel (container block with repeatable "feature" items)
 * Source: http://localhost:3000/preview
 * Generated: 2026-08-13
 *
 * xwalk container block. Each `.feature-carousel-item` maps to one "feature" item (one row).
 * Model fields (blocks/feature-carousel/_feature-carousel.json -> model "feature"):
 *   - icon    (reference) -> first cell, field:icon (an <img> or <picture>)
 *   - iconAlt (text)      -> collapses into the <img> alt attribute (no own cell)
 *   - label   (text)      -> second cell, field:label (the label text)
 * => 2 columns per feature row: [icon, label]
 * Arrow buttons (.feature-carousel-arrow) are ignored.
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
  // One row per item. Arrow buttons are not items and are ignored.
  const items = Array.from(element.querySelectorAll('.feature-carousel-item'));

  // Empty-block guard: no items -> unwrap so content isn't lost.
  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((item) => {
    // icon field: prefer <picture> (keeps responsive sources), fall back to <img>.
    const iconSource = item.querySelector('.feature-carousel-icon picture')
      || item.querySelector('.feature-carousel-icon img')
      || item.querySelector('picture, img');

    // Build a clean icon element: keep <picture> as-is, rebuild a bare <img>.
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

    // label field: visible text of the item's label.
    const labelText = item.querySelector('.feature-carousel-label')?.textContent.trim();

    // Build icon cell (no hint if absent).
    const iconCell = iconEl ? withFieldHint(document, 'icon', iconEl) : '';

    // Build label cell wrapped in a <p> so it renders as visible text (no hint if empty).
    let labelCell = '';
    if (labelText) {
      const p = document.createElement('p');
      p.textContent = labelText;
      labelCell = withFieldHint(document, 'label', p);
    }

    cells.push([iconCell, labelCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'feature-carousel', cells });
  element.replaceWith(block);
}
