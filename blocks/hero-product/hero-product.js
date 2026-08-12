/**
 * Hero Product block
 *
 * Authored structure (2 rows):
 *   row 1 -> cell -> <picture> full-bleed background photo
 *   row 2 -> cell -> <p> eyebrow, <h1> headline, <p><picture> product card
 *
 * Decorated structure (regrouped for the overlay design):
 *   .hero-product-banner
 *     .hero-product-media    -> background photo
 *     .hero-product-content  -> eyebrow + headline overlaid on the photo
 *   .hero-product-card       -> product card image, centred, overlapping the
 *                               blue band below the banner
 *
 * @param {Element} block the hero-product block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const imageRow = rows[0];
  const textRow = rows[1];

  const photo = imageRow?.querySelector('picture');
  const textCell = textRow?.querySelector(':scope > div') || textRow;
  const heading = textCell?.querySelector('h1');
  const card = textCell?.querySelector('picture');
  const eyebrow = textCell
    ? [...textCell.querySelectorAll('p')].find(
      (p) => !p.querySelector('picture') && p.textContent.trim(),
    )
    : null;

  // --- Banner: photo + overlaid text ---
  const banner = document.createElement('div');
  banner.className = 'hero-product-banner';

  const media = document.createElement('div');
  media.className = 'hero-product-media';
  if (photo) {
    // decorative background photo
    const img = photo.querySelector('img');
    if (img && !img.getAttribute('alt')) img.setAttribute('alt', '');
    media.append(photo);
  }
  banner.append(media);

  const content = document.createElement('div');
  content.className = 'hero-product-content';
  if (eyebrow) {
    eyebrow.classList.add('hero-product-eyebrow');
    content.append(eyebrow);
  }
  if (heading) content.append(heading);
  banner.append(content);

  // --- Product card image ---
  const cardWrap = document.createElement('div');
  cardWrap.className = 'hero-product-card';
  if (card) {
    const cardImg = card.querySelector('img');
    if (cardImg && !cardImg.getAttribute('alt')) {
      cardImg.setAttribute('alt', eyebrow ? eyebrow.textContent.trim() : 'Credit card');
    }
    cardWrap.append(card);
  }

  block.textContent = '';
  block.append(banner);
  if (card) block.append(cardWrap);
}
