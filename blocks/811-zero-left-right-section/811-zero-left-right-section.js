import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the 811 zero left/right section
 *
 * A responsive two-column section: an image on one side and content (title,
 * description, CTA) on the other. A "Reverse Layout" boolean swaps the sides.
 *
 * The model delivers one cell per field, in order:
 *   Row 1: Image (image + imageAlt)
 *   Row 2: Title (text)
 *   Row 3: Description (richtext)
 *   Row 4: CTA (aem-content link + label) — rendered as an anchor
 *   Row 5: Reverse Layout (boolean)
 *
 * @param {Element} block The 811-zero-left-right-section block element
 */
export default function decorate(block) {
  const [imageRow, titleRow, descriptionRow, ctaRow, reverseRow] = [...block.children];
  const cellOf = (row) => row?.firstElementChild || row;

  // --- image column ---------------------------------------------------------
  const imageCol = document.createElement('div');
  imageCol.className = 'zero-left-right-section-image';
  const srcImg = imageRow?.querySelector('img');
  if (srcImg) {
    const picture = createOptimizedPicture(
      srcImg.src,
      srcImg.getAttribute('alt') || '',
      false,
      [{ width: '750' }],
    );
    moveInstrumentation(srcImg, picture.querySelector('img'));
    imageCol.append(picture);
  }

  // --- content column -------------------------------------------------------
  const content = document.createElement('div');
  content.className = 'zero-left-right-section-content';

  // title
  const titleText = titleRow ? titleRow.textContent.trim() : '';
  if (titleText) {
    const title = document.createElement('h2');
    title.className = 'zero-left-right-section-title';
    title.textContent = titleText;
    moveInstrumentation(cellOf(titleRow), title);
    content.append(title);
  }

  // description (richtext) — keep authored nodes so instrumentation is preserved
  if (descriptionRow) {
    const descCell = cellOf(descriptionRow);
    const description = document.createElement('div');
    description.className = 'zero-left-right-section-description';
    moveInstrumentation(descCell, description);
    while (descCell.firstElementChild) description.append(descCell.firstElementChild);
    if (description.childNodes.length) content.append(description);
  }

  // CTA (link + label)
  const ctaAnchor = ctaRow?.querySelector('a');
  const href = ctaAnchor?.getAttribute('href');
  if (href) {
    const cta = document.createElement('a');
    cta.className = 'zero-left-right-section-cta button';
    cta.href = href;
    cta.textContent = ctaAnchor.textContent.trim() || href;
    const target = ctaAnchor.getAttribute('target');
    if (target && target !== 'undefined') cta.target = target;
    moveInstrumentation(ctaAnchor, cta);
    content.append(cta);
  }

  // --- reverse flag ---------------------------------------------------------
  const reverseFlag = reverseRow ? reverseRow.textContent.trim().toLowerCase() : '';
  const isReverse = reverseFlag === 'true' || reverseFlag === 'yes';

  // --- assemble -------------------------------------------------------------
  const container = document.createElement('div');
  container.className = 'zero-left-right-section-container';
  container.append(imageCol, content);

  block.classList.add('zero-left-right-section');
  if (isReverse) block.classList.add('zero-left-right-section-reverse');
  block.replaceChildren(container);
}
