/* global WebImporter */

/**
 * Parser for the Kotak "owl-hero-banner" → EDS `hero-p` block.
 *
 * xwalk model `hero-p` fields → one row per field (simple block), each cell
 * carrying an `<!-- field:name -->` hint so md2jcr maps content to the model:
 *   Row 1: block name ("Hero P")
 *   Row 2: <!-- field:image -->        desktop background banner
 *   Row 3: <!-- field:imageMobile -->  mobile background banner (optional)
 *   Row 4: <!-- field:title -->        heading (richtext)
 *   Row 5: <!-- field:description -->  subheading paragraph (richtext)
 *   Row 6: <!-- field:ctaLink -->      call-to-action link (aem-content)
 *
 * The `imageAlt` / `imageMobileAlt` / `ctaText` fields are collapsed (Alt / Text
 * suffix) into their parent's attributes, so they get no row of their own.
 *
 * Source structure (simplified):
 *   .owl-hero-banner
 *     picture > source[srcset=…-d.jpg] / source[srcset=…-m.jpg] > img
 *     h1.hero-banner-title
 *     p (subtitle)
 *     a.btn.btn-primary (Apply Now CTA)
 *
 * @param {Element} el The `.owl-hero-banner` source element
 * @param {Object} ctx Parser context ({ document })
 */
export default function parse(el, { document }) {
  const toAbs = (src) => (src && src.startsWith('/') ? `https://www.kotak.bank.in${src}` : src);

  const makeImg = (src) => {
    const picture = document.createElement('picture');
    const i = document.createElement('img');
    i.setAttribute('src', toAbs(src));
    i.setAttribute('alt', 'Kotak Forex Card');
    picture.append(i);
    return picture;
  };

  // Build a cell as a fragment: field-hint comment followed by its content.
  const hinted = (field, ...nodes) => {
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(` field:${field} `));
    nodes.filter(Boolean).forEach((n) => frag.appendChild(n));
    return frag;
  };

  // Desktop / mobile banners from the source <picture> srcsets, falling back to
  // the single rendered <img> for the desktop slot.
  const img = el.querySelector('img');
  const srcsets = [...el.querySelectorAll('picture source')]
    .map((s) => (s.getAttribute('srcset') || '').split(',')[0].trim().split(' ')[0])
    .filter(Boolean);
  const desktopSrc = srcsets.find((s) => /-d\.(jpg|jpeg|png|webp)/i.test(s))
    || (img && img.getAttribute('src'));
  const mobileSrc = srcsets.find((s) => /-m\.(jpg|jpeg|png|webp)/i.test(s));

  // Title (heading).
  const sourceTitle = el.querySelector('h1');
  let title = null;
  if (sourceTitle) {
    title = document.createElement('h1');
    title.textContent = sourceTitle.textContent.trim();
  }

  // Description — the descriptive paragraph (not the CTA button wrapper).
  const sourceSubtitle = [...el.querySelectorAll('p')]
    .find((p) => p.textContent.trim() && !p.querySelector('a.btn, a.btn-primary'));
  let description = null;
  if (sourceSubtitle && sourceSubtitle.textContent.trim()) {
    description = document.createElement('p');
    description.textContent = sourceSubtitle.textContent.trim().replace(/\s+/g, ' ');
  }

  // CTA — link text + href (ctaText collapses into the anchor).
  const sourceCta = el.querySelector('a.btn, a.btn-primary, a');
  let ctaWrap = null;
  if (sourceCta && sourceCta.getAttribute('href')) {
    ctaWrap = document.createElement('p');
    const cta = document.createElement('a');
    cta.setAttribute('href', sourceCta.getAttribute('href'));
    cta.textContent = sourceCta.textContent.trim() || 'Apply Now';
    ctaWrap.append(cta);
  }

  // One row per model field, each with its field hint.
  const cells = [['Hero P']];
  if (desktopSrc) cells.push([hinted('image', makeImg(desktopSrc))]);
  if (mobileSrc) cells.push([hinted('imageMobile', makeImg(mobileSrc))]);
  if (title) cells.push([hinted('title', title)]);
  if (description) cells.push([hinted('description', description)]);
  if (ctaWrap) cells.push([hinted('ctaLink', ctaWrap)]);

  const table = WebImporter.DOMUtils.createTable(cells, document);
  el.replaceWith(table);
}
