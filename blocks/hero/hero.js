/**
 * loads and decorates the hero
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  // The block delivers rows: typically one with the background image (a picture),
  // and one (or more) with the text content (eyebrow, heading, subtext, CTA).
  const rows = [...block.children];

  const imageRow = rows.find((row) => row.querySelector('picture, img'));
  const contentRows = rows.filter((row) => row !== imageRow);

  if (imageRow) {
    imageRow.classList.add('hero-image');
    // unwrap the image so it can be positioned as a full-bleed background
    const image = imageRow.querySelector('picture, img');
    if (image) imageRow.replaceChildren(image);
  }

  // gather all text content into a single positioned wrapper, flattening the
  // row/cell wrapper divs so headings, paragraphs and the CTA sit directly
  // inside .hero-content
  const content = document.createElement('div');
  content.className = 'hero-content';
  contentRows.forEach((row) => {
    [...row.children].forEach((cell) => {
      while (cell.firstElementChild) content.append(cell.firstElementChild);
    });
    row.remove();
  });

  if (content.children.length) {
    // style the last link as the primary call-to-action button
    const cta = content.querySelector('a');
    if (cta) {
      cta.classList.add('button');
      const wrapper = cta.closest('p');
      if (wrapper) wrapper.classList.add('button-container');
    }
    block.append(content);
  }
}
