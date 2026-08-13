/* global WebImporter */

/**
 * Global cleanup transformer for the forex-card template.
 *
 * beforeTransform: strip scripts/styles and non-content chrome (header, footer,
 *   nav, modals, breadcrumbs) so block parsers operate on clean DOM.
 * afterTransform: isolate the page to its two meaningful regions — the hero-p
 *   block (created by the parser) and the intro content section
 *   ("Kotak Forex Card: Carry Multiple Currencies in One") — discarding the rest
 *   of the long marketing page so the imported document matches the intended
 *   forex-card layout.
 *
 * @param {string} hookName 'beforeTransform' | 'afterTransform'
 * @param {Element} element The root element (document.body / main)
 * @param {Object} payload { document, url, html, params, template }
 */
export default function transform(hookName, element, payload) {
  const { document } = payload;

  if (hookName === 'beforeTransform') {
    WebImporter.DOMUtils.remove(element, [
      'script',
      'style',
      'noscript',
      'link',
      'svg',
      'header',
      'footer',
      'nav',
      '.header',
      '.footer',
      '.navigation',
      '.modal',
      '.cookie-banner',
      '.breadcrumb',
      '.breadcrumbs',
    ]);
    return;
  }

  if (hookName === 'afterTransform') {
    // The parser has already replaced .owl-hero-banner with a "Hero P" table.
    const heroTable = [...element.querySelectorAll('table')]
      .find((t) => t.textContent.trim().startsWith('Hero P'));

    // Locate the intro heading and gather it plus following content until the
    // next heading (its paragraph[s]).
    const introHeading = [...element.querySelectorAll('h2, h3')]
      .find((h) => /Carry Multiple Currencies/i.test(h.textContent));

    const introNodes = [];
    if (introHeading) {
      introNodes.push(introHeading);
      let sib = introHeading.nextElementSibling;
      while (sib && !/^H[1-6]$/.test(sib.tagName)) {
        // keep meaningful text/paragraph content; skip empties
        if (sib.textContent.trim()) introNodes.push(sib);
        sib = sib.nextElementSibling;
      }
    }

    // Rebuild main with only the hero block and the intro section, separated by
    // a section break (<hr>). Bail out gracefully if the hero table is missing.
    if (!heroTable) return;

    const keep = [];
    keep.push(heroTable);
    if (introNodes.length) {
      const hr = document.createElement('hr');
      keep.push(hr);
      // Clone intro nodes so removing/clearing the tree can't drop them.
      introNodes.forEach((n) => keep.push(n.cloneNode(true)));
    }

    element.replaceChildren(...keep);
  }
}
