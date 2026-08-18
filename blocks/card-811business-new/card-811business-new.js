/**
 * loads and decorates the card-811business-new block
 *
 * Renders a two-column promo card: authored title + description on one side and
 * a rounded image on the other. Separate desktop and mobile images are swapped
 * by viewport.
 *
 * Layout:
 *   - Desktop (>= 900px): text left, image right, vertically centered
 *   - Mobile: text on top (title, description), then image (stacked)
 *
 * Block structure (matches the model's fields, in order):
 *   Row 1: Title (text)
 *   Row 2: Description (text)
 *   Row 3: Desktop Image (image + alt)
 *   Row 4: Mobile Image (image + alt)
 *
 * Any field may be omitted; each case is handled gracefully. Existing authored
 * elements are moved (not recreated) so the block stays editable in the
 * Universal Editor.
 *
 * @param {Element} block The card-811business-new block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // split rows into those carrying an image and those carrying text
  const imageRows = rows.filter((row) => row.querySelector('picture, img'));
  const textRows = rows.filter((row) => !row.querySelector('picture, img'));

  // build the text column by MOVING the existing authored elements (preserves
  // any Universal Editor instrumentation), flattening the row/cell wrappers
  const text = document.createElement('div');
  text.className = 'card-811business-new-text';

  textRows.forEach((row, rowIndex) => {
    // first text row = title, everything after = description
    const cls = rowIndex === 0
      ? 'card-811business-new-title'
      : 'card-811business-new-description';
    [...row.children].forEach((cell) => {
      if (cell.firstElementChild) {
        // move existing authored elements (preserves UE instrumentation)
        while (cell.firstElementChild) {
          const el = cell.firstElementChild;
          el.classList.add(cls);
          text.append(el);
        }
      } else if (cell.textContent.trim()) {
        // bare text node: wrap it so it can be styled
        const p = document.createElement('p');
        p.className = cls;
        p.textContent = cell.textContent.trim();
        text.append(p);
      }
    });
  });

  // build the media column: first image = desktop, second = mobile
  const media = document.createElement('div');
  media.className = 'card-811business-new-media';

  const images = imageRows
    .map((row) => row.querySelector('picture, img'))
    .filter(Boolean);

  if (images.length === 1) {
    // single authored image: show it on all viewports
    media.append(images[0]);
  } else {
    if (images[0]) {
      images[0].classList.add('is-desktop');
      media.append(images[0]);
    }
    if (images[1]) {
      images[1].classList.add('is-mobile');
      media.append(images[1]);
    }
  }

  // rebuild the block: text first, media second (CSS controls viewport order)
  block.replaceChildren();
  if (text.children.length) block.append(text);
  if (media.children.length) block.append(media);
}
