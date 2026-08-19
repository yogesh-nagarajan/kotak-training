import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Builds a text column from a content row of rich text (heading + paragraphs),
 * flattening the row/cell wrappers and promoting the first heading for styling.
 * @param {Element} row The delivered content row
 * @param {string} variant 'desktop' or 'mobile'
 * @returns {Element|null} the populated text column, or null when empty
 */
function buildText(row, variant) {
  if (!row) return null;
  const text = document.createElement('div');
  text.className = `pvr-inox-feature-text pvr-inox-feature-text-${variant}`;
  moveInstrumentation(row, text);

  [...row.children].forEach((cell) => {
    while (cell.firstElementChild) text.append(cell.firstElementChild);
  });

  // Promote the first heading (if authored) for the large feature title.
  const heading = text.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.classList.add('pvr-inox-feature-heading');

  return text.children.length ? text : null;
}

/**
 * Builds an image column as an optimized, responsive picture.
 * @param {Element} row The delivered image row
 * @param {string} variant 'desktop' or 'mobile'
 * @returns {Element|null} the populated media column, or null when empty
 */
function buildMedia(row, variant) {
  const img = row?.querySelector('img');
  if (!img) return null;

  const media = document.createElement('div');
  media.className = `pvr-inox-feature-media pvr-inox-feature-media-${variant}`;

  const optimized = createOptimizedPicture(
    img.src,
    img.getAttribute('alt') || '',
    false,
    [{ width: '750' }, { width: '1200' }],
  );
  moveInstrumentation(img, optimized.querySelector('img'));
  media.append(optimized);
  return media;
}

/**
 * loads and decorates the pvr-inox-feature block
 *
 * A two-column feature: a text column (heading + supporting text) beside a
 * floating product image. Authors provide separate content and images for
 * desktop and mobile; CSS shows the matching pair per viewport. On mobile the
 * columns stack with the text first. Everything is authored in Universal
 * Editor via the block model — nothing is hard-coded here.
 *
 * @param {Element} block The pvr-inox-feature block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Delivered field order: desktop content, mobile content, desktop image,
  // mobile image. Content rows carry only text; image rows carry a picture.
  const imageRows = rows.filter((row) => row.querySelector('picture, img'));
  const contentRows = rows.filter((row) => !row.querySelector('picture, img'));

  const [desktopContentRow, mobileContentRow] = contentRows;
  const [desktopImageRow, mobileImageRow] = imageRows;

  const desktopText = buildText(desktopContentRow, 'desktop');
  const mobileText = buildText(mobileContentRow, 'mobile');
  const desktopMedia = buildMedia(desktopImageRow, 'desktop');
  const mobileMedia = buildMedia(mobileImageRow, 'mobile');

  block.replaceChildren();
  [desktopText, mobileText, desktopMedia, mobileMedia].forEach((el) => {
    if (el) block.append(el);
  });
}
