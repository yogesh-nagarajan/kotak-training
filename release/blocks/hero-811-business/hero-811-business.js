/**
 * loads and decorates the hero-811-business block
 *
 * A hero banner: eyebrow + heading + description on the left, hero image on the
 * right (desktop). On mobile everything stacks and centres.
 *
 * Block structure (matches the model's fields, in order):
 *   Row 1: Eyebrow (text)
 *   Row 2: Heading (text)
 *   Row 3: Description (text)
 *   Row 4: Image (image + alt)
 *
 * Existing authored elements are moved (not recreated) so the block stays
 * editable in the Universal Editor.
 *
 * @param {Element} block The hero-811-business block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  const imageRow = rows.find((row) => row.querySelector('picture, img'));
  const textRows = rows.filter((row) => row !== imageRow);

  // build the text column by MOVING the existing authored elements (preserves
  // any Universal Editor instrumentation)
  const text = document.createElement('div');
  text.className = 'hero-811-business-text';

  textRows.forEach((row, rowIndex) => {
    // row 0 = eyebrow, row 1 = heading, row 2+ = description
    let cls = 'hero-811-business-description';
    if (rowIndex === 0) cls = 'hero-811-business-eyebrow';
    else if (rowIndex === 1) cls = 'hero-811-business-heading';

    [...row.children].forEach((cell) => {
      if (cell.firstElementChild) {
        while (cell.firstElementChild) {
          const el = cell.firstElementChild;
          el.classList.add(cls);
          text.append(el);
        }
      } else if (cell.textContent.trim()) {
        const p = document.createElement('p');
        p.className = cls;
        p.textContent = cell.textContent.trim();
        text.append(p);
      }
    });
  });

  // media column
  const media = document.createElement('div');
  media.className = 'hero-811-business-media';
  if (imageRow) {
    const image = imageRow.querySelector('picture, img');
    if (image) media.append(image);
  }

  // rebuild: text first, media second (CSS controls order)
  block.replaceChildren();
  if (text.children.length) block.append(text);
  if (media.children.length) block.append(media);
}
