/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: tabs
 * Base block: tabs (container block with repeatable "Tab" items)
 * Source: http://localhost:3000/preview
 * Generated: 2026-08-13
 *
 * xwalk container block. Each `<li>` maps to one "tab" item (one row).
 * Model fields (blocks/tabs/_tabs.json -> model "tab"):
 *   - link     (aem-content) -> first cell, field:link (an <a href> element)
 *   - linkText (text)        -> COLLAPSES into the anchor text (no own cell)
 *   - active   (boolean)     -> second cell, field:active (literal "true"/"false")
 * => 2 columns per tab row: [link, active]
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
  // One row per tab item. Robust selector covers cross-page DOM variation; dedupe.
  const items = Array.from(
    new Set(element.querySelectorAll('nav li, ul li, .tabs-tab')),
  );

  // Empty-block guard: no items -> unwrap so content isn't lost.
  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((li) => {
    // link field: keep the anchor as-is; its text IS the linkText (collapses in).
    const anchor = li.querySelector('a');

    // active field: <li> flagged active or anchor marked as current page.
    const active = li.classList.contains('tabs-tab-active')
      || (anchor && anchor.getAttribute('aria-current') === 'page');

    const linkCell = withFieldHint(document, 'link', anchor);
    const activeCell = withFieldHint(
      document,
      'active',
      document.createTextNode(active ? 'true' : 'false'),
    );

    cells.push([linkCell, activeCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells });
  element.replaceWith(block);
}
