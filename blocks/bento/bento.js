import { moveInstrumentation } from '../../scripts/scripts.js';

function isCardRow(row) {
  if (!row) return false;
  const model = row.getAttribute('data-aue-model');
  if (['bento-featured', 'bento-standard', 'bento-mini-standard', 'bento-compact', 'bento-item'].includes(model)
    || row.getAttribute('data-aue-type') === 'component') {
    return true;
  }
  const cols = [...row.children];
  if (!cols.length) return false;
  for (let i = 0; i < Math.min(cols.length, 2); i += 1) {
    const text = cols[i].textContent.trim().toLowerCase();
    if (['featured', 'standard', 'mini-standard', 'mini standard', 'compact', 'image-card', 'imagecard', 'media'].includes(text)) {
      return true;
    }
  }
  if (row.querySelector('picture, img, a') || cols.length >= 3) {
    return true;
  }
  return false;
}

function detectVariant(model, label, cols) {
  if (model === 'bento-featured') return 'featured';
  if (model === 'bento-standard') return 'standard';
  if (model === 'bento-mini-standard') return 'mini-standard';
  if (model === 'bento-compact') return 'compact';

  const cleanLabel = (label || '').toLowerCase();
  if (cleanLabel.includes('featured')) return 'featured';
  if (cleanLabel.includes('mini standard') || cleanLabel.includes('mini-standard')) return 'mini-standard';
  if (cleanLabel.includes('compact')) return 'compact';
  if (cleanLabel.includes('standard')) return 'standard';

  for (let i = 0; i < Math.min(cols.length, 2); i += 1) {
    const text = cols[i].textContent.trim().toLowerCase();
    if (text === 'featured') return 'featured';
    if (text === 'mini-standard' || text === 'mini standard') return 'mini-standard';
    if (text === 'compact') return 'compact';
    if (text === 'standard' || text === 'media' || text === 'image-card' || text === 'imagecard') return 'standard';
  }
  return 'standard';
}

/**
 * Bento Grid Component for Adobe Edge Delivery Services (EDS)
 * Supports:
 * - Featured card (100% height): eyebrow, title, description, bg image, cta icon, cta button
 * - Standard card (45% height): eyebrow, title, link, optional bg image (no description)
 * - Mini standard card (40% height): eyebrow, title, link, optional bg image (no description)
 * - Compact card (10% height): title, link only
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

  const cards = [];

  // Parse card rows
  for (let i = startIndex; i < rows.length; i += 1) {
    const row = rows[i];
    const cols = [...row.children];

    if (cols.length > 0) {
      // MUST read instrumentation BEFORE moveInstrumentation removes attributes from row
      const model = row.getAttribute('data-aue-model');
      const label = row.getAttribute('data-aue-label');
      const variant = detectVariant(model, label, cols);

      const card = document.createElement('article');
      card.className = 'bento-card';
      moveInstrumentation(row, card);

      const pictures = [...row.querySelectorAll('picture')];
      const link = row.querySelector('a');

      let eyebrow = '';
      let title = '';
      let description = '';
      let ctaText = '';
      let linkUrl = link ? link.getAttribute('href') : '';
      let bgPicture = null;
      let ctaIconPic = null;

      if (variant === 'featured') {
        if (model === 'bento-featured') {
          // Fields: [image, eyebrow, title, description, ctaIcon, ctaText, link]
          bgPicture = cols[0]?.querySelector('picture') || cols[0]?.querySelector('img');
          eyebrow = cols[1]?.textContent.trim() || '';
          title = cols[2]?.textContent.trim() || '';
          description = cols[3]?.textContent.trim() || '';
          ctaIconPic = cols[4]?.querySelector('picture') || cols[4]?.querySelector('img');
          ctaText = cols[5]?.textContent.trim() || '';
          const authoredLink = cols[6]?.textContent.trim() || cols[6]?.querySelector('a')?.getAttribute('href');
          if (authoredLink) linkUrl = authoredLink;
        } else {
          if (pictures.length > 0) {
            [bgPicture] = pictures;
            if (pictures.length > 1) [, ctaIconPic] = pictures;
          }
          const textCols = cols.filter((c) => !c.querySelector('picture, img') && c.textContent.trim());
          if (textCols.length > 0 && textCols[0].textContent.trim().toLowerCase() === 'featured') {
            textCols.shift();
          }
          if (textCols[0]) eyebrow = textCols[0].textContent.trim();
          if (textCols[1]) title = textCols[1].textContent.trim();
          if (textCols[2]) description = textCols[2].textContent.trim();
          if (textCols[3]) ctaText = textCols[3].textContent.trim();
          if (textCols[4] && !linkUrl) linkUrl = textCols[4].textContent.trim();
        }
      } else if (variant === 'compact') {
        // Compact card: title and link ONLY
        if (model === 'bento-compact') {
          title = cols[0]?.textContent.trim() || '';
          const authoredLink = cols[1]?.textContent.trim() || cols[1]?.querySelector('a')?.getAttribute('href');
          if (authoredLink) linkUrl = authoredLink;
        } else {
          const textCols = cols.filter((c) => c.textContent.trim());
          if (textCols.length > 0 && textCols[0].textContent.trim().toLowerCase() === 'compact') {
            textCols.shift();
          }
          if (textCols[0]) title = textCols[0].textContent.trim();
          if (textCols[1] && !linkUrl) linkUrl = textCols[1].textContent.trim();
        }
      } else if (model === 'bento-standard' || model === 'bento-mini-standard') {
        bgPicture = cols[0]?.querySelector('picture') || cols[0]?.querySelector('img');
        eyebrow = cols[1]?.textContent.trim() || '';
        title = cols[2]?.textContent.trim() || '';
        const authoredLink = cols[3]?.textContent.trim() || cols[3]?.querySelector('a')?.getAttribute('href');
        if (authoredLink) linkUrl = authoredLink;
      } else {
        if (pictures.length > 0) [bgPicture] = pictures;
        const textCols = cols.filter((c) => !c.querySelector('picture, img') && c.textContent.trim());
        if (textCols.length > 0 && ['standard', 'mini-standard', 'mini standard'].includes(textCols[0].textContent.trim().toLowerCase())) {
          textCols.shift();
        }
        if (textCols[0]) eyebrow = textCols[0].textContent.trim();
        if (textCols[1]) title = textCols[1].textContent.trim();
        if (textCols[2] && !linkUrl) linkUrl = textCols[2].textContent.trim();
      }

      card.classList.add(`bento-card-${variant}`);

      // Optional background image for featured, standard, and mini-standard
      if (bgPicture && variant !== 'compact') {
        card.classList.add('bento-card-image-card');
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'bento-card-image';
        imgWrapper.append(bgPicture);
        card.append(imgWrapper);
        const overlay = document.createElement('div');
        overlay.className = 'bento-card-overlay';
        card.append(overlay);
      }

      const content = document.createElement('div');
      content.className = 'bento-card-content';

      // Eyebrow (only for featured, standard, mini-standard - NOT compact)
      if (eyebrow && variant !== 'compact') {
        const eb = document.createElement('span');
        eb.className = 'bento-card-eyebrow';
        eb.textContent = eyebrow;
        content.append(eb);
      }

      // Title
      if (title) {
        const h3 = document.createElement('h3');
        h3.className = 'bento-card-heading';
        h3.textContent = title;
        content.append(h3);
      }

      // Description (ONLY for featured card!)
      if (variant === 'featured' && description) {
        const desc = document.createElement('p');
        desc.className = 'bento-card-desc';
        desc.textContent = description;
        content.append(desc);
      }

      // Featured card elements (Logo / CTA button)
      if (variant === 'featured') {
        if (!bgPicture) {
          const logo = document.createElement('div');
          logo.className = 'bento-card-logo';
          logo.textContent = '\u221E';
          content.append(logo);
        }

        const pillBtn = document.createElement('a');
        pillBtn.className = 'bento-pill-btn';
        pillBtn.href = linkUrl && linkUrl !== '#' ? linkUrl : '#';
        let iconHtml = '<span class="bento-pill-icon" aria-hidden="true">\u260E</span>';
        if (ctaIconPic) {
          iconHtml = `<span class="bento-pill-icon bento-pill-icon-custom">${ctaIconPic.outerHTML}</span>`;
        }
        pillBtn.innerHTML = `${iconHtml}<span>${ctaText || ''}</span>`;
        content.append(pillBtn);
      }

      card.append(content);

      // Slanting arrow for non-featured cards
      if (variant !== 'featured') {
        const arrow = document.createElement('a');
        arrow.className = 'bento-card-arrow';
        arrow.href = linkUrl && linkUrl !== '#' ? linkUrl : '#';
        arrow.setAttribute('aria-label', `Open ${title || 'link'}`);
        arrow.textContent = '\u2197';
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

      cards.push(card);
    }
  }

  // Organize cards into columns matching height proportions:
  // Featured = 100% capacity (1 col = 1 featured)
  // Standard = 45% capacity (1 col = 2 standard)
  // Mini standard = 40% capacity, Compact = 10% capacity (1 col = 2 mini standard + 1 compact)
  const columns = [];
  let currentCol = [];
  let currentCapacity = 0;

  cards.forEach((card) => {
    let cap = 45;
    if (card.classList.contains('bento-card-featured')) {
      cap = 100;
    } else if (card.classList.contains('bento-card-mini-standard')) {
      cap = 40;
    } else if (card.classList.contains('bento-card-compact')) {
      cap = 10;
    }

    if (currentCol.length > 0 && currentCapacity + cap > 100) {
      columns.push(currentCol);
      currentCol = [];
      currentCapacity = 0;
    }

    currentCol.push(card);
    currentCapacity += cap;

    if (currentCapacity >= 90) {
      columns.push(currentCol);
      currentCol = [];
      currentCapacity = 0;
    }
  });

  if (currentCol.length > 0) {
    columns.push(currentCol);
  }

  const grid = document.createElement('div');
  grid.className = 'bento-grid';

  columns.forEach((colCards) => {
    const colDiv = document.createElement('div');
    colDiv.className = 'bento-column';
    colCards.forEach((c) => colDiv.append(c));
    grid.append(colDiv);
  });

  container.append(grid);
  block.textContent = '';
  block.append(container);
}
