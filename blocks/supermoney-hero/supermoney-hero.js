import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Merged hero + cards block.
 *
 * Authored structure (Universal Editor container + item model). The container
 * contributes one single-cell row per field, in this order:
 *   Row: Background Image  (picture only)          -> banner background (desktop)
 *   Row: Mobile Banner Image (picture only)          -> banner background (mobile)
 *   Row: Subtitle (text)                             -> eyebrow above the title
 *   Row: Title (text)                                -> banner H1
 *   Row: Description (richtext)                      -> banner subtext
 *   Row: CTA (link + link text)                      -> primary button
 * Each card item contributes a two-cell row: image cell + text cell.
 *
 * Banner rows are single-cell; card rows are two-cell. That distinction is how
 * the two are told apart — so banner text can never be mistaken for a card.
 *
 * @param {Element} block The supermoney-hero block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Cards are the two-cell rows (image cell + text cell). Everything else is a
  // single-cell banner field row.
  const cardRows = rows.filter((row) => row.children.length >= 2);
  const bannerRows = rows.filter((row) => row.children.length === 1);

  // Classify the single-cell banner rows by their content.
  const imageRows = [];
  let ctaRow = null;
  const textRows = [];
  bannerRows.forEach((row) => {
    const cell = row.firstElementChild;
    const hasPicture = cell.querySelector('picture, img');
    const text = cell.textContent.trim();
    const link = cell.querySelector('a');
    if (hasPicture && !text) {
      imageRows.push(row);
    } else if (link && link.textContent.trim() === text) {
      // Cell whose entire text is a single link => the CTA.
      ctaRow = row;
    } else if (text) {
      textRows.push(row);
    }
  });
  const [desktopImageRow, mobileImageRow] = imageRows;
  // Text rows follow model order: subtitle, title, description.
  const [subtitleRow, titleRow, descriptionRow] = textRows;

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

  const content = document.createElement('div');
  content.className = 'supermoney-hero-content';

  if (subtitleRow) {
    const subtitle = document.createElement('p');
    subtitle.className = 'supermoney-hero-subtitle';
    moveInstrumentation(subtitleRow.firstElementChild, subtitle);
    subtitle.textContent = subtitleRow.firstElementChild.textContent.trim();
    content.append(subtitle);
  }

  if (titleRow) {
    const title = document.createElement('h1');
    title.className = 'supermoney-hero-title';
    moveInstrumentation(titleRow.firstElementChild, title);
    title.textContent = titleRow.firstElementChild.textContent.trim();
    content.append(title);
  }

  if (descriptionRow) {
    const description = document.createElement('div');
    description.className = 'supermoney-hero-description';
    moveInstrumentation(descriptionRow.firstElementChild, description);
    const cell = descriptionRow.firstElementChild;
    while (cell.firstElementChild) description.append(cell.firstElementChild);
    if (!description.firstElementChild && cell.textContent.trim()) {
      description.textContent = cell.textContent.trim();
    }
    content.append(description);
  }

  if (ctaRow) {
    const cta = ctaRow.querySelector('a');
    if (cta) {
      cta.classList.add('button');
      const p = document.createElement('p');
      p.className = 'button-container';
      moveInstrumentation(ctaRow.firstElementChild, p);
      p.append(cta);
      content.append(p);
    }
  }

  if (content.childElementCount) banner.append(content);

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

  // Optimize card images.
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });

  block.replaceChildren(banner);
  if (cardRows.length) block.append(ul);
}
