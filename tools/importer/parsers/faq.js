/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: faq
 * Base block: faq (container block with repeatable "FAQ Item" items)
 * Source: http://localhost:3000/preview
 * Generated: 2026-08-13
 *
 * xwalk container block. Each `.faq-item` maps to one "faq-item" item (one row).
 * The rendered DOM is decorated with a search box and accordion markup; the
 * `.faq-search` input is ignored entirely during extraction.
 * Model fields (blocks/faq/_faq.json -> model "faq-item"):
 *   - question (text)     -> first cell, field:question (the question text)
 *   - answer   (richtext) -> second cell, field:answer (answer paragraph(s))
 * => 2 columns per faq row: [question, answer]
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
  // One row per FAQ item. Ignore the decorated `.faq-search` box entirely.
  const items = Array.from(element.querySelectorAll('.faq-item'));

  // Empty-block guard: no items -> unwrap so content isn't lost.
  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((item) => {
    // question field: prefer the dedicated text span so we never capture the
    // chevron span; fall back to the button text (trimmed) if it's missing.
    const questionText = item.querySelector('.faq-question-text')?.textContent.trim()
      || item.querySelector('.faq-question')?.textContent.trim()
      || '';

    // answer field (richtext): collect the child element nodes (paragraphs, etc.)
    // inside `.faq-answer`, preserving order.
    const answerContainer = item.querySelector('.faq-answer');
    const answerNodes = answerContainer
      ? Array.from(answerContainer.children)
      : [];

    // Build question cell: wrap the text in a <p> so it renders as visible text.
    const questionP = document.createElement('p');
    questionP.textContent = questionText;
    const questionCell = withFieldHint(document, 'question', questionP);

    // Build answer cell from the answer paragraph element nodes.
    const answerCell = withFieldHint(document, 'answer', answerNodes);

    cells.push([questionCell, answerCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'faq', cells });
  element.replaceWith(block);
}
