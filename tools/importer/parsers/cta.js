/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cta
 * Base block: cta (single block, one row)
 * Source: http://localhost:3000/preview
 * Generated: 2026-08-13
 *
 * xwalk single block. Exactly one row with two cells: [heading, link].
 * Model fields (blocks/cta/_cta.json -> model "cta"):
 *   - heading  (text)        -> first cell,  field:heading (visible heading text)
 *   - link     (aem-content) -> second cell, field:link (an <a href> element)
 *   - linkText (text)        -> collapses into the anchor text (no own cell)
 * => 2 columns, one row: [heading, link].
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
  // Scope to the inner content wrapper when present, otherwise use the block itself.
  const content = element.querySelector('.cta-content') || element;

  // heading field: visible heading text.
  const headingText = content
    .querySelector('.cta-title, h1, h2, h3, h4, h5, h6')
    ?.textContent.trim();

  // link field: source anchor. Its text is the linkText that collapses into the link.
  const anchor = content.querySelector('a[href]');

  // Empty-block guard: nothing to model -> unwrap so content isn't lost.
  if (!headingText && !anchor) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Build a fresh anchor so re-import is clean (drops button/cta helper classes).
  let linkEl = '';
  if (anchor) {
    linkEl = document.createElement('a');
    linkEl.href = anchor.getAttribute('href');
    const target = anchor.getAttribute('target');
    if (target && target !== 'undefined') linkEl.target = target;
    linkEl.textContent = anchor.textContent.trim();
  }

  // Build heading cell as a text node wrapped in a <p> so it renders as visible text.
  let headingEl = '';
  if (headingText) {
    headingEl = document.createElement('p');
    headingEl.textContent = headingText;
  }

  const headingCell = headingEl ? withFieldHint(document, 'heading', headingEl) : '';
  const linkCell = linkEl ? withFieldHint(document, 'link', linkEl) : '';

  const cells = [[headingCell, linkCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'cta', cells });
  element.replaceWith(block);
}
