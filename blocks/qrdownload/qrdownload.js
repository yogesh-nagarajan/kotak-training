/**
 * loads and decorates the qrdownload — a dark card with a centered QR image
 * and heading text
 * @param {Element} block The qrdownload block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  const imageRow = rows.find((row) => row.querySelector('picture, img'));
  const contentRows = rows.filter((row) => row !== imageRow);

  const inner = document.createElement('div');
  inner.className = 'qrdownload-inner';

  // QR image
  if (imageRow) {
    const image = imageRow.querySelector('picture, img');
    if (image) {
      const media = document.createElement('div');
      media.className = 'qrdownload-qr';
      media.append(image);
      inner.append(media);
    }
  }

  // text content
  const content = document.createElement('div');
  content.className = 'qrdownload-content';
  contentRows.forEach((row) => {
    [...row.children].forEach((cell) => {
      while (cell.firstElementChild) content.append(cell.firstElementChild);
    });
  });
  if (content.children.length) inner.append(content);

  block.textContent = '';
  block.append(inner);
}
