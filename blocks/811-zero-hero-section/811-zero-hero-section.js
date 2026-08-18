import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the 811 zero-balance hero section
 * Replicates the Kotak811 "Zero balance digital savings account" hero: a
 * full-bleed background banner (desktop + mobile variants swapped by viewport)
 * with centered text content (pretitle, title, description and a CTA button).
 *
 * The block model exposes 4 cell-groups, one per row, in this fixed order (a
 * reference image field collapses with its paired alt field; element-grouped
 * fields share a single cell, one authored element per field, in order):
 *   Row 1: Desktop Image (image + imageAlt)        — may be empty
 *   Row 2: Mobile Image  (imageMobile + imageMobileAlt) — may be empty
 *   Row 3: Content group — Pretitle, Title, Description (in order)
 *   Row 4: CTA group — CTA URL + Label (anchor), Open-in-new-tab (boolean)
 * Any field may be empty; each case is handled gracefully.
 *
 * @param {Element} block The 811-zero-hero-section block element
 */
export default function decorate(block) {
  const [desktopRow, mobileRow, contentRow, ctaRow] = [...block.children];

  const cellOf = (row) => row?.firstElementChild || row;

  // --- banner images (desktop + mobile) -------------------------------------
  const imageContainer = document.createElement('div');
  imageContainer.className = 'zero-hero-image';
  [desktopRow, mobileRow].forEach((row, index) => {
    const el = row?.querySelector('picture, img');
    const srcImg = el && (el.tagName === 'IMG' ? el : el.querySelector('img'));
    if (!srcImg) return;
    // re-render as an optimized <picture>, carrying the Universal Editor
    // instrumentation onto the rendered <img> so the image stays a live
    // drag-and-drop asset target in the authoring environment
    const optimized = createOptimizedPicture(
      srcImg.src,
      srcImg.getAttribute('alt') || '',
      index === 0, // eager-load the first (primary) banner
      [{ width: '1600' }],
    );
    moveInstrumentation(srcImg, optimized.querySelector('img'));
    optimized.classList.add(index === 0 ? 'zero-hero-image-desktop' : 'zero-hero-image-mobile');
    imageContainer.append(optimized);
  });

  // --- text content (pretitle, title, description) --------------------------
  // The content group delivers each field as its own child element inside the
  // cell, in model order: [pretitle, title, description...].
  const content = document.createElement('div');
  content.className = 'zero-hero-content';

  const contentCell = cellOf(contentRow);
  const contentParts = contentCell ? [...contentCell.children] : [];
  const [pretitleEl, titleEl, ...descEls] = contentParts;

  // pretitle (eyebrow) — first paragraph above the heading
  if (pretitleEl && pretitleEl.textContent.trim()) {
    const pretitle = document.createElement('p');
    pretitle.className = 'zero-hero-eyebrow';
    pretitle.textContent = pretitleEl.textContent.trim();
    moveInstrumentation(pretitleEl, pretitle);
    content.append(pretitle);
  }

  // title
  if (titleEl && titleEl.textContent.trim()) {
    const title = document.createElement('h1');
    title.textContent = titleEl.textContent.trim();
    moveInstrumentation(titleEl, title);
    content.append(title);
  }

  // description (richtext) — keep the authored element(s) as-is so the richtext
  // instrumentation is preserved
  descEls.forEach((el) => {
    if (el.textContent.trim() || el.querySelector('img, picture, a')) {
      content.append(el);
    }
  });

  // --- CTA (link + label, optional new tab) ---------------------------------
  // The CTA group delivers the link/label as an anchor, then the new-tab flag.
  const ctaCell = cellOf(ctaRow);
  const ctaAnchor = ctaCell?.querySelector('a');
  const href = ctaAnchor?.getAttribute('href');
  if (href) {
    // the new-tab flag arrives as a sibling element in the cell (the "true"/
    // "false" boolean value), separate from the anchor
    const flagEl = ctaCell
      ? [...ctaCell.children].find((c) => !c.querySelector('a') && !c.matches('a'))
      : null;
    const newTab = (flagEl?.textContent || '').trim().toLowerCase() === 'true';
    const wrapper = document.createElement('p');
    wrapper.className = 'button-container';
    const cta = document.createElement('a');
    cta.className = 'button';
    cta.href = href;
    cta.textContent = ctaAnchor.textContent.trim() || href;
    const ctaTitle = ctaAnchor.getAttribute('title');
    if (ctaTitle) cta.title = ctaTitle;
    if (newTab) {
      cta.setAttribute('target', '_blank');
      cta.setAttribute('rel', 'noopener noreferrer');
    }
    moveInstrumentation(ctaAnchor, cta);
    wrapper.append(cta);
    content.append(wrapper);
  }

  // rebuild the block: content first, banner image second (content-first order)
  block.replaceChildren();
  if (content.children.length) block.append(content);
  if (imageContainer.children.length) block.append(imageContainer);

  // opt into the project's AOS fade-in if available, without adding or
  // modifying any global AOS implementation. The scoped CSS provides a graceful
  // fade-in fallback when AOS is not present.
  if (!block.hasAttribute('data-aos')) {
    block.setAttribute('data-aos', 'fade-in');
    block.setAttribute('data-aos-delay', '100');
  }
}
