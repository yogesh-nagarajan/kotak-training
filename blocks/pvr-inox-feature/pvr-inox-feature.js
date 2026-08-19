import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the pvr-inox-feature block
 *
 * A two-column feature: a text column (heading + supporting text) beside a
 * floating product image. On mobile the columns stack with the text first.
 * All content is authored in Universal Editor via the block model
 * (heading, supporting text, image, image alt) — nothing is hard-coded here.
 *
 * @param {Element} block The pvr-inox-feature block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // The image field is delivered as a row containing a picture/img; the
  // remaining rows carry the heading (plain text) and supporting rich text.
  const imageRow = rows.find((row) => row.querySelector('picture, img'));
  const contentRows = rows.filter((row) => row !== imageRow);

  const text = document.createElement('div');
  text.className = 'pvr-inox-feature-text';

  // First content row is the heading (a plain-text field) — promote it to an
  // <h2> for correct semantics and styling. Remaining rows are supporting text.
  const [headingRow, ...supportingRows] = contentRows;

  const headingText = headingRow?.textContent.trim();
  if (headingText) {
    const heading = document.createElement('h2');
    heading.className = 'pvr-inox-feature-heading';
    heading.textContent = headingText;
    moveInstrumentation(headingRow, heading);
    text.append(heading);
  }

  // Supporting rich text: flatten the row/cell wrappers so the paragraphs sit
  // directly inside the text column.
  supportingRows.forEach((row) => {
    [...row.children].forEach((cell) => {
      while (cell.firstElementChild) text.append(cell.firstElementChild);
    });
  });

  // Image column: rebuild as an optimized, responsive picture. Preserve the
  // authored alt text and the authoring instrumentation for Universal Editor.
  const media = document.createElement('div');
  media.className = 'pvr-inox-feature-media';
  const img = imageRow?.querySelector('img');
  if (img) {
    const optimized = createOptimizedPicture(
      img.src,
      img.getAttribute('alt') || '',
      false,
      [{ width: '750' }, { width: '1200' }],
    );
    moveInstrumentation(img, optimized.querySelector('img'));
    media.append(optimized);
  }

  block.replaceChildren();
  if (text.children.length) block.append(text);
  if (media.children.length) block.append(media);
}
