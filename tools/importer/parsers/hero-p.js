/* global WebImporter */

/**
 * Parser for the Kotak "owl-hero-banner" → EDS `hero-p` block.
 *
 * xwalk model `hero-p` fields → one row per field (simple block), each cell
 * carrying an `<!-- field:name -->` hint so md2jcr maps content to the model:
 *   Row 1: block name ("Hero P")
 *   Row 2: <!-- field:image -->        desktop background banner
 *   Row 3: <!-- field:imageMobile -->  mobile background banner (optional)
 *   Row 4: content cell grouping the heading + description richtext fields
 *          (shared `content_` prefix keeps them in ONE cell):
 *            <!-- field:content_heading -->      heading
 *            <!-- field:content_description -->   subheading paragraph
 *   Row 5: CTA cell (shared `cta_` prefix → its own cell):
 *            <!-- field:cta_link -->             call-to-action link (URL + label)
 *
 * Keeping the block at 4 grouped cells (image, imageMobile, content, cta)
 * satisfies the xwalk max-cells limit. The `imageAlt` / `imageMobileAlt` /
 * `cta_linkText` fields are collapsed (Alt / Text suffix) into their parent's
 * attributes; `cta_newTab` is a boolean and is left to authoring, so they get
 * no row of their own.
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

  // CTA — link URL + label, in its own `cta_` cell.
  const sourceCta = el.querySelector('a.btn, a.btn-primary, a');
  let ctaCell = null;
  if (sourceCta && sourceCta.getAttribute('href')) {
    const ctaWrap = document.createElement('p');
    const cta = document.createElement('a');
    cta.setAttribute('href', sourceCta.getAttribute('href'));
    cta.textContent = sourceCta.textContent.trim() || 'Apply Now';
    ctaWrap.append(cta);
    ctaCell = hinted('cta_link', ctaWrap);
  }

  // Rows: block name, desktop image, optional mobile image, content, CTA.
  const cells = [['Hero P']];
  if (desktopSrc) cells.push([hinted('image', makeImg(desktopSrc))]);
  if (mobileSrc) cells.push([hinted('imageMobile', makeImg(mobileSrc))]);
  cells.push([contentNodes]);
  if (ctaCell) cells.push([ctaCell]);

  const table = WebImporter.DOMUtils.createTable(cells, document);
  el.replaceWith(table);
}
