import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the hero-811-fd block
 *
 * A centred hero banner: eyebrow + heading + description + primary button +
 * secondary link stacked in the middle, with a card image floating on each side
 * (desktop). On mobile the side images are hidden and the content stays centred.
 *
 * Block structure (matches the model's fields, in order):
 *   Row 1: Content (richtext) - eyebrow (p), heading (h1), description (p),
 *          optional secondary line (p containing an <a>)
 *   Row 2: Primary button link (aem-content) + primary button text (text)
 *   Row 3: Left card image (image + alt)
 *   Row 4: Right card image (image + alt)
 *
 * @param {Element} block The hero-811-fd block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  const cellLink = (row) => (row ? row.querySelector('a') : null);
  const cellImg = (row) => (row ? row.querySelector('img') : null);
  const cellText = (row) => (row ? row.textContent.trim() : '');

  const contentRow = rows[0];
  const primaryHref = cellLink(rows[1]);
  const primaryText = rows[1] ? cellText(rows[1].lastElementChild) : '';
  const leftImg = cellImg(rows[2]);
  const rightImg = cellImg(rows[3]);

  // build a floating card-image column
  const buildMedia = (img, side, alt) => {
    const media = document.createElement('div');
    media.className = `hero-811-fd-media hero-811-fd-media-${side}`;
    if (img) {
      const pic = createOptimizedPicture(
        img.src,
        img.alt || alt || '',
        false,
        [{ width: '750' }],
      );
      moveInstrumentation(img, pic.querySelector('img'));
      media.append(pic);
    }
    return media;
  };

  // centred content column, built by classifying the richtext nodes
  const content = document.createElement('div');
  content.className = 'hero-811-fd-content';

  if (contentRow) {
    const nodes = [...contentRow.querySelectorAll(':scope > div > *, :scope > *')]
      .filter((el) => !el.matches('div') && el.textContent.trim());
    let eyebrowDone = false;
    nodes.forEach((el) => {
      if (/^H[1-6]$/.test(el.tagName)) {
        el.classList.add('hero-811-fd-heading');
        content.append(el);
      } else if (el.querySelector('a')) {
        el.classList.add('hero-811-fd-secondary');
        el.querySelector('a').classList.add('hero-811-fd-secondary-link');
        content.append(el);
      } else if (!eyebrowDone) {
        el.classList.add('hero-811-fd-eyebrow');
        content.append(el);
        eyebrowDone = true;
      } else {
        el.classList.add('hero-811-fd-description');
        content.append(el);
      }
    });
  }

  // primary CTA button, inserted after the description and before the secondary line
  if (primaryHref && primaryHref.getAttribute('href')) {
    const btn = document.createElement('a');
    btn.className = 'button hero-811-fd-cta';
    btn.href = primaryHref.getAttribute('href');
    btn.textContent = primaryText || primaryHref.textContent.trim();
    const secondary = content.querySelector('.hero-811-fd-secondary');
    if (secondary) content.insertBefore(btn, secondary);
    else content.append(btn);
  }

  // rebuild
  block.replaceChildren();
  block.append(buildMedia(leftImg, 'left', 'Credit card'));
  block.append(content);
  block.append(buildMedia(rightImg, 'right', 'Credit card'));
}
