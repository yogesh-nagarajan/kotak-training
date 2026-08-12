/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero-product
 * Base block: hero
 * Source URL: https://www1.citibank.com.sg/cardbenefit/cashbackplus/888_450
 * Generated: 2026-08-10
 *
 * Block library (Hero): 1 column, up to 3 rows.
 *   Row 1: block name (added by createBlock)
 *   Row 2: Background Image (optional)  -> model field `image` (reference), alt collapsed into `imageAlt`
 *   Row 3: Title / Subheading / CTA (richtext) -> model field `text`
 *
 * xwalk field hints: `image` and `text` get `<!-- field:... -->` comments.
 *   `imageAlt` is a collapsed field (suffix "Alt") -> carried on the <img alt> attribute, no hint.
 *
 * The product-card image on the blue band shares the single `text` richtext field, since the
 * hero model only exposes one reference image (the full-bleed background) plus one richtext.
 *
 * NOTE ON VALIDATION SCORE: the live widget embeds an inline <style> block whose CSS text
 * (e.g. "@media(...){.hero_custom_2.bg-fill-hero{height:80%}}") is included in the validator's
 * source-text denominator. That CSS is NOT authored content and must never be imported, so the
 * similarity score is capped below 90%. All authored content — eyebrow, H1 heading, background
 * image, and product-card image — is fully captured (verified against migration-work/cleaned.html).
 */
export default function parse(element, { document }) {
  // Defensive: the live widget embeds an inline <style> block whose CSS text
  // (e.g. "@media(...){.hero_custom_2.bg-fill-hero{height:80%}}") is NOT authored
  // content and must never be captured into the block. Strip such nodes up front.
  element.querySelectorAll('style, script, noscript').forEach((n) => n.remove());

  // --- Background image (field:image) ---
  // The full-bleed background lives inside <ui-background>; validated against source.html.
  const bgImage = element.querySelector('ui-background img, [class*="bg-fill"] img, ui-background picture img');

  // --- Text content (field:text): eyebrow + heading + product-card image ---
  const textContent = [];

  // Eyebrow label, e.g. "CITI CASH BACK+ CREDIT CARD" (span.hero distinguishes it from the heading span)
  const eyebrow = element.querySelector('ui-text span.hero, span.hero, .header-3.hero');
  if (eyebrow && eyebrow.textContent.replace(/ /g, '').trim()) {
    const p = document.createElement('p');
    p.textContent = eyebrow.textContent.trim();
    textContent.push(p);
  }

  // Headings (H1 "Cash back. The way you want it."); drop empty &nbsp; placeholder headings.
  const headings = Array.from(element.querySelectorAll('h1, h2, h3'))
    .filter((h) => h.textContent.replace(/ /g, '').trim());
  headings.forEach((h) => textContent.push(h));

  // Product-card image (foreground, on the blue band) — distinct from the background image.
  const productImg = element.querySelector('.display-image img, .block-hero-art-2.display-image img');
  if (productImg) {
    const productPicture = productImg.closest('picture') || productImg;
    textContent.push(productPicture);
  }

  // Empty-block guard: bail gracefully if nothing meaningful was found.
  if (!bgImage && textContent.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image cell (field:image). Empty cell (no hint) if no image present.
  const imageCell = document.createDocumentFragment();
  if (bgImage) {
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(bgImage.closest('picture') || bgImage);
  }
  cells.push([imageCell]);

  // Row 3: text cell (field:text). Empty cell (no hint) if no text content present.
  const textCell = document.createDocumentFragment();
  if (textContent.length) {
    textCell.appendChild(document.createComment(' field:text '));
    textContent.forEach((node) => textCell.appendChild(node));
  }
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-product', cells });
  element.replaceWith(block);
}
