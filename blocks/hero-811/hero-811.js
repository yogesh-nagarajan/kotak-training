/*
 * Hero 811 block
 *
 * Full-black hero banner for the 811 metal-card homepage.
 *   Desktop: overlaid text on the LEFT, the card-art banner fills the right.
 *   Mobile:  a taller card-art banner with the text stacked above it (same
 *            black background), matching the source homepage.
 * The "Apply Now" CTA has an animated white border whose thick segment sweeps
 * left -> right -> left continuously (see hero-811.css).
 *
 * Authored structure — one row, two cells:
 *   cell 1 -> <picture> desktop banner, <picture> mobile banner (2nd optional)
 *   cell 2 -> <p> eyebrow, <h1> headline lines, <p><a> Apply Now CTA
 *
 * @param {Element} block the hero-811 block element
 */

export default function decorate(block) {
  const row = block.firstElementChild;
  const cells = row ? [...row.children] : [];
  const mediaCell = cells.find((c) => c.querySelector('picture, img')) || cells[0];
  const contentCell = cells.find((c) => c !== mediaCell) || cells[1];

  // --- Media: desktop + optional mobile banner ---
  if (mediaCell) {
    mediaCell.className = 'hero-811-media';
    const pics = [...mediaCell.querySelectorAll('picture')];
    const [desktopPic, mobilePic] = pics;
    if (desktopPic) {
      desktopPic.classList.add('hero-811-media-desktop');
      const img = desktopPic.querySelector('img');
      if (img) {
        if (!img.getAttribute('alt')) img.setAttribute('alt', '');
        if (!img.getAttribute('width')) img.setAttribute('width', '1600');
        if (!img.getAttribute('height')) img.setAttribute('height', '778');
        img.setAttribute('loading', 'eager');
        img.setAttribute('fetchpriority', 'high');
      }
    }
    if (mobilePic) {
      mobilePic.classList.add('hero-811-media-mobile');
      const img = mobilePic.querySelector('img');
      if (img) {
        if (!img.getAttribute('alt')) img.setAttribute('alt', '');
        if (!img.getAttribute('width')) img.setAttribute('width', '750');
        if (!img.getAttribute('height')) img.setAttribute('height', '524');
        img.setAttribute('loading', 'eager');
      }
    }
  }

  // --- Content: eyebrow + headline + animated CTA ---
  if (contentCell) {
    contentCell.className = 'hero-811-content';

    // eyebrow = first paragraph that is plain text (no link)
    const paras = [...contentCell.querySelectorAll('p')];
    const eyebrow = paras.find((p) => !p.querySelector('a') && p.textContent.trim());
    if (eyebrow) eyebrow.classList.add('hero-811-eyebrow');

    // CTA link -> animated-border button (strip the default pill chrome)
    const cta = contentCell.querySelector('a');
    if (cta) {
      cta.classList.remove('button');
      const container = cta.closest('.button-container');
      if (container) container.classList.remove('button-container');
      cta.classList.add('hero-811-cta');
    }
  }
}
