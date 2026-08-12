/*
 * Cards Apply block
 *
 * Authored structure — one row per card, two cells:
 *   row (card)
 *     cell 1 -> <picture> card image (top half)
 *     cell 2 -> <h3> title, <p> description, <p><a>Apply Now</a></p>
 *
 * Decorated structure:
 *   .cards-apply
 *     ul
 *       li.cards-apply-card
 *         .cards-apply-card-image  -> image (top half)
 *         .cards-apply-symbol      -> centred Kotak badge (added here)
 *         .cards-apply-card-body   -> title + description + Apply Now link
 *
 * @param {Element} block the cards-apply block element
 */

// Red Kotak-style infinity ("∞") mark — a symmetric filled double loop, mirrored
// around the centre so both loops are the same size. Inline SVG = no network
// request, always red. Swap for the official brand asset when available.
const KOTAK_SYMBOL = `
  <svg viewBox="0 0 64 32" width="52" height="26" aria-hidden="true" focusable="false">
    <path fill="#d50e25" fill-rule="evenodd" d="
      M32 16
      C26 6 6 6 6 16
      C6 26 26 26 32 16
      C38 6 58 6 58 16
      C58 26 38 26 32 16 Z
      M32 16
      C28 10 12 10 12 16
      C12 22 28 22 32 16
      C36 10 52 10 52 16
      C52 22 36 22 32 16 Z"/>
  </svg>`;

export default function decorate(block) {
  const ul = document.createElement('ul');

  // Variant: ".cards-apply.no-symbol" renders the cards without the Kotak badge.
  const showSymbol = !block.classList.contains('no-symbol');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-apply-card';

    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture, img'));
    const bodyCell = cells.find((c) => c !== imageCell) || cells[cells.length - 1];

    // Top half — image
    if (imageCell) {
      imageCell.className = 'cards-apply-card-image';
      const img = imageCell.querySelector('img');
      if (img) {
        if (!img.getAttribute('alt')) img.setAttribute('alt', '');
        if (!img.getAttribute('width')) img.setAttribute('width', '600');
        if (!img.getAttribute('height')) img.setAttribute('height', '400');
        img.setAttribute('loading', 'lazy');
      }
      li.append(imageCell);
    }

    // Red Kotak symbol, centred over the bottom edge of the image (skipped for no-symbol).
    // Purely decorative -> aria-hidden, no aria-label (which is prohibited on a
    // plain <span> with no role).
    if (showSymbol) {
      const symbol = document.createElement('span');
      symbol.className = 'cards-apply-symbol';
      symbol.setAttribute('aria-hidden', 'true');
      symbol.innerHTML = KOTAK_SYMBOL;
      li.append(symbol);
    }

    // Bottom half — text + Apply Now
    if (bodyCell) {
      bodyCell.className = 'cards-apply-card-body';

      // Accessibility: this section sits directly under the carousel H1, so the
      // card titles must be H2 (not H3) to avoid skipping a heading level.
      bodyCell.querySelectorAll('h3').forEach((h3) => {
        const h2 = document.createElement('h2');
        h2.className = h3.className;
        while (h3.firstChild) h2.append(h3.firstChild);
        h3.replaceWith(h2);
      });

      // The lone Apply Now link is auto-decorated as a pill button by aem.js;
      // strip that chrome so it renders as the plain red text link this design needs.
      const links = bodyCell.querySelectorAll('a');
      const apply = links[links.length - 1];
      if (apply) {
        apply.classList.remove('button');
        const container = apply.closest('.button-container');
        if (container) container.classList.remove('button-container');
        apply.classList.add('cards-apply-apply');
      }

      li.append(bodyCell);
    }

    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}
