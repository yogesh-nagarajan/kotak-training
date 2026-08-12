/*
 * Promo Banner block
 *
 * A full-width promotional banner with a background image and left-aligned
 * overlay content (heading, description, CTA button). Single component.
 *
 * Authored structure — one row, two cells:
 *   cell 1 -> <picture>/<img> background image
 *   cell 2 -> <h2> heading, <p> description, <p><a> CTA
 *
 * @param {Element} block the promo-banner block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Locate the background image (first cell containing a picture/img) and the
  // content cell (everything else).
  let bgImg = null;
  let contentCell = null;

  rows.forEach((row) => {
    [...row.children].forEach((cell) => {
      if (!bgImg && cell.querySelector('picture, img')) {
        bgImg = cell.querySelector('img');
      } else {
        contentCell = cell;
      }
    });
  });

  // Apply the background image to the block itself.
  if (bgImg && bgImg.src) {
    block.style.backgroundImage = `url("${bgImg.src}")`;
  }

  // Build the content wrapper from the content cell.
  const content = document.createElement('div');
  content.className = 'promo-banner-content';

  if (contentCell) {
    [...contentCell.children].forEach((el) => content.append(el));
  }

  // Style the CTA link as a button.
  const cta = content.querySelector('a');
  if (cta) {
    cta.className = 'promo-banner-cta';
    // unwrap any button-container paragraph so the link sits directly in content
    const p = cta.closest('p');
    if (p && p.children.length === 1) {
      p.replaceWith(cta);
    }
  }

  block.textContent = '';
  block.append(content);
}
