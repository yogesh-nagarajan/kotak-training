/* global WebImporter */

/**
 * Parser for the Kotak "owl-hero-banner" → EDS `hero-p` block.
 *
 * xwalk model `hero-p` fields → one row per field (simple block), each cell
 * carrying an `<!-- field:name -->` hint so md2jcr maps content to the model:
 *   Row 1: block name ("Hero P")
 *   Row 2: <!-- field:image -->        desktop background banner
 *   Row 3: <!-- field:imageMobile -->  mobile background banner (optional)
 *   Row 4: content cell grouping the three richtext fields (shared `content_`
 *          prefix keeps them in ONE cell, satisfying the 4-cell block limit):
 *            <!-- field:content_heading -->      heading
 *            <!-- field:content_description -->   subheading paragraph
 *            <!-- field:content_cta -->           call-to-action link
 *
 * The `imageAlt` / `imageMobileAlt` fields are collapsed (Alt suffix) into the
 * image's alt attribute, so they get no row of their own.
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

  // Content cell — heading, description and CTA grouped together. The shared
  // `content_` field prefix keeps them in ONE cell (4-cell block limit), while
  // each hint still maps to its own editable field.
  const contentNodes = [];

  const sourceTitle = el.querySelector('h1');
  contentNodes.push(document.createComment(' field:content_heading '));
  if (sourceTitle) {
    const title = document.createElement('h1');
    title.textContent = sourceTitle.textContent.trim();
    contentNodes.push(title);
  }

  // Description — the descriptive paragraph (not the CTA button wrapper).
  const sourceSubtitle = [...el.querySelectorAll('p')]
    .find((p) => p.textContent.trim() && !p.querySelector('a.btn, a.btn-primary'));
  contentNodes.push(document.createComment(' field:content_description '));
  if (sourceSubtitle && sourceSubtitle.textContent.trim()) {
    const description = document.createElement('p');
    description.textContent = sourceSubtitle.textContent.trim().replace(/\s+/g, ' ');
    contentNodes.push(description);
  }

  // CTA — link text + href.
  const sourceCta = el.querySelector('a.btn, a.btn-primary, a');
  contentNodes.push(document.createComment(' field:content_cta '));
  if (sourceCta && sourceCta.getAttribute('href')) {
    const ctaWrap = document.createElement('p');
    const cta = document.createElement('a');
    cta.setAttribute('href', sourceCta.getAttribute('href'));
    cta.textContent = sourceCta.textContent.trim() || 'Apply Now';
    ctaWrap.append(cta);
    contentNodes.push(ctaWrap);
  }

  // Rows: block name, desktop image, optional mobile image, grouped content.
  const cells = [['Hero P']];
  if (desktopSrc) cells.push([hinted('image', makeImg(desktopSrc))]);
  if (mobileSrc) cells.push([hinted('imageMobile', makeImg(mobileSrc))]);
  cells.push([contentNodes]);

  const table = WebImporter.DOMUtils.createTable(cells, document);
  el.replaceWith(table);
}
