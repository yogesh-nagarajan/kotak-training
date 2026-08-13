/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards
 * Base block: cards (container block with repeatable "Card" items)
 * Source: http://localhost:3000/preview
 * Generated: 2026-08-12
 *
 * xwalk container block. Each `<li>` maps to one "card" item (one row).
 * Model fields (blocks/cards/_cards.json -> model "card"):
 *   - image (reference) -> first cell, field:image
 *   - text  (richtext)  -> second cell, field:text (H3 title + description paragraph)
 * => 2 columns per card row: [image, text]
 * Matches library description "Cards": 2 columns, one row per card.
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
  // One row per card. Fallbacks cover cross-page DOM variation.
  let cards = Array.from(element.querySelectorAll(':scope > ul > li'));
  if (!cards.length) cards = Array.from(element.querySelectorAll('ul > li, li'));

  // Empty-block guard: no cards -> unwrap so content isn't lost.
  if (!cards.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cards.forEach((card) => {
    // image field: prefer <picture> (keeps responsive sources), fall back to <img>.
    const picture = card.querySelector('.cards-card-image picture, picture');
    const img = card.querySelector('.cards-card-image img, img');
    const imageEl = picture || img;

    // text field (richtext): heading + description paragraph(s) + optional CTA.
    const body = card.querySelector('.cards-card-body') || card;
    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    const paragraphs = Array.from(body.querySelectorAll(':scope > p'));
    const cta = body.querySelector('a[href]');

    // Build image cell (no hint if absent).
    const imageCell = imageEl ? withFieldHint(document, 'image', imageEl) : '';

    // Build text cell from heading + paragraphs + CTA (no hint if empty).
    const textNodes = [];
    if (heading) textNodes.push(heading);
    paragraphs.forEach((p) => textNodes.push(p));
    if (cta && !paragraphs.includes(cta)) textNodes.push(cta);
    const textCell = textNodes.length ? withFieldHint(document, 'text', textNodes) : '';

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
