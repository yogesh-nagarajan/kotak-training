/*
 * Knowledge Hub block
 *
 * Two columns:
 *   Left  — a large featured story card: full-bleed image with an overlaid
 *           eyebrow, heading and "Read more" link at the bottom-left.
 *   Right — a white "Stories in focus" box: a list of story items (thumbnail +
 *           title link) with a "View all stories" link at the bottom.
 *
 * Authored structure — one row per item, two cells:
 *   row 1 (featured) -> cell 1 = <picture> image, cell 2 = <p> eyebrow,
 *                       <h3> heading, <a> read-more link
 *   rows 2..N (story)-> cell 1 = <picture> thumbnail, cell 2 = <a> title link
 *
 * @param {Element} block the knowledge-hub block element
 */

export default function decorate(block) {
  const rows = [...block.children];
  const [featuredRow, ...storyRows] = rows;

  // --- Left: featured card ---
  const featured = document.createElement('div');
  featured.className = 'knowledge-hub-featured';
  if (featuredRow) {
    const cells = [...featuredRow.children];
    const imageCell = cells.find((c) => c.querySelector('picture, img')) || cells[0];
    const textCell = cells.find((c) => c !== imageCell) || cells[1];

    if (imageCell) {
      imageCell.className = 'knowledge-hub-featured-image';
      const img = imageCell.querySelector('img');
      if (img) {
        if (!img.getAttribute('alt')) img.setAttribute('alt', '');
        if (!img.getAttribute('width')) img.setAttribute('width', '1200');
        if (!img.getAttribute('height')) img.setAttribute('height', '700');
        img.setAttribute('loading', 'lazy');
      }
      featured.append(imageCell);
    }
    if (textCell) {
      textCell.className = 'knowledge-hub-featured-content';
      // The lone read-more link is auto-decorated as a pill button; strip that.
      const link = textCell.querySelector('a');
      if (link) {
        link.classList.remove('button');
        const container = link.closest('.button-container');
        if (container) container.classList.remove('button-container');
        link.classList.add('knowledge-hub-readmore');
      }
      featured.append(textCell);
    }
  }

  // --- Right: stories box ---
  const stories = document.createElement('div');
  stories.className = 'knowledge-hub-stories';

  const heading = document.createElement('h3');
  heading.className = 'knowledge-hub-stories-title';
  heading.textContent = 'Stories in focus';
  stories.append(heading);

  const list = document.createElement('ul');
  list.className = 'knowledge-hub-stories-list';
  storyRows.forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture, img'));
    const textCell = cells.find((c) => c !== imageCell) || cells[cells.length - 1];

    const li = document.createElement('li');
    li.className = 'knowledge-hub-story';
    if (imageCell) {
      imageCell.className = 'knowledge-hub-story-thumb';
      const img = imageCell.querySelector('img');
      if (img) {
        if (!img.getAttribute('alt')) img.setAttribute('alt', '');
        if (!img.getAttribute('width')) img.setAttribute('width', '200');
        if (!img.getAttribute('height')) img.setAttribute('height', '150');
        img.setAttribute('loading', 'lazy');
      }
      li.append(imageCell);
    }
    if (textCell) {
      textCell.className = 'knowledge-hub-story-title';
      const link = textCell.querySelector('a');
      if (link) {
        link.classList.remove('button');
        const container = link.closest('.button-container');
        if (container) container.classList.remove('button-container');
      }
      li.append(textCell);
    }
    list.append(li);
  });
  stories.append(list);

  // "View all stories" link at the bottom
  const viewAll = document.createElement('a');
  viewAll.className = 'knowledge-hub-viewall';
  viewAll.href = '#';
  viewAll.textContent = 'View all stories';
  stories.append(viewAll);

  block.textContent = '';
  block.append(featured, stories);
}
