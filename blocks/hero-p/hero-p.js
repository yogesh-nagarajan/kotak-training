/**
 * loads and decorates the hero-p (prepaid/forex) banner
 * Replicates the Kotak owl-hero-banner: a full-width background image with
 * overlaid text content (heading, subtitle and a call-to-action button).
 *
 * Expected authored rows (xwalk model hero-p): desktop image, optional mobile
 * image, then the content rows — Title, Description and CTA. Image-only rows
 * become the responsive background; the remaining rows are flattened, in order,
 * into the overlaid .hero-p-content (Title → Description → CTA).
 * @param {Element} block The hero-p block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Rows whose only meaningful content is an image are background-image rows.
  const isImageRow = (row) => {
    const media = row.querySelector('picture, img');
    if (!media) return false;
    return !row.querySelector('h1, h2, h3, h4, h5, h6, p, a, ul, ol');
  };

  const imageRows = rows.filter(isImageRow);
  const contentRows = rows.filter((row) => !imageRows.includes(row));

  if (imageRows.length) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'hero-p-image';
    imageRows.forEach((row, index) => {
      const image = row.querySelector('picture, img');
      if (image) {
        image.classList.add(index === 0 ? 'hero-p-image-desktop' : 'hero-p-image-mobile');
        imageWrapper.append(image);
      }
      row.remove();
    });
    // if a single image was authored, it should always show
    if (imageWrapper.children.length === 1) {
      imageWrapper.firstElementChild.classList.remove('hero-p-image-desktop');
    }
    block.prepend(imageWrapper);
  }

  // The cta_newTab boolean renders as a standalone "true"/"false" text node in
  // the CTA cell (sibling to the link paragraph). Capture it from the raw rows
  // BEFORE flattening, which moves only element nodes and would drop the marker.
  const collectTextNodes = (root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n);
    return nodes;
  };
  const wantsNewTab = contentRows.some((row) => collectTextNodes(row)
    .some((n) => n.textContent.trim().toLowerCase() === 'true'
      && !n.parentElement.closest('a, h1, h2, h3, h4, h5, h6')));

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
      if (wantsNewTab) {
        cta.setAttribute('target', '_blank');
        cta.setAttribute('rel', 'noopener noreferrer');
      }
    }
    block.append(content);
  }
}
