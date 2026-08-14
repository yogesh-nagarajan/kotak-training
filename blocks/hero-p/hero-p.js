/**
 * loads and decorates the hero-p (prepaid/forex) banner
 * Replicates the Kotak owl-hero-banner: a full-width background image with
 * overlaid text content (heading, subtitle and a call-to-action button).
 * @param {Element} block The hero-p block element
 */
export default function decorate(block) {
  // The block delivers rows: one with the background image (a picture),
  // and one (or more) with the text content (heading, subtext, CTA).
  const rows = [...block.children];

  const imageRow = rows.find((row) => row.querySelector('picture, img'));
  const contentRows = rows.filter((row) => row !== imageRow);

  if (imageRow) {
    imageRow.classList.add('hero-p-image');
    // The image row may carry one or two images. When two are authored, the
    // first is the desktop banner and the second is the mobile banner; CSS
    // swaps them by viewport. With a single image it is used at all widths.
    const images = [...imageRow.querySelectorAll('picture, img')]
      .filter((el) => !(el.tagName === 'IMG' && el.closest('picture')));
    imageRow.replaceChildren(...images);
    if (images.length > 1) {
      images[0].classList.add('hero-p-image-desktop');
      images[1].classList.add('hero-p-image-mobile');
    }
  }

  // gather all text content into a single positioned wrapper, flattening the
  // row/cell wrapper divs so the heading, paragraphs and the CTA sit directly
  // inside .hero-p-content
  const content = document.createElement('div');
  content.className = 'hero-p-content';
  contentRows.forEach((row) => {
    [...row.children].forEach((cell) => {
      while (cell.firstElementChild) content.append(cell.firstElementChild);
    });
    row.remove();
  });

  if (content.children.length) {
    // style the call-to-action link as the primary button
    const cta = content.querySelector('a');
    if (cta) {
      cta.classList.add('button');
      const wrapper = cta.closest('p');
      if (wrapper) wrapper.classList.add('button-container');
    }
    block.append(content);
  }
}
