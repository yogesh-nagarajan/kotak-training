/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: breadcrumb
 * Base block: breadcrumb (container block with repeatable "Breadcrumb Item" items)
 * Source: http://localhost:3000/nri-home-loan-features
 * Generated: 2026-08-13
 *
 * xwalk container block. Each `<li class="breadcrumb-item">` maps to one
 * "breadcrumb-item" item (one row).
 * Model fields (blocks/breadcrumb/_breadcrumb.json -> model "breadcrumb-item"):
 *   - link     (aem-content) -> first cell, field:link (an <a href> element, or
 *                               the crumb label text when the current crumb has
 *                               no link)
 *   - linkText (text)        -> COLLAPSES into the anchor text (no own cell)
 *   - current  (boolean)     -> second cell, field:current (literal "true"/"false")
 * => ALWAYS 2 columns per row: [link, current]
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
  // One row per crumb. Robust selector covers DOM variation; dedupe.
  const items = Array.from(
    new Set(element.querySelectorAll('.breadcrumb-item, nav li, ol li, ul li')),
  );

  // Empty-block guard: no items -> unwrap so content isn't lost.
  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((li) => {
    // link field: the crumb anchor (its text collapses into linkText). The
    // current crumb renders as <span class="breadcrumb-current"> with no href,
    // so rebuild a plain text link cell for it.
    const anchor = li.querySelector('a');
    const current = !!li.querySelector('.breadcrumb-current')
      || (anchor && anchor.getAttribute('aria-current') === 'page');

    let linkContent;
    if (anchor) {
      linkContent = anchor;
    } else {
      // no anchor (current crumb) -> keep the label text so it round-trips
      const label = (li.textContent || '').trim();
      linkContent = label ? document.createTextNode(label) : '';
    }

    const linkCell = withFieldHint(document, 'link', linkContent);
    const currentCell = withFieldHint(
      document,
      'current',
      document.createTextNode(current ? 'true' : 'false'),
    );

    cells.push([linkCell, currentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'breadcrumb', cells });
  element.replaceWith(block);
}
