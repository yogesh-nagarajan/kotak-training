import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the hero-811-fd block
 *
 * A centred hero banner: eyebrow + heading + description + primary button +
 * secondary link stacked in the middle, with a card image floating on each side
 * (desktop). On mobile the side images are hidden and the content stays centred.
 *
 * Block structure (element grouping collapses the text fields into one cell):
 *   Row 1: Text group - eyebrow, heading, description, secondary line (in order)
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

  const textRow = rows[0];
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

  // centred content column, built from the grouped text cell. Fields arrive in
  // model order: eyebrow, heading, description, secondary line.
  const content = document.createElement('div');
  content.className = 'hero-811-fd-content';

  const textCell = textRow ? textRow.firstElementChild : null;
  if (textCell) {
    const nodes = [...textCell.children].filter((el) => el.textContent.trim());
    let idx = 0;
    nodes.forEach((el) => {
      const hasLink = !!el.querySelector('a');
      if (hasLink) {
        // secondary line, e.g. "Having 811 Account? Apply now"
        el.classList.add('hero-811-fd-secondary');
        el.querySelector('a').classList.add('hero-811-fd-secondary-link');
      } else if (idx === 0) {
        // eyebrow: promote to a small paragraph
        const p = document.createElement('p');
        p.className = 'hero-811-fd-eyebrow';
        p.textContent = el.textContent.trim();
        moveInstrumentation(el, p);
        el.replaceWith(p);
        idx += 1;
        content.append(p);
        return;
      } else if (idx === 1) {
        // heading: promote to an H1
        const h1 = document.createElement('h1');
        h1.className = 'hero-811-fd-heading';
        h1.textContent = el.textContent.trim();
        moveInstrumentation(el, h1);
        el.replaceWith(h1);
        idx += 1;
        content.append(h1);
        return;
      } else {
        el.classList.add('hero-811-fd-description');
      }
      idx += 1;
      content.append(el);
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
