/**
 * Bento Grid Component for Adobe Edge Delivery Services (EDS)
 * Supports featured tall cards, neutral standard tiles, media cards, and compact tiles.
 * @param {Element} block The Bento block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const container = document.createElement('div');
  container.className = 'bento__container';

  let startIndex = 0;
  let header = null;

  // Check if first row is a header (pretitle / title)
  const firstRowCols = [...rows[0].children];
  const firstRowText = firstRowCols.map((c) => c.textContent.trim()).filter(Boolean);

  if (firstRowCols.length === 1 || (firstRowCols.length <= 2 && !rows[0].querySelector('a, picture, img'))) {
    header = document.createElement('header');
    header.className = 'bento__header';

    if (firstRowCols.length === 2 && firstRowText.length === 2) {
      const pretitle = document.createElement('span');
      pretitle.className = 'bento__pretitle';
      pretitle.textContent = firstRowCols[0].textContent.trim();
      header.append(pretitle);

      const title = document.createElement('h2');
      title.className = 'bento__title';
      title.textContent = firstRowCols[1].textContent.trim();
      header.append(title);
    } else {
      const title = document.createElement('h2');
      title.className = 'bento__title';
      title.textContent = firstRowCols[0].textContent.trim();
      header.append(title);
    }
    startIndex = 1;
  }

  if (header) {
    container.append(header);
  }

  const grid = document.createElement('div');
  grid.className = 'bento__grid';

  // Process card rows
  for (let i = startIndex; i < rows.length; i += 1) {
    const row = rows[i];
    const cols = [...row.children];
    if (!cols.length) continue;

    const card = document.createElement('article');
    card.className = 'bento__card';

    const picture = row.querySelector('picture');
    const link = row.querySelector('a');

    let variant = 'standard';
    let eyebrow = '';
    let title = '';
    let description = '';
    let ctaText = '';
    let linkUrl = link ? link.getAttribute('href') : '#';

    // Multi-column authoring table: [variant, eyebrow, title, desc, link/cta, image]
    if (cols.length >= 3) {
      const firstColText = cols[0].textContent.trim().toLowerCase();
      if (['featured', 'standard', 'imagecard', 'image-card', 'compact', 'media'].includes(firstColText)) {
        variant = firstColText.replace('image-card', 'imageCard').replace('media', 'imageCard');
        eyebrow = cols[1] ? cols[1].textContent.trim() : '';
        title = cols[2] ? cols[2].textContent.trim() : '';
        description = cols[3] ? cols[3].textContent.trim() : '';
        if (cols[4]) {
          const ctaLink = cols[4].querySelector('a');
          ctaText = cols[4].textContent.trim();
          if (ctaLink) {
            linkUrl = ctaLink.getAttribute('href');
            ctaText = ctaLink.textContent.trim() || ctaText;
          }
        }
      } else {
        eyebrow = cols[0].textContent.trim();
        title = cols[1].textContent.trim();
        description = cols[2].textContent.trim();
        if (cols[3]) {
          const ctaLink = cols[3].querySelector('a');
          if (ctaLink) linkUrl = ctaLink.getAttribute('href');
          ctaText = cols[3].textContent.trim();
        }
      }
    } else if (cols.length === 2) {
      // 2 columns: [image/logo, text content]
      const textCol = picture ? (cols[0].contains(picture) ? cols[1] : cols[0]) : cols[1];
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
      // Single column container
      const headings = cols[0].querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length > 0) title = headings[0].textContent.trim();
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

    // Auto-detect imageCard variant if image is provided on a standard card
    if (picture && variant === 'standard') {
      variant = 'imageCard';
    }

    card.classList.add(`bento__card--${variant}`);

    // If media/imageCard variant
    if (variant === 'imageCard') {
      if (picture) {
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'bento__card-image';
        imgWrapper.append(picture);
        card.append(imgWrapper);
      }
      const overlay = document.createElement('div');
      overlay.className = 'bento__card-overlay';
      card.append(overlay);
    }

    // Build card content
    const content = document.createElement('div');
    content.className = 'bento__card-content';

    if (eyebrow) {
      const eb = document.createElement('span');
      eb.className = 'bento__card-eyebrow';
      eb.textContent = eyebrow;
      content.append(eb);
    }

    if (title) {
      const h3 = document.createElement('h3');
      h3.className = 'bento__card-heading';
      h3.textContent = title;
      content.append(h3);
    }

    if (description) {
      const desc = document.createElement('p');
      desc.className = 'bento__card-desc';
      desc.textContent = description;
      content.append(desc);
    }

    // Featured variant elements
    if (variant === 'featured') {
      if (picture) {
        const graphic = document.createElement('div');
        graphic.className = 'bento__card-graphic';
        graphic.append(picture);
        content.append(graphic);
      } else {
        const logo = document.createElement('div');
        logo.className = 'bento__card-logo';
        logo.textContent = '∞';
        content.append(logo);
      }

      if (linkUrl && linkUrl !== '#') {
        const pillBtn = document.createElement('a');
        pillBtn.className = 'bento__pill-btn';
        pillBtn.href = linkUrl;
        pillBtn.innerHTML = `<span class="bento__pill-icon" aria-hidden="true">☎</span><span>${ctaText || 'Explore now'}</span>`;
        content.append(pillBtn);
      }
    }

    card.append(content);

    // Action arrow for standard / compact / media cards
    if (variant !== 'featured' && linkUrl && linkUrl !== '#') {
      const arrow = document.createElement('a');
      arrow.className = 'bento__card-arrow';
      arrow.href = linkUrl;
      arrow.setAttribute('aria-label', `Open ${title || 'link'}`);
      arrow.textContent = '↗';
      card.append(arrow);

      // Make card clickable
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        if (!e.target.closest('a')) {
          window.location.href = linkUrl;
        }
      });
    }

    grid.append(card);
  }

  container.append(grid);
  block.textContent = '';
  block.append(container);
}
