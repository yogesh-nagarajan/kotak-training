/**
 * loads and decorates the 811 zero-balance hero section
 * Replicates the Kotak811 "Zero balance digital savings account" hero: a
 * full-bleed background banner (desktop + mobile variants swapped by viewport)
 * with centered text content (eyebrow, heading, subtext and a call-to-action).
 *
 * Block structure (matches the model's 3 field-groups):
 *   Row 1: Desktop Image (image + imageAlt) — may be empty
 *   Row 2: Mobile Image  (imageMobile + imageMobileAlt) — may be empty
 *   Row 3: Text (eyebrow, heading, subtext, CTA)
 * A single authored image (one image row) or two images in one row are also
 * handled gracefully.
 *
 * @param {Element} block The 811-zero-hero-section block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // The text row is the one carrying headings/paragraphs/links. Everything
  // else is an image slot (desktop first, mobile second).
  const contentRow = rows.find(
    (row) => row.querySelector('h1, h2, h3, h4, h5, h6, p, a'),
  );
  const imageRows = rows.filter((row) => row !== contentRow);

  // Collect every banner image across the image rows in document order,
  // skipping the redundant <img> inside a <picture>. Empty image cells simply
  // contribute nothing.
  const images = imageRows
    .flatMap((row) => [...row.querySelectorAll('picture, img')])
    .filter((el) => !(el.tagName === 'IMG' && el.closest('picture')));

  // remove the raw image rows; the images are re-hosted in a single container
  imageRows.forEach((row) => row.remove());

  if (images.length) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'zero-hero-image';
    // first image = desktop banner, second = mobile banner
    if (images[0]) images[0].classList.add('zero-hero-image-desktop');
    if (images[1]) images[1].classList.add('zero-hero-image-mobile');
    images.forEach((img) => imageContainer.append(img));
    block.prepend(imageContainer);
  }

  // gather the text content into a single centered wrapper, flattening the
  // row/cell wrapper divs so the eyebrow, heading, subtext and CTA sit
  // directly inside .zero-hero-content
  const content = document.createElement('div');
  content.className = 'zero-hero-content';
  if (contentRow) {
    [...contentRow.children].forEach((cell) => {
      while (cell.firstElementChild) content.append(cell.firstElementChild);
    });
    contentRow.remove();
  }

  // the first paragraph acts as the eyebrow/sub-title above the heading
  const eyebrow = content.querySelector('p');
  if (eyebrow && eyebrow.parentElement === content) {
    eyebrow.classList.add('zero-hero-eyebrow');
  }

  if (content.children.length) {
    // style the call-to-action link as the primary button and ensure it opens
    // in a new tab safely
    const cta = content.querySelector('a');
    if (cta) {
      cta.classList.add('button');
      cta.setAttribute('target', '_blank');
      cta.setAttribute('rel', 'noopener noreferrer');
      const wrapper = cta.closest('p');
      if (wrapper) wrapper.classList.add('button-container');
    }
    block.append(content);
  }

  // opt into the project's AOS fade-in if it is available, without adding or
  // modifying any global AOS implementation. The scoped CSS below provides a
  // graceful fade-in fallback when AOS is not present.
  if (!block.hasAttribute('data-aos')) {
    block.setAttribute('data-aos', 'fade-in');
    block.setAttribute('data-aos-delay', '100');
  }
}
