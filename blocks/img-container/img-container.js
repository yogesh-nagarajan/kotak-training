/**
 * loads and decorates the img-container block
 * @param {Element} block The img-container block element
 */
export default function decorate(block) {
  // The block delivers rows: one with the authored text (heading + paragraph)
  // and one with the authored image. Order in the source is text then image.
  const rows = [...block.children];

  const imageRow = rows.find((row) => row.querySelector('picture, img'));
  const textRows = rows.filter((row) => row !== imageRow);

  // gather all authored text into a single positioned wrapper, flattening the
  // row/cell wrapper divs so the heading and paragraph sit directly inside
  // .img-container-text
  const text = document.createElement('div');
  text.className = 'img-container-text';
  textRows.forEach((row) => {
    [...row.children].forEach((cell) => {
      while (cell.firstElementChild) text.append(cell.firstElementChild);
    });
    row.remove();
  });

  // unwrap the image cell into a dedicated media wrapper
  const media = document.createElement('div');
  media.className = 'img-container-media';
  if (imageRow) {
    const image = imageRow.querySelector('picture, img');
    if (image) media.append(image);
    imageRow.remove();
  }

  // rebuild the block: text first, media second (CSS controls desktop order)
  block.replaceChildren();
  if (text.children.length) block.append(text);
  if (media.children.length) block.append(media);
}
