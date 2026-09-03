import { moveInstrumentation } from '../../scripts/scripts.js';

function isCardRow(row) {
  if (!row) return false;
  if (row.getAttribute('data-aue-model') === 'bento-item' || row.getAttribute('data-aue-type') === 'component') {
    return true;
  }
  const cols = [...row.children];
  if (!cols.length) return false;
  const firstText = cols[0].textContent.trim().toLowerCase();
  if (['featured', 'standard', 'compact', 'image-card', 'imagecard', 'media'].includes(firstText)) {
    return true;
  }
  if (row.querySelector('picture, img, a') || cols.length >= 3) {
    return true;
  }
  return false;
}

/**
 * Bento Grid Component for Adobe Edge Delivery Services (EDS)
 * Supports featured tall card, neutral standard tiles (with optional image), and compact tiles.
 * @param {Element} block The Bento block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const container = document.createElement('div');
  container.className = 'bento-container';

  let pretitleText = '';
  let pretitleRow = null;
  let titleText = '';
  let titleRow = null;
  let startIndex = 0;

  // Process header rows
  if (rows.length > 0 && !isCardRow(rows[0])) {
    const cols0 = [...rows[0].children];
    if (cols0.length === 2) {
      [pretitleRow, titleRow] = cols0;
      pretitleText = pretitleRow.textContent.trim();
      titleText = titleRow.textContent.trim();
      startIndex = 1;
    } else if (rows.length > 1 && !isCardRow(rows[1])) {
      [pretitleRow] = cols0;
      pretitleText = pretitleRow.textContent.trim();
      const cols1 = [...rows[1].children];
      [titleRow] = cols1;
      titleText = titleRow?.textContent.trim() || '';
      startIndex = 2;
    } else {
      [titleRow] = cols0;
      titleText = titleRow.textContent.trim();
      startIndex = 1;
    }
  }

  // Check explicit data-aue-prop attributes if present
  rows.forEach((r, idx) => {
    if (idx < 2) {
      if (r.getAttribute('data-aue-prop') === 'pretitle' || r.querySelector('[data-aue-prop="pretitle"]')) {
        pretitleText = r.textContent.trim();
        pretitleRow = r;
      }
      if (r.getAttribute('data-aue-prop') === 'title' || r.querySelector('[data-aue-prop="title"]')) {
        titleText = r.textContent.trim();
        titleRow = r;
      }
    }
  });

  if (pretitleText || titleText) {
    const header = document.createElement('header');
    header.className = 'bento-header';

    if (pretitleText) {
      const pretitle = document.createElement('span');
      pretitle.className = 'bento-pretitle';
      pretitle.textContent = pretitleText;
      if (pretitleRow) moveInstrumentation(pretitleRow, pretitle);
      header.append(pretitle);
    }

    if (titleText) {
      const title = document.createElement('h2');
      title.className = 'bento-title';
      title.textContent = titleText;
      if (titleRow) moveInstrumentation(titleRow, title);
      header.append(title);
    }

    container.append(header);
  }

  const grid = document.createElement('div');
  grid.className = 'bento-grid';

  // Process card rows
  for (let i = startIndex; i < rows.length; i += 1) {
    const row = rows[i];
    const cols = [...row.children];

    if (cols.length > 0) {
      const card = document.createElement('article');
      card.className = 'bento-card';
      moveInstrumentation(row, card);

      const picture = row.querySelector('picture');
      const link = row.querySelector('a');

      let variant = 'standard';
      let eyebrow = '';
      let title = '';
      let description = '';
      let ctaText = '';
      let linkUrl = link ? link.getAttribute('href') : '#';

      if (cols.length >= 3) {
        const firstColText = cols[0].textContent.trim().toLowerCase();
        if (['featured', 'standard', 'compact', 'image-card', 'imagecard', 'media'].includes(firstColText)) {
          variant = firstColText === 'media' || firstColText === 'image-card' || firstColText === 'imagecard' ? 'standard' : firstColText;
          eyebrow = cols[1] ? cols[1].textContent.trim() : '';
          title = cols[2] ? cols[2].textContent.trim() : '';
          const textCol = cols[3];
          if (textCol) {
            const a = textCol.querySelector('a');
            if (a) {
              linkUrl = a.getAttribute('href');
              ctaText = a.textContent.trim();
            }
            const pList = textCol.querySelectorAll('p');
            pList.forEach((p) => {
              if (!p.querySelector('a') && !description) {
                description = p.textContent.trim();
              }
            });
            if (!description && !a) {
              description = textCol.textContent.trim();
            }
          }
        } else {
          eyebrow = cols[0].textContent.trim();
          title = cols[1].textContent.trim();
          description = cols[2].textContent.trim();
          if (cols[3]) {
            const ctaLink = cols[3].querySelector('a');
            if (ctaLink) {
              linkUrl = ctaLink.getAttribute('href');
            }
            ctaText = cols[3].textContent.trim();
          }
        }
      } else if (cols.length === 2) {
        const [firstColumn, secondColumn] = cols;
        let textCol = secondColumn;

        if (picture && cols[0].contains(picture)) {
          textCol = secondColumn;
        } else if (picture && !cols[0].contains(picture)) {
          textCol = firstColumn;
        }

        const headings = textCol.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const paragraphs = textCol.querySelectorAll('p');
        if (headings.length > 0) {
          title = headings[0].textContent.trim();
        }
        paragraphs.forEach((p) => {
          if (p.querySelector('a')) {
            const a = p.querySelector('a');
            linkUrl = a.getAttribute('href');
            ctaText = a.textContent.trim();
          } else if (!title) {
            title = p.textContent.trim();
          } else if (!description) {
            description = p.textContent.trim();
          }
        });
      } else {
        const headings = cols[0].querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length > 0) {
          title = headings[0].textContent.trim();
        }
        const paragraphs = cols[0].querySelectorAll('p');
        paragraphs.forEach((p) => {
          if (p.querySelector('a')) {
            const a = p.querySelector('a');
            linkUrl = a.getAttribute('href');
            ctaText = a.textContent.trim();
          } else if (!title) {
            title = p.textContent.trim();
          } else if (!description) {
            description = p.textContent.trim();
          }
        });
      }

      card.classList.add(`bento-card-${variant}`);

      // If standard card contains a background image
      if (picture && variant === 'standard') {
        card.classList.add('bento-card-image-card');
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'bento-card-image';
        imgWrapper.append(picture);
        card.append(imgWrapper);
        const overlay = document.createElement('div');
        overlay.className = 'bento-card-overlay';
        card.append(overlay);
      }

      const content = document.createElement('div');
      content.className = 'bento-card-content';

      if (eyebrow) {
        const eb = document.createElement('span');
        eb.className = 'bento-card-eyebrow';
        eb.textContent = eyebrow;
        content.append(eb);
      }

      if (title) {
        const h3 = document.createElement('h3');
        h3.className = 'bento-card-heading';
        h3.textContent = title;
        content.append(h3);
      }

      if (description) {
        const desc = document.createElement('p');
        desc.className = 'bento-card-desc';
        desc.textContent = description;
        content.append(desc);
      }

      if (variant === 'featured') {
        if (picture) {
          const graphic = document.createElement('div');
          graphic.className = 'bento-card-graphic';
          graphic.append(picture);
          content.append(graphic);
        } else {
          const logo = document.createElement('div');
          logo.className = 'bento-card-logo';
          logo.textContent = '∞';
          content.append(logo);
        }

        const pillBtn = document.createElement('a');
        pillBtn.className = 'bento-pill-btn';
        pillBtn.href = linkUrl && linkUrl !== '#' ? linkUrl : '#';
        pillBtn.innerHTML = `<span class="bento-pill-icon" aria-hidden="true">☎</span><span>${ctaText || }</span>`;
        content.append(pillBtn);
      }

      card.append(content);

      if (variant !== 'featured') {
        const arrow = document.createElement('a');
        arrow.className = 'bento-card-arrow';
        arrow.href = linkUrl && linkUrl !== '#' ? linkUrl : '#';
        arrow.setAttribute('aria-label', `Open ${title || 'link'}`);
        arrow.textContent = '↗';
        card.append(arrow);

        if (linkUrl && linkUrl !== '#' && linkUrl !== '') {
          card.style.cursor = 'pointer';
          card.addEventListener('click', (e) => {
            if (!e.target.closest('a')) {
              window.location.href = linkUrl;
            }
          });
        }
      }

      grid.append(card);
    }
  }

  container.append(grid);
  block.textContent = '';
  block.append(container);
}
