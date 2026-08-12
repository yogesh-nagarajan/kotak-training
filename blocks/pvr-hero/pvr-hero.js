import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the pvr-hero block
 *
 * Authored rows (model order):
 *   1. eyebrow    (text)
 *   2. text       (richtext) — H1 heading followed by the description paragraph(s)
 *   3. button     (link)
 *   4. buttonText (text)
 *   5. image      (reference)
 *   6. imageAlt   (text)
 *
 * Every field is optional; the block only renders the parts that were authored.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const [eyebrowRow, textRow, buttonRow, buttonTextRow, imageRow, imageAltRow] = rows;
  const cellOf = (row) => row?.firstElementChild;

  // --- Content column ---
  const content = document.createElement('div');
  content.className = 'pvr-hero-content';

  const eyebrowText = cellOf(eyebrowRow)?.textContent.trim();
  if (eyebrowText) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'pvr-hero-eyebrow';
    eyebrow.textContent = eyebrowText;
    if (eyebrowRow) moveInstrumentation(eyebrowRow, eyebrow);
    content.append(eyebrow);
  }

  // rich text: first heading is the title, remaining paragraphs are the description
  const textCell = cellOf(textRow);
  if (textCell && textCell.textContent.trim()) {
    if (textRow) moveInstrumentation(textRow, content);
    const heading = textCell.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) heading.classList.add('pvr-hero-title');
    const description = document.createElement('div');
    description.className = 'pvr-hero-description';
    [...textCell.children].forEach((el) => {
      if (el === heading) {
        content.append(el);
      } else {
        description.append(el);
      }
    });
    if (description.childElementCount) content.append(description);
  }

  // call-to-action (link + label)
  const linkAnchor = cellOf(buttonRow)?.querySelector('a');
  const buttonLink = linkAnchor?.getAttribute('href') || cellOf(buttonRow)?.textContent.trim();
  const buttonText = (cellOf(buttonTextRow)?.textContent || linkAnchor?.textContent || '').trim();
  if (buttonLink && buttonText) {
    const cta = document.createElement('a');
    cta.className = 'button primary pvr-hero-button';
    cta.href = buttonLink;
    cta.textContent = buttonText;
    const target = linkAnchor?.getAttribute('target');
    if (target && target !== 'undefined') cta.target = target;
    if (buttonRow) moveInstrumentation(buttonRow, cta);
    content.append(cta);
  }

  // --- Media column ---
  const media = document.createElement('div');
  media.className = 'pvr-hero-media';

  const imageCell = cellOf(imageRow);
  const imageAlt = cellOf(imageAltRow)?.textContent.trim();
  if (imageCell) {
    let picture = imageCell.querySelector('picture');
    const img = imageCell.querySelector('img');
    if (!picture && img) {
      picture = document.createElement('picture');
      picture.append(img);
    }
    if (picture) {
      const finalImg = picture.querySelector('img');
      if (finalImg) {
        if (imageAlt) finalImg.alt = imageAlt;
        // Hero image is above the fold — prioritise it for LCP.
        finalImg.loading = 'eager';
        finalImg.setAttribute('fetchpriority', 'high');
      }
      if (imageRow) moveInstrumentation(imageRow, media);
      media.append(picture);
    }
  }

  block.textContent = '';
  block.append(content);
  if (media.childElementCount) block.append(media);
}
