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
 *   Row 2: mobile banner image     -> <!-- field:imageMobile -->
 *   Row 3: subtitle (eyebrow)      -> <!-- field:subtitle -->
 *   Row 4: title (H1)              -> <!-- field:title -->
 *   Row 5: description             -> <!-- field:description -->
 *   Row 6: CTA link + text         -> <!-- field:link --> / <!-- field:linkText -->
 *   Row 7..N: one card per row = icon cell + text cell (H2)
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

  // Mobile banner image (separate portrait art on the live page). Only emit it
  // when it is a distinct element from the desktop image.
  const mobileImage = element.querySelector('img[class*="mobile-display"]');
  if (mobileImage && mobileImage !== bgImage) {
    cells.push([[document.createComment(' field:imageMobile '), mobileImage]]);
  }

  // Hero text: eyebrow paragraph, heading, subtext, CTA — each its own field.
  const eyebrow = element.querySelector('p[class*="banner_text"]');
  const heading = element.querySelector('h1');
  const subtext = element.querySelector('div[class*="description"], p[class*="description"]');
  const cta = element.querySelector('a[class*="button"], a');

  // Subtitle (eyebrow).
  const subtitleCell = [document.createComment(' field:subtitle ')];
  const subtitleP = document.createElement('p');
  subtitleP.textContent = eyebrow ? eyebrow.textContent.trim() : '';
  subtitleCell.push(subtitleP);
  cells.push([subtitleCell]);

  // Title.
  const titleCell = [document.createComment(' field:title ')];
  const titleP = document.createElement('p');
  titleP.textContent = heading ? heading.textContent.trim() : '';
  titleCell.push(titleP);
  cells.push([titleCell]);

  // Description.
  const descCell = [document.createComment(' field:description ')];
  const descP = document.createElement('p');
  descP.textContent = subtext ? subtext.textContent.trim() : '';
  descCell.push(descP);
  cells.push([descCell]);

  // CTA (link + link text).
  if (cta) {
    const linkCell = [document.createComment(' field:link ')];
    const a = document.createElement('a');
    a.href = cta.getAttribute('href') || '#';
    a.textContent = (cta.textContent || '').trim() || 'Apply now';
    linkCell.push(a);
    cells.push([linkCell]);
  }

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
