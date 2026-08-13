/* global WebImporter */

/**
 * Parser for the Kotak "owl-hero-banner" → EDS `hero-p` block.
 *
 * Block convention (1 column, 3 rows):
 *   Row 1: block name ("Hero P")
 *   Row 2: single cell — Background Image (optional)
 *   Row 3: single cell — Title (Heading) + Subheading + Call-to-Action (text + link)
 *
 * Source structure (simplified):
 *   .owl-hero-banner
 *     picture > img.hs-image        (full-width background banner)
 *     h1.hero-banner-title          (overlaid title)
 *     p                             (subtitle)
 *     a.btn.btn-primary             (Apply Now CTA)
 *
 * @param {Element} el The `.owl-hero-banner` source element
 * @param {Object} ctx Parser context ({ document })
 */
export default function parse(el, { document }) {
  // Row 2 — background image(s). The source <picture> carries both a desktop
  // (…-d.jpg) and a mobile (…-m.jpg) banner in its <source srcset>. Emit both
  // as separate <img> elements (desktop first, mobile second) so the block can
  // swap them by viewport via CSS. Fall back to the single rendered <img>.
  const img = el.querySelector('img');
  const imageCell = [];
  const srcsets = [...el.querySelectorAll('picture source')]
    .map((s) => (s.getAttribute('srcset') || '').split(',')[0].trim().split(' ')[0])
    .filter(Boolean);
  const desktopSrc = srcsets.find((s) => /-d\.(jpg|jpeg|png|webp)/i.test(s));
  const mobileSrc = srcsets.find((s) => /-m\.(jpg|jpeg|png|webp)/i.test(s));
  const toAbs = (src) => (src && src.startsWith('/') ? `https://www.kotak.bank.in${src}` : src);
  const makeImg = (src) => {
    const i = document.createElement('img');
    i.setAttribute('src', toAbs(src));
    i.setAttribute('alt', 'Kotak Forex Card');
    return i;
  };
  if (desktopSrc) imageCell.push(makeImg(desktopSrc));
  if (mobileSrc) imageCell.push(makeImg(mobileSrc));
  if (!imageCell.length && img) imageCell.push(img);

  // Row 3 — title, subheading and CTA, all in a single cell.
  const contentCell = [];

  const sourceTitle = el.querySelector('h1');
  const title = document.createElement('h1');
  title.textContent = sourceTitle ? sourceTitle.textContent.trim() : '';
  contentCell.push(title);

  // Subheading: the descriptive paragraph (not the CTA button wrapper).
  const sourceSubtitle = [...el.querySelectorAll('p')]
    .find((p) => p.textContent.trim() && !p.querySelector('a.btn, a.btn-primary'));
  if (sourceSubtitle && sourceSubtitle.textContent.trim()) {
    const subtitle = document.createElement('p');
    subtitle.textContent = sourceSubtitle.textContent.trim().replace(/\s+/g, ' ');
    contentCell.push(subtitle);
  }

  // Call-to-action: text with a link, wrapped in a paragraph.
  const sourceCta = el.querySelector('a.btn, a.btn-primary, a');
  if (sourceCta && sourceCta.getAttribute('href')) {
    const ctaWrap = document.createElement('p');
    const cta = document.createElement('a');
    cta.setAttribute('href', sourceCta.getAttribute('href'));
    cta.textContent = sourceCta.textContent.trim() || 'Apply Now';
    ctaWrap.append(cta);
    contentCell.push(ctaWrap);
  }

  // Build the block table and replace the source element.
  const cells = [
    ['Hero P'],
    [imageCell],
    [contentCell],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  el.replaceWith(table);
}
