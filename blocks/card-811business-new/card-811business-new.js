/**
 * loads and decorates the card-811business-new block
 *
 * Renders a two-column promo card: authored title + description on one side and
 * a rounded image on the other. Separate desktop and mobile images are swapped
 * by viewport.
 *
 * Layout:
 *   - Desktop (>= 900px): text left, image right, vertically centered
 *   - Mobile: image on top, then title, then description (stacked)
 *
 * Block structure (matches the model's fields, in order):
 *   Row 1: Title (text)
 *   Row 2: Description (text)
 *   Row 3: Desktop Image (image + alt)
 *   Row 4: Mobile Image (image + alt)
 *
 * Any field may be omitted; each case is handled gracefully.
 *
 * @param {Element} block The card-811business-new block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // split rows into those carrying an image and those carrying text
  const imageRows = rows.filter((row) => row.querySelector('picture, img'));
  const textRows = rows.filter((row) => !row.querySelector('picture, img'));

  // build the text column: first text row = title, the rest = description
  const text = document.createElement('div');
  text.className = 'card-811business-new-text';

  const [titleRow, ...descRows] = textRows;

  if (titleRow && titleRow.textContent.trim()) {
    const title = document.createElement('h2');
    title.className = 'card-811business-new-title';
    title.textContent = titleRow.textContent.trim();
    text.append(title);
  }

  descRows.forEach((row) => {
    // move existing block-level content (p/ul/ol) as-is, otherwise wrap plain
    // text into a paragraph
    const blocks = [...row.querySelectorAll(':scope > div > p, :scope > div > ul, :scope > div > ol, :scope > p, :scope > ul, :scope > ol')];
    if (blocks.length) {
      blocks.forEach((el) => {
        el.classList.add('card-811business-new-description');
        text.append(el);
      });
    } else if (row.textContent.trim()) {
      const p = document.createElement('p');
      p.className = 'card-811business-new-description';
      p.textContent = row.textContent.trim();
      text.append(p);
    }
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
