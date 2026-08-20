/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero-carousel
 * Base block: hero-carousel (container block with repeatable "Hero Slide" items)
 * Source: http://localhost:3000/preview
 * Generated: 2026-08-12
 *
 * xwalk container block. Each `.hero-carousel-slide` maps to one "hero-slide" item (one row).
 * Model fields (blocks/hero-carousel/_hero-carousel.json -> model "hero-slide"):
 *   - image       (reference) -> own cell, field:image  (imageAlt collapsed into <img alt="">)
 *   - mobileImage (reference) -> own cell, field:mobileImage (optional; from the <source media="(max-width:749px)">)
 *   - imageAlt    (text)      -> COLLAPSED (Alt suffix) — lives on the <img> alt attribute
 *   - text        (richtext)  -> own cell, field:text   (H1 title + optional description paragraph)
 *   - link        (aem-content) -> own cell, field:link (linkText collapsed into anchor text)
 *   - linkText    (text)      -> COLLAPSED (Text suffix) — lives as the <a> text content
 * => ALWAYS 4 columns per slide row: [image, mobileImage, text, link]
 *
 * Column count MUST be identical on every row. xwalk maps cells to model fields
 * positionally, so a slide without a mobile image still emits an EMPTY
 * mobileImage cell — otherwise the columns shift and content lands in the wrong
 * field (the "content isn't mapping to the model correctly" error).
 */

/**
 * Wrap cell content with a Universal Editor field hint comment placed BEFORE the content.
 * Returns a DocumentFragment (empty string caller-side handles empty cells, no hint).
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
  // One row per slide. Fallbacks cover cross-page DOM variation.
  // (art-directed responsive images: desktop + optional mobile per slide)
  const slides = Array.from(
    element.querySelectorAll('.hero-carousel-slide, [class*="carousel-slide"], [role="group"]'),
  );

  // Empty-block guard: no slides -> unwrap so content isn't lost.
  if (!slides.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Create a standalone <img> from a src + alt (used to rebuild image cells so
  // each authored image round-trips as its own reference field).
  const makeImg = (src, alt) => {
    if (!src) return null;
    const el = document.createElement('img');
    el.setAttribute('src', src);
    if (alt) el.setAttribute('alt', alt);
    return el;
  };

  slides.forEach((slide) => {
    // image field: read the rendered art-directed <picture>. Desktop comes from
    // the min-width source (or the fallback <img>); mobile from the max-width
    // source. Falls back gracefully to a plain <img> for single-image slides.
    const picture = slide.querySelector('.hero-carousel-image picture, picture');
    const img = slide.querySelector('.hero-carousel-image img, img');
    const alt = (img && img.getAttribute('alt')) || '';

    let desktopSrc = '';
    let mobileSrc = '';
    if (picture) {
      const desktopSource = picture.querySelector('source[media*="min-width"]');
      const mobileSource = picture.querySelector('source[media*="max-width"]');
      desktopSrc = (desktopSource && desktopSource.getAttribute('srcset'))
        || (img && img.getAttribute('src')) || '';
      mobileSrc = (mobileSource && mobileSource.getAttribute('srcset')) || '';
    } else if (img) {
      desktopSrc = img.getAttribute('src') || '';
    }

    const desktopImg = makeImg(desktopSrc, alt);
    const mobileImg = makeImg(mobileSrc, alt);

    // text field (richtext): H1 title + optional description paragraph(s).
    const content = slide.querySelector('.hero-carousel-content') || slide;
    const title = content.querySelector('h1, h2, h3, [class*="title"]');
    const descriptions = Array.from(content.querySelectorAll(':scope > p'));

    // link field (aem-content CTA): anchor text collapses into linkText.
    const cta = content.querySelector('a.hero-carousel-cta, a.button, a[href]');

    // Build cells. EVERY row must have the SAME 4 columns in the SAME order —
    // [image, mobileImage, text, link] — because xwalk maps cells to model
    // fields positionally. A field with no content still gets its column as an
    // empty cell (empty string => empty <div>, no field hint); dropping the
    // cell would shift every later field into the wrong column.
    const imageCell = desktopImg ? withFieldHint(document, 'image', desktopImg) : '';
    const mobileImageCell = mobileImg ? withFieldHint(document, 'mobileImage', mobileImg) : '';

    // Build text cell from title + descriptions (empty cell if none).
    const textNodes = [];
    if (title) textNodes.push(title);
    descriptions.forEach((p) => textNodes.push(p));
    const textCell = textNodes.length ? withFieldHint(document, 'text', textNodes) : '';

    // Build link cell (empty cell if absent).
    const linkCell = cta ? withFieldHint(document, 'link', cta) : '';

    // Fixed 4-column row — never conditionally omit a cell.
    cells.push([imageCell, mobileImageCell, textCell, linkCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-carousel', cells });
  element.replaceWith(block);
}
