/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero
 * Base block: hero
 * Source: https://www.kotak811.bank.in/credit-cards/811-super-money-credit-card
 * Generated: 2026-08-11
 *
 * Block library structure (hero): 1 column, up to 3 rows.
 *   Row 1: block name (handled by createBlock)
 *   Row 2: background image (optional)      -> model field: image (imageAlt collapses into <img alt>)
 *   Row 3: text (eyebrow / title / subheading / CTA) -> model field: text (richtext)
 * xwalk field hints: <!-- field:image --> on the image cell, <!-- field:text --> on the text cell.
 *
 * instances[] union selectors: one resolves to the true hero banner
 * (section.SuperMoney_heroBan__rCeAx). The nth-of-type union selector can resolve
 * to a non-hero section on the live page, so we require a genuine hero signal
 * (a full-bleed positioned background image OR an H1) before emitting a hero;
 * otherwise we bail gracefully to avoid corrupting non-hero content.
 */
export default function parse(element, { document }) {
  // --- INPUT EXTRACTION (selectors validated against source.html) ---
  // Full-bleed desktop background image (class="... desktop-display-only ... absolute z-[-1] ...").
  const bgImage = element.querySelector('img[class*="desktop-display"], img[class*="absolute"]');

  // Headline. The true hero uses H1; H2 fallback covers alternate banner markup.
  const h1 = element.querySelector('h1');
  const heading = h1 || element.querySelector('h2');

  // Hero signal guard: only treat this element as a hero when a strong hero marker
  // is present. This prevents union nth-of-type selectors from turning arbitrary
  // content sections (e.g. an FAQ) into a malformed hero.
  if (!bgImage && !h1) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Eyebrow / banner text paragraph (class contains "banner_text").
  const eyebrow = element.querySelector('p[class*="banner_text"]');
  // Subtext / description block.
  const subtext = element.querySelector('div[class*="description"], p[class*="description"]');
  // Call(s)-to-action. Single class selector avoids double-selection.
  const ctas = Array.from(element.querySelectorAll('a[class*="button"]'));

  const cells = [];

  // Row 2: background image (only emit when present; field:image drives mapping).
  if (bgImage) {
    const imageCell = [document.createComment(' field:image '), bgImage];
    cells.push([imageCell]);
  }

  // Row 3: text content (single cell holding all rich-text elements).
  const textCell = [document.createComment(' field:text ')];
  if (eyebrow) textCell.push(eyebrow);
  if (heading) textCell.push(heading);
  if (subtext) textCell.push(subtext);
  ctas.forEach((cta) => textCell.push(cta));
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
