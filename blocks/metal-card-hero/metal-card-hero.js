import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the metal-card-hero block.
 *
 * Renders the "Infinity Metal Debit Card" experience as a single block:
 *   1. A full-bleed banner hero (the authored image already carries the black
 *      backdrop, the fanned cards and any "T&C apply" text) with an eyebrow,
 *      heading and an "Apply Now" CTA (with a continuously sweeping white
 *      border highlight) overlaid on top.
 *   2. A row of benefit cards that OVERLAP the bottom of the hero. On tablet
 *      and mobile the cards become a horizontal, snap-scrolling track.
 *
 * The block owns no images itself — every image is authored in AEM. The code
 * classifies the delivered rows by their content (never by a fixed index) so
 * it stays resilient when a field is empty or the author reorders content:
 *   - hero content  : a row with a heading/anchor and no image
 *   - hero image    : a row with an image and no meaningful text
 *   - benefit card  : a row with an image AND text (title + description)
 *
 * @param {Element} block The metal-card-hero block element
 */

/** True when the row carries a picture or img. */
function hasImage(row) {
  return !!row.querySelector('picture, img');
}

/** True when the row carries heading or anchor content. */
function hasHeadingOrLink(row) {
  return !!row.querySelector('h1, h2, h3, h4, h5, h6, a');
}

/** Visible text of a row, ignoring image alt attributes. */
function rowText(row) {
  const clone = row.cloneNode(true);
  clone.querySelectorAll('picture, img').forEach((el) => el.remove());
  return clone.textContent.trim();
}

/**
 * Build a single benefit card from an authored row.
 * @param {Element} row The authored row (icon image + title + description)
 * @returns {Element} The decorated card element
 */
function buildCard(row) {
  const card = document.createElement('li');
  card.className = 'metal-card-hero-card';
  moveInstrumentation(row, card);

  const cells = [...row.children];
  const imageCell = cells.find((cell) => cell.querySelector('picture, img'));
  const textCells = cells.filter((cell) => cell !== imageCell && cell.textContent.trim());

  // icon / illustration
  const img = imageCell?.querySelector('img');
  if (img) {
    const icon = document.createElement('div');
    icon.className = 'metal-card-hero-card-icon';
    const alt = (img.getAttribute('alt') || '').trim();
    const src = img.getAttribute('src') || img.src;
    if (/\.svg(\?|$)/i.test(src)) {
      const svg = img.cloneNode(true);
      svg.loading = 'lazy';
      moveInstrumentation(img, svg);
      icon.append(svg);
    } else {
      const picture = createOptimizedPicture(src, alt, false, [{ width: '200' }]);
      moveInstrumentation(img, picture.querySelector('img'));
      icon.append(picture);
    }
    card.append(icon);
  }

  // first text cell = title, the rest = description
  textCells.forEach((cell, index) => {
    const cls = index === 0 ? 'metal-card-hero-card-title' : 'metal-card-hero-card-desc';
    if (cell.firstElementChild) {
      while (cell.firstElementChild) {
        const el = cell.firstElementChild;
        el.classList.add(cls);
        card.append(el);
      }
    } else {
      const el = document.createElement(index === 0 ? 'h3' : 'p');
      el.className = cls;
      el.textContent = cell.textContent.trim();
      card.append(el);
    }
  });

  return card;
}

export default function decorate(block) {
  const rows = [...block.children];

  // classify rows by content, not position
  const cardRows = [];
  const imageRows = [];
  let contentRow = null;

  rows.forEach((row) => {
    const image = hasImage(row);
    const text = rowText(row);
    if (image && text) {
      cardRows.push(row); // benefit card: image + title/description
    } else if (image) {
      imageRows.push(row); // fanned-cards hero banner image
    } else if (!contentRow && hasHeadingOrLink(row)) {
      contentRow = row; // hero eyebrow/heading/CTA
    }
    // any leftover text-only row (e.g. an authored "T&C apply") is ignored —
    // the disclaimer is already baked into the banner image
  });

  // ---- build the hero ----
  const hero = document.createElement('div');
  hero.className = 'metal-card-hero-hero';

  const content = document.createElement('div');
  content.className = 'metal-card-hero-content';
  if (contentRow) {
    [...contentRow.children].forEach((cell) => {
      while (cell.firstElementChild) content.append(cell.firstElementChild);
    });
  }

  // the first paragraph acts as the eyebrow above the heading
  const eyebrow = content.querySelector('p');
  if (eyebrow) eyebrow.classList.add('metal-card-hero-eyebrow');

  // style the CTA link as the sweeping-border button
  const cta = content.querySelector('a');
  if (cta) {
    cta.classList.add('button', 'metal-card-hero-cta');
    const wrapper = cta.closest('p');
    if (wrapper) wrapper.classList.add('button-container');
  }
  hero.append(content);

  // fanned-cards image (first hero image row)
  const heroImg = imageRows[0]?.querySelector('img');
  if (heroImg) {
    const media = document.createElement('div');
    media.className = 'metal-card-hero-media';
    const alt = (heroImg.getAttribute('alt') || '').trim();
    const picture = createOptimizedPicture(
      heroImg.getAttribute('src') || heroImg.src,
      alt,
      true,
      [{ width: '1200' }],
    );
    moveInstrumentation(heroImg, picture.querySelector('img'));
    media.append(picture);
    hero.append(media);
  }

  // ---- build the overlapping benefit cards ----
  const cardsWrap = document.createElement('div');
  cardsWrap.className = 'metal-card-hero-cards';
  const track = document.createElement('ul');
  track.className = 'metal-card-hero-track';
  track.setAttribute('role', 'list');
  track.setAttribute('aria-label', 'Card benefits');
  cardRows.forEach((row) => track.append(buildCard(row)));
  cardsWrap.append(track);

  // rebuild the block
  block.textContent = '';
  block.append(hero);
  if (cardRows.length) block.append(cardsWrap);
}
