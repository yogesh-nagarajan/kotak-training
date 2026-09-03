function extractImage(col) {
  if (!col) return null;
  const picture = col.querySelector('picture');
  if (picture) return picture;
  const img = col.querySelector('img');
  if (img) return img;
  const a = col.querySelector('a');
  if (a && /\.(jpeg|jpg|png|gif|webp|svg)(\?.*)?$/i.test(a.href)) {
    const newImg = document.createElement('img');
    newImg.src = a.href;
    newImg.alt = a.textContent.trim() || 'Card image';
    return newImg;
  }
  return null;
}

function extractButton(cols) {
  let buttonText = '';
  let buttonLink = '';

  const [,,, col3, col4] = cols;

  if (col4) {
    const col3Link = col3?.querySelector('a');
    const col4Link = col4?.querySelector('a');
    const col3Text = col3?.textContent?.trim() || '';
    const col4Text = col4?.textContent?.trim() || '';

    if (col4Link) {
      buttonLink = col4Link.getAttribute('href') || col4Link.href || '';
      buttonText = col3Text || col4Link.textContent.trim();
    } else if (col3Link) {
      buttonLink = col3Link.getAttribute('href') || col3Link.href || '';
      buttonText = col4Text || col3Link.textContent.trim();
    } else {
      const isCol4Url = /^(https?:\/\/|\/|#)/i.test(col4Text);
      const isCol3Url = /^(https?:\/\/|\/|#)/i.test(col3Text);

      if (isCol4Url && !isCol3Url) {
        buttonLink = col4Text;
        buttonText = col3Text;
      } else if (isCol3Url && !isCol4Url) {
        buttonLink = col3Text;
        buttonText = col4Text;
      } else {
        buttonText = col3Text;
        buttonLink = col4Text;
      }
    }
  } else if (col3) {
    const linkEl = col3.querySelector('a');
    if (linkEl) {
      buttonLink = linkEl.getAttribute('href') || linkEl.href || '';
      buttonText = linkEl.textContent.trim() || col3.textContent.trim();
    } else {
      const lines = col3.textContent.trim().split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length > 1) {
        if (/^(https?:\/\/|\/|#)/i.test(lines[1])) {
          [buttonText, buttonLink] = lines;
        } else if (/^(https?:\/\/|\/|#)/i.test(lines[0])) {
          [buttonLink, buttonText] = lines;
        } else {
          [buttonText, buttonLink] = lines;
        }
      } else {
        buttonText = col3.textContent.trim();
      }
    }
  }

  return {
    text: buttonText,
    link: buttonLink || '#',
  };
}

function createCard(imageEl, titleText, descContent, buttonText, buttonLink) {
  const card = document.createElement('div');
  card.className = 'carouselcard-item';

  const bgWrapper = document.createElement('div');
  bgWrapper.className = 'card-background';
  if (imageEl) {
    bgWrapper.appendChild(imageEl);
  }
  card.appendChild(bgWrapper);

  const contentDiv = document.createElement('div');
  contentDiv.className = 'card-content';

  if (titleText) {
    const h3 = document.createElement('h3');
    h3.className = 'card-title';
    h3.textContent = titleText;
    contentDiv.appendChild(h3);
  }

  if (descContent) {
    const descDiv = document.createElement('div');
    descDiv.className = 'card-description';
    if (typeof descContent === 'string' && descContent.trim()) {
      descDiv.innerHTML = descContent;
      contentDiv.appendChild(descDiv);
    } else if (descContent.innerHTML && descContent.innerHTML.trim()) {
      descDiv.innerHTML = descContent.innerHTML;
      contentDiv.appendChild(descDiv);
    }
  }

  if (buttonText) {
    const a = document.createElement('a');
    a.className = 'card-btn';
    a.href = buttonLink || '#';
    a.textContent = buttonText;
    contentDiv.appendChild(a);
  }

  card.appendChild(contentDiv);
  return card;
}

export default function decorate(block) {
  block.classList.add('carouselcard');
  const rows = [...block.children];

  const container = document.createElement('div');
  container.className = 'carouselcard-container';

  const rowHasImage = (row) => !!row?.querySelector('picture, img, svg');

  let headerRow = null;
  let cardRows = [];

  if (rows.length > 0) {
    if (rowHasImage(rows[0])) {
      cardRows = rows;
    } else {
      [headerRow] = rows;
      cardRows = rows.slice(1);
    }
  }

  // 1. Header & Navigation Tabs (Rendered strictly from authored content)
  const headerDivs = headerRow ? [...headerRow.children] : [];
  const [pretitleDiv, titleDiv, descDiv, tabsDiv] = headerDivs;
  const pretitleText = pretitleDiv?.textContent?.trim();
  const titleText = titleDiv?.textContent?.trim();
  const descHasContent = descDiv && (descDiv.innerHTML.trim() || descDiv.textContent.trim());
  const tabsRaw = tabsDiv?.textContent?.trim();

  const hasHeaderContent = pretitleText || titleText || descHasContent || tabsRaw;

  if (hasHeaderContent) {
    const headerDiv = document.createElement('div');
    headerDiv.className = 'carouselcard-header';

    const textContentDiv = document.createElement('div');
    textContentDiv.className = 'carouselcard-text-content';

    if (pretitleText) {
      const pretitle = document.createElement('span');
      pretitle.className = 'carouselcard-pretitle';
      pretitle.textContent = pretitleText;
      textContentDiv.appendChild(pretitle);
    }

    if (titleText) {
      const title = document.createElement('h2');
      title.className = 'carouselcard-title';
      title.textContent = titleText;
      textContentDiv.appendChild(title);
    }

    if (descHasContent) {
      const desc = document.createElement('div');
      desc.className = 'carouselcard-description';
      if (descDiv.firstElementChild) {
        desc.innerHTML = descDiv.innerHTML;
      } else {
        desc.textContent = descDiv.textContent.trim();
      }
      textContentDiv.appendChild(desc);
    }

    headerDiv.appendChild(textContentDiv);

    const actionsWrapper = document.createElement('div');
    actionsWrapper.className = 'carouselcard-actions';

    if (tabsRaw) {
      let tabList = [];
      if (tabsRaw.includes('|')) {
        tabList = tabsRaw.split('|').map((t) => t.trim()).filter(Boolean);
      } else if (tabsRaw.includes(',')) {
        tabList = tabsRaw.split(',').map((t) => t.trim()).filter(Boolean);
      } else {
        tabList = [tabsRaw];
      }

      const tabsWrapper = document.createElement('div');
      tabsWrapper.className = 'carouselcard-tabs';
      tabList.forEach((tabName, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = index === 0 ? 'tab-btn active' : 'tab-btn';
        button.textContent = tabName;
        button.addEventListener('click', () => {
          tabsWrapper.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));
          button.classList.add('active');
        });
        tabsWrapper.appendChild(button);
      });
      actionsWrapper.appendChild(tabsWrapper);
    }

    headerDiv.appendChild(actionsWrapper);
    container.appendChild(headerDiv);
  }

  // 2. Carousel Cards Track (Rendered strictly from authored rows)
  const track = document.createElement('div');
  track.className = 'carouselcard-track';

  const parsedCards = cardRows.map((itemRow) => {
    const cols = [...itemRow.children];
    let imageCol = null;
    const nonImageCols = [];

    cols.forEach((col) => {
      if (!imageCol && col.querySelector('picture, img, svg')) {
        imageCol = col;
      } else {
        nonImageCols.push(col);
      }
    });

    const imageEl = imageCol ? extractImage(imageCol) : null;
    const cardTitle = nonImageCols[0]?.textContent?.trim() || '';
    const descCol = nonImageCols[1];

    const buttonCols = [null, null, null, nonImageCols[2], nonImageCols[3]];
    const { text: buttonText, link: buttonLink } = extractButton(buttonCols);

    return {
      imageEl,
      title: cardTitle,
      description: descCol || '',
      buttonText,
      buttonLink,
    };
  }).filter((card) => {
    const hasDescText = card.description?.textContent?.trim()
      || (typeof card.description === 'string' && card.description.trim());
    return card.imageEl || card.title || hasDescText;
  });

  parsedCards.forEach((c) => {
    const cardEl = createCard(c.imageEl, c.title, c.description, c.buttonText, c.buttonLink);
    track.appendChild(cardEl);
  });

  // Navigation Arrows (rendered if there are multiple cards to slide)
  if (parsedCards.length > 1) {
    let actionsWrapper = container.querySelector('.carouselcard-actions');
    if (!actionsWrapper) {
      let headerDiv = container.querySelector('.carouselcard-header');
      if (!headerDiv) {
        headerDiv = document.createElement('div');
        headerDiv.className = 'carouselcard-header';
        container.prepend(headerDiv);
      }
      actionsWrapper = document.createElement('div');
      actionsWrapper.className = 'carouselcard-actions';
      headerDiv.appendChild(actionsWrapper);
    }

    const controlsWrapper = document.createElement('div');
    controlsWrapper.className = 'carouselcard-controls';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'carousel-nav-btn prev';
    prevBtn.setAttribute('aria-label', 'Previous cards');
    prevBtn.innerHTML = '&#8249;';

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'carousel-nav-btn next';
    nextBtn.setAttribute('aria-label', 'Next cards');
    nextBtn.innerHTML = '&#8250;';

    const scrollStep = 300;
    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -scrollStep, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: scrollStep, behavior: 'smooth' });
    });

    const updateArrows = () => {
      prevBtn.disabled = track.scrollLeft <= 10;
      nextBtn.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
    };

    track.addEventListener('scroll', updateArrows);
    setTimeout(updateArrows, 150);

    controlsWrapper.appendChild(prevBtn);
    controlsWrapper.appendChild(nextBtn);
    actionsWrapper.appendChild(controlsWrapper);
  }

  container.appendChild(track);
  block.replaceChildren(container);
}
