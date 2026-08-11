/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: accordion-faq
 * Base block: accordion (accordion-faq variant)
 * Source: https://www.kotak811.bank.in/credit-cards/811-super-money-credit-card
 * Generated: 2026-08-11
 *
 * Block library structure (accordion): container block, 2 columns.
 *   Row 1: block name (handled by createBlock)
 *   Row N: one row per accordion item -> [ title cell, content cell ]
 *     - Cell 1: title/question (mandatory)  -> model field: summary (text)
 *     - Cell 2: answer body (mandatory)      -> model field: text (richtext)
 * xwalk field hints: <!-- field:summary --> on cell 1, <!-- field:text --> on cell 2.
 *
 * Source: each Q&A is a `.accordion__section` containing an `.accordion` header
 * (question in an h3) and an `.accordion__content` body (`.accordion__text` with
 * paragraphs/lists/links). The section also has a title eyebrow ("Ask 811" /
 * "Frequently Asked Questions") that lives outside the items and is intentionally
 * dropped so only Q&A rows are emitted.
 */
export default function parse(element, { document }) {
  // --- INPUT EXTRACTION (selectors validated against source.html) ---
  // Each FAQ item is an .accordion__section.
  let items = Array.from(element.querySelectorAll('div[class*="accordion__section"]'));
  // Fallback: some markup omits the __section wrapper; use the .accordion headers.
  if (items.length === 0) {
    items = Array.from(element.querySelectorAll('div[class*="accordion__content"]'))
      .map((c) => c.parentElement)
      .filter(Boolean);
  }

  // Empty-block guard: bail gracefully if no FAQ items found.
  if (items.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((item) => {
    // Cell 1: question/title. Prefer the heading inside the accordion title area.
    const questionEl = item.querySelector('.accordion__title h3, .accordion__title h2, .accordion__title h4, h3, h2, h4');
    const questionText = questionEl ? questionEl.textContent.trim() : '';

    // Cell 2: answer body — take the meaningful content nodes from .accordion__text.
    const contentBody = item.querySelector('div[class*="accordion__text"], div[class*="accordion__content"]');
    const answerNodes = [];
    if (contentBody) {
      Array.from(contentBody.children)
        .filter((n) => n.nodeType === 1 && n.textContent.trim().length > 0)
        .forEach((n) => answerNodes.push(n));
    }

    // Skip rows that have neither a question nor an answer.
    if (!questionText && answerNodes.length === 0) return;

    // Cell 1: field:summary is plain text (question label).
    const titleCell = [document.createComment(' field:summary ')];
    if (questionText) titleCell.push(document.createTextNode(questionText));

    // Cell 2: field:text richtext (answer paragraphs/lists/links preserved).
    const contentCell = [document.createComment(' field:text ')];
    answerNodes.forEach((n) => contentCell.push(n));

    // Both cells mandatory (2-column row).
    cells.push([titleCell, contentCell]);
  });

  // If every item was skipped, bail gracefully.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
