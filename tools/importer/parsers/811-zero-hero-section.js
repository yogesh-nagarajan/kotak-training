/* global WebImporter */

/**
 * Parser for the local draft `.811-zero-hero-section` block → EDS
 * `811-zero-hero-section` block.
 *
 * The block MODEL exposes 4 cell-groups; every group MUST align with its own
 * block-table row, even when empty:
 *
 *   Row 1 (header): block name ("811 Zero Hero Section")
 *   Row 2: Desktop Image (image + imageAlt)   — kept EMPTY (no live URL)
 *   Row 3: Mobile Image  (imageMobile + imageMobileAlt) — kept EMPTY (no live URL)
 *   Row 4: Content group — Pretitle <p> + Title <p> + Description <p> (in order)
 *   Row 5: CTA group — CTA anchor (<p><a></p>) + new-tab flag (<p>true|false</p>)
 *
 * The banner images are intentionally left empty so no external/live image URL
 * is baked into the content; authors attach DAM assets in the editor.
 *
 * @param {Element} el The `.811-zero-hero-section` source element
 * @param {Object} ctx Parser context ({ document })
 */
export default function parse(el, { document }) {
  const rows = Array.from(el.children);

  // Collect the text paragraphs (pretitle, title, description), the CTA anchor,
  // and the optional new-tab flag from the source rows.
  const paragraphs = [];
  let ctaAnchor = null;
  let newTabFlag = null;
  rows.forEach((row) => {
    row.querySelectorAll('a').forEach((a) => {
      if (!ctaAnchor && a.getAttribute('href')) ctaAnchor = a;
    });
    row.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach((node) => {
      if (node.querySelector('a')) return; // skip the CTA wrapper paragraph
      const txt = node.textContent.trim();
      if (!txt) return;
      // a lone "true"/"false" paragraph is the CTA new-tab flag, not content
      if (/^(true|false)$/i.test(txt)) {
        newTabFlag = txt.toLowerCase() === 'true';
        return;
      }
      paragraphs.push(txt);
    });
  });

  // empty-block guard
  if (!paragraphs.length && !ctaAnchor) {
    el.replaceWith(...el.childNodes);
    return;
  }

  const mkP = (text) => {
    const p = document.createElement('p');
    p.textContent = text;
    return p;
  };

  // Content group cell: one <p> per field, in order (pretitle, title, desc).
  const [pretitle = '', title = '', ...rest] = paragraphs;
  const description = rest.join(' ');
  const contentCell = [mkP(pretitle), mkP(title), mkP(description)];

  // CTA group cell: the anchor paragraph plus the new-tab flag.
  const ctaCell = [];
  if (ctaAnchor) {
    const wrap = document.createElement('p');
    const a = document.createElement('a');
    a.setAttribute('href', ctaAnchor.getAttribute('href'));
    a.textContent = ctaAnchor.textContent.trim();
    wrap.append(a);
    ctaCell.push(wrap);
    // new-tab flag: prefer an explicit true/false flag paragraph from the
    // source, otherwise fall back to the anchor's target attribute
    const opensNewTab = newTabFlag !== null
      ? newTabFlag
      : (ctaAnchor.getAttribute('target') || '').trim() === '_blank';
    ctaCell.push(mkP(opensNewTab ? 'true' : 'false'));
  }

  const cells = [
    ['811 Zero Hero Section'],
    [''], // Desktop Image — empty
    [''], // Mobile Image — empty
    [contentCell], // Content group
    [ctaCell.length ? ctaCell : ''], // CTA group
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  el.replaceWith(table);
}
