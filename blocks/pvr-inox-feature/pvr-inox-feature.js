import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Builds one variant (text column + media column) from a grouped device row.
 *
 * Element grouping delivers all fields for a device in a single cell, in field
 * order: heading (plain text), description (rich text), image. The heading is
 * promoted to an <h2>; the image is rebuilt as an optimized responsive picture.
 *
 * @param {Element} row The delivered device row (desktop or mobile)
 * @param {string} variant 'desktop' or 'mobile'
 * @returns {{text: Element|null, media: Element|null}}
 */
function buildVariant(row, variant) {
  const cell = row?.firstElementChild;
  const result = { text: null, media: null };
  if (!cell) return result;

  const nodes = [...cell.children];

  // The image (picture/img) is the media; everything else is text content.
  const imageNode = nodes.find((el) => el.querySelector?.('picture, img') || el.matches?.('picture, img'));
  const textNodes = nodes.filter((el) => el !== imageNode);

  // Text column: first text node is the heading, the rest are the description.
  const text = document.createElement('div');
  text.className = `pvr-inox-feature-text pvr-inox-feature-text-${variant}`;

  const [headingNode, ...descriptionNodes] = textNodes;
  const headingText = headingNode?.textContent.trim();
  if (headingText) {
    const heading = document.createElement('h2');
    heading.className = 'pvr-inox-feature-heading';
    heading.textContent = headingText;
    moveInstrumentation(headingNode, heading);
    text.append(heading);
  }
  descriptionNodes.forEach((node) => text.append(node));
  if (text.children.length) result.text = text;

  // Media column: floating, optimized product image.
  const img = imageNode?.querySelector('img') || (imageNode?.matches?.('img') ? imageNode : null);
  if (img) {
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
    result.media = media;
  }

  return result;
}

/**
 * loads and decorates the pvr-inox-feature block
 *
 * A two-column feature: a text column (heading + description) beside a floating
 * product image. Authors provide separate heading, description and image for
 * desktop and mobile (grouped per device); CSS shows the matching set per
 * viewport. On mobile the columns stack with the text first. Everything is
 * authored in Universal Editor via the block model — nothing is hard-coded.
 *
 * @param {Element} block The pvr-inox-feature block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // The two device variants are delivered as grouped rows containing an image;
  // the optional "Image Position" select is delivered as a plain-text row.
  const deviceRows = rows.filter((row) => row.querySelector('picture, img'));
  const positionRow = rows.find((row) => !row.querySelector('picture, img'));
  const [desktopRow, mobileRow] = deviceRows;

  // Apply the image-position modifier. Default is image on the right; when the
  // author selects "left", flip the desktop column order via a modifier class.
  const imagePosition = positionRow?.textContent.trim().toLowerCase();
  if (imagePosition === 'left') {
    block.classList.add('pvr-inox-feature-image-left');
  }

  const desktop = buildVariant(desktopRow, 'desktop');
  const mobile = buildVariant(mobileRow, 'mobile');

  block.replaceChildren();
  [desktop.text, mobile.text, desktop.media, mobile.media].forEach((el) => {
    if (el) block.append(el);
  });
}
