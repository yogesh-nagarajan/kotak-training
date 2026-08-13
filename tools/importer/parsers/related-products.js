/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: related-products
 * Base block: related-products (container block with repeatable "Related Product" items)
 * Source: http://localhost:3000/preview
 * Generated: 2026-08-13
 *
 * xwalk container block. Each `<li>` maps to one "related-product" item (one row).
 * Model fields (blocks/related-products/_related-products.json -> model "related-product"):
 *   - image        (reference)   -> own cell, field:image  (<picture> or <img>)
 *   - imageAlt     (text)        -> COLLAPSED (Alt suffix) — lives on the <img> alt attribute
 *   - text         (richtext)    -> own cell, field:text   (H3 title + description paragraph(s))
 *   - knowMoreLink (aem-content) -> own cell, field:knowMoreLink ("Know More" <a href>)
 *   - applyLink    (aem-content) -> own cell, field:applyLink   ("Apply Now" <a href>)
 * => ALWAYS 4 columns per card row: [image, text, knowMoreLink, applyLink]
 *
 * Column count MUST be identical on every row. xwalk maps cells to model fields
 * positionally, so a card missing a link still emits an EMPTY cell for it —
 * otherwise the columns shift and content lands in the wrong field. This block
 * previously had a column-mapping bug from ragged rows; do not reintroduce it.
 */

/**
 * Wrap cell content with a Universal Editor field hint comment placed BEFORE the content.
 * Returns a DocumentFragment (empty string caller-side handles empty cells, no hint).
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
  // One row per card. Fallbacks cover cross-page DOM variation.
  let cards = Array.from(element.querySelectorAll(':scope > ul > li'));
  if (!cards.length) cards = Array.from(element.querySelectorAll('ul > li, li'));

  // Empty-block guard: no cards -> unwrap so content isn't lost.
  if (!cards.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Build a fresh <a> from an existing anchor, stripping helper classes so the
  // re-import is clean. Trailing arrow glyphs in the text (e.g. "Know More →")
  // are removed — the arrow is decorative and usually CSS-generated.
  const makeLink = (anchor) => {
    if (!anchor) return null;
    const href = anchor.getAttribute('href');
    if (!href) return null;
    const link = document.createElement('a');
    link.setAttribute('href', href);
    const target = anchor.getAttribute('target');
    if (target && target !== 'undefined') link.setAttribute('target', target);
    link.textContent = (anchor.textContent || '').replace(/[\s→]+$/, '').trim();
    return link;
  };

  cards.forEach((card) => {
    // image field: prefer <picture> (keeps responsive sources), fall back to <img>.
    const imageEl = card.querySelector('.related-products-image picture')
      || card.querySelector('.related-products-image img')
      || card.querySelector('picture, img');

    // text field (richtext): H3 title + description paragraph(s). Rebuild the
    // heading without its helper class so the round-trip stays clean.
    const headingSrc = card.querySelector('.related-products-title, h1, h2, h3, h4, h5, h6');
    let heading = null;
    if (headingSrc) {
      heading = document.createElement('h3');
      heading.textContent = (headingSrc.textContent || '').trim();
    }
    let descNodes = Array.from(card.querySelectorAll('.related-products-desc > *'));
    if (!descNodes.length) {
      const desc = card.querySelector('.related-products-desc');
      if (desc) descNodes = Array.from(desc.children);
    }

    // knowMoreLink / applyLink fields (aem-content): fresh anchors, helper
    // classes stripped, decorative arrow removed from the label.
    const knowMoreAnchor = makeLink(card.querySelector('a.related-products-know-more'));
    const applyAnchor = makeLink(card.querySelector('a.related-products-apply'));

    // Build cells. EVERY row must have the SAME 4 columns in the SAME order —
    // [image, text, knowMoreLink, applyLink] — because xwalk maps cells to model
    // fields positionally. A field with no content still gets its column as an
    // empty cell (empty string => empty <div>, no field hint); dropping the cell
    // would shift every later field into the wrong column.
    const imageCell = imageEl ? withFieldHint(document, 'image', imageEl) : '';

    const textNodes = [];
    if (heading) textNodes.push(heading);
    descNodes.forEach((node) => textNodes.push(node));
    const textCell = textNodes.length ? withFieldHint(document, 'text', textNodes) : '';

    const knowMoreCell = knowMoreAnchor
      ? withFieldHint(document, 'knowMoreLink', knowMoreAnchor) : '';
    const applyCell = applyAnchor ? withFieldHint(document, 'applyLink', applyAnchor) : '';

    // Fixed 4-column row — never conditionally omit a cell.
    cells.push([imageCell, textCell, knowMoreCell, applyCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'related-products', cells });
  element.replaceWith(block);
}
