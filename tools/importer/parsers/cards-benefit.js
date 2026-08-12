/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-benefit
 * Base block: cards (no-images variant)
 * Source URL: https://www1.citibank.com.sg/cardbenefit/cashbackplus/888_450
 * Generated: 2026-08-10
 *
 * Block library (Cards): container block, no block-level properties.
 *   Row 1: block name (added by createBlock).
 *   Each subsequent row = one card with 2 cells:
 *     Cell 1: Image/Icon -> model field `image` (reference). Empty here (no-images variant),
 *             but the empty cell MUST still be included.
 *     Cell 2: Text (richtext) -> model field `text`: Title (styled as heading) + Description.
 *
 * xwalk field hints: the text cell gets `<!-- field:text -->`. The empty image cell gets NO hint
 * (per hinting rules, empty cells carry no field comment).
 *
 * DOM notes:
 *  - The live DOM wraps all three cards in a single `.ui-dynamic-widget-grid-col`, so a per-card
 *    container selector merges the cards into one row. Instead we identify title elements and
 *    description paragraphs, order them by document position, and group each description under its
 *    preceding title.
 *  - Titles are bold heading spans (`header-*` / `font-weight-bold` classes on the live page;
 *    a `<span><strong>` inside `<ui-text>` in the cached snippet). Descriptions are `<p>` elements.
 *    We must NOT treat `<strong>` emphasis inside a description paragraph (e.g. "1.6% cash back")
 *    as a title — hence titles are matched as spans and anything inside a `<p>` is excluded.
 */
export default function parse(element, { document }) {
  // Defensive: strip any inline style/script that may exist on the live widget.
  element.querySelectorAll('style, script, noscript').forEach((n) => n.remove());

  const hasText = (el) => el && el.textContent.replace(/ /g, ' ').trim();

  // --- Identify title elements ---
  // Live page: title spans carry header-*/font-weight-bold classes.
  let titleEls = Array.from(
    element.querySelectorAll('span[class*="header-"], span[class*="font-weight-bold"]'),
  ).filter((s) => !s.closest('p') && hasText(s));

  // Drop nested duplicates (outer span containing an inner matching span).
  titleEls = titleEls.filter(
    (s, i, arr) => !arr.some((other, j) => j !== i && other.contains(s)),
  );

  // Fallback for the cached-snippet structure: <ui-text><span><strong>Title</strong></span>.
  if (!titleEls.length) {
    titleEls = Array.from(element.querySelectorAll('ui-text > span'))
      .filter((s) => s.querySelector('strong') && !s.querySelector('p') && hasText(s));
  }

  // --- Description paragraphs ---
  const paragraphs = Array.from(element.querySelectorAll('p')).filter(hasText);

  // --- Order titles + paragraphs by document position, then group descriptions per title ---
  const titleSet = new Set(titleEls);
  const ordered = [...titleEls, ...paragraphs].sort(
    // eslint-disable-next-line no-bitwise
    (a, b) => ((a.compareDocumentPosition(b) & 4) ? -1 : 1),
  );

  const cards = [];
  let current = null;
  ordered.forEach((node) => {
    if (titleSet.has(node)) {
      current = { titleEl: node, descriptions: [] };
      cards.push(current);
    } else if (current) {
      current.descriptions.push(node);
    }
  });

  const cells = [];
  cards.forEach((card) => {
    const titleText = hasText(card.titleEl);
    if (!titleText && !card.descriptions.length) return;

    // Text cell (richtext): heading (title) + description paragraph(s).
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    if (titleText) {
      const heading = document.createElement('h3');
      heading.textContent = titleText;
      textCell.appendChild(heading);
    }
    // Preserve inline markup (e.g. <strong>1.6% cash back</strong>) by moving the <p> nodes.
    card.descriptions.forEach((p) => textCell.appendChild(p));

    // Row: [empty image cell (no-images variant), text cell]. Empty image cell carries no hint.
    cells.push(['', textCell]);
  });

  // Empty-block guard: bail gracefully if no cards were found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-benefit', cells });
  element.replaceWith(block);
}
