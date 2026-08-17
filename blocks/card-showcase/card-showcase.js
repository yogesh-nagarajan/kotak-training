/**
 * Card Showcase block
 *
 * Combines a hero banner (eyebrow, heading, sub-heading and a call-to-action)
 * with a fanned, multi-layered card visual, and a strip of benefit cards that
 * overlap the bottom of the banner.
 *
 * Expected initial content structure (rows):
 *   1. Banner visual .... a single cell containing the fanned cards image
 *   2. Banner content ... a single cell with eyebrow, <h1>, sub-heading and CTA
 *   3..n Benefit card ... two cells: [ image ] [ heading + description ]
 *
 * The banner visual row is the first row that holds an image but no heading.
 * The banner content row is the row that holds the <h1>. Everything else is
 * treated as a benefit card.
 *
 * @param {Element} block The card-showcase block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // banner content = the row that owns the main heading
  const contentRow = rows.find((row) => row.querySelector('h1, h2'));
  // banner visual = first image-only row that is not the content row
  const visualRow = rows.find(
    (row) => row !== contentRow
      && row.querySelector('picture, img')
      && !row.querySelector('h1, h2, h3'),
  );
  // benefit cards = the remaining rows (each has an image + a text cell)
  const cardRows = rows.filter((row) => row !== contentRow && row !== visualRow);

  // ---- Banner ---------------------------------------------------------------
  const banner = document.createElement('div');
  banner.className = 'card-showcase-banner';

  // visual (fanned cards)
  const visual = document.createElement('div');
  visual.className = 'card-showcase-visual';
  if (visualRow) {
    const media = visualRow.querySelector('picture, img');
    if (media) visual.append(media);
  }

  // text content
  const content = document.createElement('div');
  content.className = 'card-showcase-content';
  if (contentRow) {
    [...contentRow.children].forEach((cell) => {
      while (cell.firstElementChild) content.append(cell.firstElementChild);
    });

    // style the call-to-action with the animated looping border
    const cta = content.querySelector('a');
    if (cta) {
      cta.classList.add('button', 'card-showcase-cta');
      const wrapper = cta.closest('p');
      if (wrapper) wrapper.classList.add('button-container');
    }
  }

  banner.append(visual, content);

  // ---- Benefit cards --------------------------------------------------------
  const cards = document.createElement('ul');
  cards.className = 'card-showcase-cards';

  cardRows.forEach((row) => {
    const li = document.createElement('li');
    li.className = 'card-showcase-card';
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture, img') && !cell.querySelector('h2, h3, h4, p')) {
        cell.className = 'card-showcase-card-icon';
      } else {
        cell.className = 'card-showcase-card-body';
      }
      li.append(cell);
    });
    cards.append(li);
  });

  block.replaceChildren(banner);
  if (cards.children.length) block.append(cards);
}
