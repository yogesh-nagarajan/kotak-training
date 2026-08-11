/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the merged block: supermoney-hero
 *
 * Runs on the hero banner section, then reaches into the document to pull in
 * the cashback cards section, merging both into a single supermoney-hero block.
 *
 * Emitted table (matches blocks/supermoney-hero/supermoney-hero.js):
 *   Row 1: background image        -> <!-- field:image -->
 *   Row 2: hero text (eyebrow, H1, subtext, CTA) -> <!-- field:text -->
 *   Row 3..N: one card per row = icon cell + text cell (H2)
 *
 * The cards section is removed from the DOM after extraction so it is not also
 * emitted as a standalone block.
 */
export default function parse(element, { document }) {
  const cells = [];

  // --- Hero banner ---
  // Desktop full-bleed background image.
  const bgImage = element.querySelector('img[class*="desktop-display"], img[class*="absolute"]')
    || element.querySelector('img');
  if (bgImage) {
    cells.push([[document.createComment(' field:image '), bgImage]]);
  }

  // Hero text: eyebrow paragraph, heading, subtext, CTA.
  const eyebrow = element.querySelector('p[class*="banner_text"]');
  const heading = element.querySelector('h1');
  const subtext = element.querySelector('div[class*="description"], p[class*="description"]');
  const cta = element.querySelector('a[class*="button"], a');

  const textCell = [document.createComment(' field:text ')];
  if (eyebrow) textCell.push(eyebrow);
  if (heading) textCell.push(heading);
  if (subtext) {
    // Normalize the subtext div into a paragraph so it renders as body copy.
    const p = document.createElement('p');
    p.textContent = subtext.textContent.trim();
    textCell.push(p);
  }
  if (cta) textCell.push(cta);
  cells.push([textCell]);

  // --- Cards (pulled from the sibling cards section) ---
  let cardsSection = null;
  const sections = document.querySelectorAll('main > section, section');
  sections.forEach((s) => {
    if (!cardsSection && (s.className || '').split(/\s+/).includes('z-pos-fix]')) {
      cardsSection = s;
    }
  });
  if (!cardsSection) {
    // Fallback: a list of icon+heading cards.
    const ul = document.querySelector('ul[class*="flexcards"]');
    if (ul) cardsSection = ul.closest('section') || ul;
  }

  if (cardsSection) {
    const cardItems = cardsSection.querySelectorAll('li');
    cardItems.forEach((li) => {
      const icon = li.querySelector('img');
      const h = li.querySelector('h2, h3');
      const imageCell = [document.createComment(' field:image ')];
      if (icon) imageCell.push(icon);
      const bodyCell = [document.createComment(' field:text ')];
      if (h) bodyCell.push(h);
      cells.push([imageCell, bodyCell]);
    });
    // Remove the cards section so it is not emitted as a separate block.
    cardsSection.remove();
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'supermoney-hero', cells });
  element.replaceWith(block);
}
