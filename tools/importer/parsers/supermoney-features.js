/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the supermoney-features block.
 *
 * The live page renders each feature as its own sibling <section> with an
 * obfuscated, build-hashed class (SuperMoney_cardsection__xxx / _threerow_ /
 * _creditcard_). Each has: an image + a heading + a description. This parser
 * runs on the FIRST such section, then collects all consecutive feature
 * sections and merges them into a single supermoney-features block.
 *
 * Emitted table (matches blocks/supermoney-features/supermoney-features.js):
 *   Row 1: title (H2 of the first feature)        -> <!-- field:title -->
 *   Row 2: subtitle (its description)              -> <!-- field:subtitle -->
 *   Row 3..N: one feature = image cell + text cell (H2 + description)
 *
 * All consumed sections are removed so they aren't emitted as leftover blocks.
 */

// A section is a "feature" if its class matches one of these live prefixes.
const FEATURE_CLASS = /(cardsection|threerow|creditcard)/i;

function isFeatureSection(el) {
  return el && el.tagName === 'SECTION' && FEATURE_CLASS.test(el.className || '');
}

export default function parse(element, { document }) {
  // Gather this section plus following sibling feature sections.
  const sections = [element];
  let sib = element.nextElementSibling;
  while (sib) {
    if (isFeatureSection(sib)) {
      sections.push(sib);
    } else if (sib.tagName === 'SECTION' && !isFeatureSection(sib)) {
      // stop at the first non-feature section
      break;
    }
    sib = sib.nextElementSibling;
  }

  const cells = [];

  // First feature's heading + description become the block title/subtitle.
  const first = sections[0];
  const firstHeading = first.querySelector('h1, h2, h3');
  const firstDesc = first.querySelector('p');

  const titleCell = [document.createComment(' field:title ')];
  const titleP = document.createElement('p');
  titleP.textContent = firstHeading ? firstHeading.textContent.replace(/\s+/g, ' ').trim() : '';
  titleCell.push(titleP);
  cells.push([titleCell]);

  const subtitleCell = [document.createComment(' field:subtitle ')];
  const subtitleP = document.createElement('p');
  subtitleP.textContent = firstDesc ? firstDesc.textContent.replace(/\s+/g, ' ').trim() : '';
  subtitleCell.push(subtitleP);
  cells.push([subtitleCell]);

  // The first section is the intro (its heading/description became the block
  // title/subtitle above). The remaining sections are the actual feature rows.
  sections.slice(1).forEach((section) => {
    const img = section.querySelector('img');
    const heading = section.querySelector('h1, h2, h3, h4');
    const desc = section.querySelector('p');

    const imageCell = [document.createComment(' field:image ')];
    if (img) imageCell.push(img);

    const bodyCell = [document.createComment(' field:text ')];
    if (heading) {
      const h = document.createElement('h3');
      h.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
      bodyCell.push(h);
    }
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.replace(/\s+/g, ' ').trim();
      bodyCell.push(p);
    }
    cells.push([imageCell, bodyCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'supermoney-features', cells });

  // Remove all consumed sections, then drop the generated block where the first
  // section was.
  sections.slice(1).forEach((s) => s.remove());
  element.replaceWith(block);
}
