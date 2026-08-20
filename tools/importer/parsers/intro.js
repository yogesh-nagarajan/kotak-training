/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: intro
 * Base block: intro (single block with one richtext field)
 * Source: http://localhost:3000/preview
 * Generated: 2026-08-13
 *
 * xwalk single block. The whole block maps to one row / one cell.
 * Model fields (blocks/intro/_intro.json -> model "intro"):
 *   - text (richtext) -> first cell, field:text (H2 heading + one or more paragraphs)
 * => 1 column, 1 row: [text]
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
  // Content container. Fallback covers cross-page DOM variation.
  const content = element.querySelector('.intro-content') || element;

  // text field (richtext): heading (h1-h6) + all paragraphs, in document order.
  // Simplest robust approach: take all child element nodes in order.
  const textNodes = Array.from(content.children);

  // Empty-block guard: no content -> unwrap so content isn't lost.
  if (!textNodes.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const textCell = withFieldHint(document, 'text', textNodes);
  const cells = [[textCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'intro', cells });
  element.replaceWith(block);
}
