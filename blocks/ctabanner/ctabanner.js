/**
 * loads and decorates the ctabanner — a full-bleed background image with
 * centered heading and a call-to-action button
 * @param {Element} block The ctabanner block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // the row containing the image is the background; the rest is text content
  const imageRow = rows.find((row) => row.querySelector('picture, img'));
  const contentRows = rows.filter((row) => row !== imageRow);

  if (imageRow) {
    imageRow.classList.add('ctabanner-image');
    const image = imageRow.querySelector('picture, img');
    if (image) imageRow.replaceChildren(image);
  }

  // flatten all text content into a single centered wrapper
  const content = document.createElement('div');
  content.className = 'ctabanner-content';
  contentRows.forEach((row) => {
    [...row.children].forEach((cell) => {
      while (cell.firstElementChild) content.append(cell.firstElementChild);
    });
    row.remove();
  });

  // style the last link as the primary call-to-action button
  const cta = content.querySelector('a');
  if (cta) {
    cta.classList.add('button');
    const wrapper = cta.closest('p');
    if (wrapper) wrapper.classList.add('button-container');
  }

  if (content.children.length) block.append(content);
}
