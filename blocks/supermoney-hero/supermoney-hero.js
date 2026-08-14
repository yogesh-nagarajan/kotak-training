import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Merged hero + cards block.
 *
 * Expected authored structure (one column table):
 *   Row 1: desktop banner image (picture/img only)  -> banner background (desktop)
 *   Row 2: mobile banner image (picture/img only)    -> banner image (mobile) [optional]
 *   Row 3: hero text (eyebrow, H1, subtext, CTA)      -> banner content overlay
 *   Row 4..N: one card per row = image cell + text cell (icon + label)
 *
 * Renders the banner with the image full-bleed behind the text (desktop) or
 * stacked below it (mobile), and a row of cards that overlaps the banner. On
 * mobile the cards become a horizontal scroll slider (handled in CSS).
 *
 * @param {Element} block The supermoney-hero block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Image-only rows (no heading, single cell with a picture/img). The first is
  // the desktop banner, the optional second is the mobile banner.
  const imageRows = rows.filter((row) => {
    const cells = [...row.children];
    return cells.length === 1
      && cells[0].querySelector('picture, img')
      && !cells[0].textContent.trim();
  });
  const [desktopImageRow, mobileImageRow] = imageRows;

  // Hero text row: the one carrying the main heading.
  const textRow = rows.find((row) => row.querySelector('h1'));

  // Everything else (not an image-only row, not the text row) is a card.
  const cardRows = rows.filter((row) => !imageRows.includes(row) && row !== textRow);

  // --- Banner ---
  const banner = document.createElement('div');
  banner.className = 'supermoney-hero-banner';

  if (desktopImageRow) {
    const image = document.createElement('div');
    image.className = 'supermoney-hero-image supermoney-hero-image-desktop';
    const pic = desktopImageRow.querySelector('picture, img');
    if (pic) image.append(pic.closest('picture') || pic);
    banner.append(image);
  }

  if (mobileImageRow) {
    const image = document.createElement('div');
    image.className = 'supermoney-hero-image supermoney-hero-image-mobile';
    const pic = mobileImageRow.querySelector('picture, img');
    if (pic) image.append(pic.closest('picture') || pic);
    banner.append(image);
    // flag that a dedicated mobile image exists so CSS can swap the two
    banner.classList.add('has-mobile-image');
  }

  if (textRow) {
    const content = document.createElement('div');
    content.className = 'supermoney-hero-content';
    [...textRow.children].forEach((cell) => {
      while (cell.firstElementChild) content.append(cell.firstElementChild);
    });
    // Style the last link as the primary CTA button.
    const cta = content.querySelector('a');
    if (cta) {
      cta.classList.add('button');
      const wrapper = cta.closest('p');
      if (wrapper) wrapper.classList.add('button-container');
    }
    banner.append(content);
  }

  // --- Cards ---
  const ul = document.createElement('ul');
  ul.className = 'supermoney-hero-cards';
  cardRows.forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((cell) => {
      if (cell.children.length === 1 && cell.querySelector('picture, img')) {
        cell.className = 'supermoney-hero-card-image';
      } else {
        cell.className = 'supermoney-hero-card-body';
      }
    });
    ul.append(li);
  });

  // ptimize card images.
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });

  //  Finalize.
  block.replaceChildren(banner);
  if (cardRows.length) block.append(ul);
}


