/**
 * Moves instrumentation attributes from a source element to a target element.
 * @param {Element} from Source element
 * @param {Element} to Target element
 */
function moveInstrumentation(from, to) {
  if (!from || !to || !from.attributes) return;
  [...from.attributes].forEach((attr) => {
    if (attr.name.startsWith('data-aue-') || attr.name.startsWith('data-richtext-')) {
      to.setAttribute(attr.name, attr.value);
      from.removeAttribute(attr.name);
    }
  });
}

/**
 * Gets trimmed text content from a table row.
 * @param {Element} row
 * @returns {string}
 */
function getRowValue(row) {
  return row?.textContent?.trim() || '';
}

/**
 * Extracts picture, img or image link from a row.
 * @param {Element} row
 * @returns {Element|null}
 */
function getRowPicture(row) {
  if (!row) return null;
  const pic = row.querySelector('picture');
  if (pic) {
    const img = pic.querySelector('img');
    const src = img?.getAttribute('src') || '';
    if (!src || src === '#' || src.trim() === '') return null;
    return pic;
  }
  const img = row.querySelector('img');
  if (img) {
    const src = img.getAttribute('src') || '';
    if (!src || src === '#' || src.trim() === '') return null;
    return img;
  }
  const a = row.querySelector('a');
  if (a && /\.(png|jpe?g|svg|webp|gif)(\?.*)?$/i.test(a.href)) {
    const imgEl = document.createElement('img');
    imgEl.src = a.href;
    imgEl.alt = a.textContent?.trim() || '';
    return imgEl;
  }
  return null;
}

/**
 * Formats an image/picture element with proper classes and alt text.
 * @param {Element} element
 * @param {string} className
 * @param {string} altText
 * @returns {Element|null}
 */
function formatPicture(element, className, altText) {
  if (!element) return null;
  let picture;
  if (element.tagName === 'PICTURE') {
    picture = element.cloneNode(true);
  } else if (element.tagName === 'IMG') {
    picture = document.createElement('picture');
    picture.append(element.cloneNode(true));
  } else {
    const innerPic = element.querySelector('picture');
    if (innerPic) {
      picture = innerPic.cloneNode(true);
    } else {
      const innerImg = element.querySelector('img');
      if (innerImg) {
        picture = document.createElement('picture');
        picture.append(innerImg.cloneNode(true));
      } else {
        return null;
      }
    }
  }

  picture.className = className;
  if (altText) {
    const img = picture.querySelector('img');
    if (img) img.alt = altText;
  }

  const origImg = element.querySelector('img') || (element.tagName === 'IMG' ? element : null);
  const cloneImg = picture.querySelector('img');
  if (origImg && cloneImg) {
    moveInstrumentation(origImg, cloneImg);
  }
  return picture;
}

/**
 * Extracts benefits from a compact benefits container row.
 * @param {Element} row
 * @returns {Array<Object>}
 */
function extractCompactBenefits(row) {
  if (!row) return [];
  const benefits = [];
  const cell = row.firstElementChild || row;

  // 1. Check list items
  const listItems = [...cell.querySelectorAll('li')];
  if (listItems.length > 0) {
    listItems.forEach((li) => {
      const icon = li.querySelector('picture, img, svg, .icon');
      const clone = li.cloneNode(true);
      const cloneIcon = clone.querySelector('picture, img, svg, .icon');
      if (cloneIcon) cloneIcon.remove();
      const text = clone.textContent.trim() || li.textContent.trim();
      if (text) {
        benefits.push({
          icon, text, sourceEl: li, iconSourceEl: icon,
        });
      }
    });
    return benefits;
  }

  // 2. Check paragraphs (handles alternating icon <p> + text <p>, or inline icon + text <p>)
  const paras = [...cell.querySelectorAll('p')];
  if (paras.length > 0) {
    let pendingIcon = null;
    let pendingIconEl = null;

    paras.forEach((p) => {
      const pic = p.querySelector('picture, img, svg, .icon');
      const clone = p.cloneNode(true);
      const clonePic = clone.querySelector('picture, img, svg, .icon');
      if (clonePic) clonePic.remove();
      const text = clone.textContent.trim();

      if (pic && !text) {
        // Pure icon paragraph
        pendingIcon = pic;
        pendingIconEl = p;
      } else if (pic && text) {
        // Both icon and text in one paragraph
        benefits.push({
          icon: pic, text, sourceEl: p, iconSourceEl: pic,
        });
        pendingIcon = null;
        pendingIconEl = null;
      } else if (text) {
        // Text paragraph (with pending icon if available)
        benefits.push({
          icon: pendingIcon, text, sourceEl: p, iconSourceEl: pendingIconEl,
        });
        pendingIcon = null;
        pendingIconEl = null;
      }
    });

    if (benefits.length > 0) return benefits;
  }

  // 3. Check child div cells
  const childDivs = [...cell.children].filter((c) => c.tagName === 'DIV');
  if (childDivs.length > 0) {
    childDivs.forEach((div) => {
      const pic = div.querySelector('picture, img, svg, .icon');
      const clone = div.cloneNode(true);
      const clonePic = clone.querySelector('picture, img, svg, .icon');
      if (clonePic) clonePic.remove();
      const text = clone.textContent.trim() || div.textContent.trim();
      if (text) {
        benefits.push({
          icon: pic, text, sourceEl: div, iconSourceEl: pic,
        });
      }
    });
    if (benefits.length > 0) return benefits;
  }

  // 4. Fallback: single cell text
  const text = cell.textContent.trim();
  if (text) {
    const icon = cell.querySelector('picture, img, svg, .icon');
    benefits.push({
      icon, text, sourceEl: cell, iconSourceEl: icon,
    });
  }

  return benefits;
}

/**
 * Loads and decorates the hero-new-banner block.
 * Universal Editor Model order (14 fields):
 * 0: bg_image
 * 1: bg_imageAlt
 * 2: bg_imageMobile
 * 3: bg_imageMobileAlt
 * 4: title
 * 5: text
 * 6: cta_link
 * 7: cta_linkText
 * 8: benefit_1Icon
 * 9: benefit_1
 * 10: benefit_2Icon
 * 11: benefit_2
 * 12: benefit_3Icon
 * 13: benefit_3
 *
 * Also supports compact authoring models (4 rows or 5 rows).
 *
 * @param {Element} block The hero-new-banner block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  let bgImageRow = null;
  let bgImageAltRow = null;
  let mobileImageRow = null;
  let mobileImageAltRow = null;
  let titleRow = null;
  let textRow = null;
  let ctaLinkRow = null;
  let ctaTextRow = null;
  let benefit1IconRow = null;
  let benefit1Row = null;
  let benefit2IconRow = null;
  let benefit2Row = null;
  let benefit3IconRow = null;
  let benefit3Row = null;
  let compactBenefitsRow = null;

  if (rows.length >= 14) {
    [
      bgImageRow,
      bgImageAltRow,
      mobileImageRow,
      mobileImageAltRow,
      titleRow,
      textRow,
      ctaLinkRow,
      ctaTextRow,
      benefit1IconRow,
      benefit1Row,
      benefit2IconRow,
      benefit2Row,
      benefit3IconRow,
      benefit3Row,
    ] = rows;
  } else if (rows.length === 13) {
    [
      bgImageRow,
      bgImageAltRow,
      mobileImageRow,
      mobileImageAltRow,
      titleRow,
      ctaLinkRow,
      ctaTextRow,
      benefit1IconRow,
      benefit1Row,
      benefit2IconRow,
      benefit2Row,
      benefit3IconRow,
      benefit3Row,
    ] = rows;
  } else if (rows.length === 5) {
    [bgImageRow, titleRow, textRow, ctaLinkRow, compactBenefitsRow] = rows;
  } else if (rows.length === 4) {
    [bgImageRow, titleRow, ctaLinkRow, compactBenefitsRow] = rows;
  } else {
    [bgImageRow, titleRow, ctaLinkRow] = rows;
  }

  // 1. Hero Card Wrapper
  const hero = document.createElement('div');
  hero.className = 'hero-new-banner-hero';

  // 2. Desktop & Mobile Image
  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'hero-new-banner-image';

  const rawDesktop = getRowPicture(bgImageRow);
  const desktopAlt = getRowValue(bgImageAltRow);
  const desktopPicture = formatPicture(rawDesktop, 'hero-new-banner-image-desktop', desktopAlt);
  if (desktopPicture) {
    imageWrapper.append(desktopPicture);
  }

  const rawMobile = getRowPicture(mobileImageRow);
  const mobileAlt = getRowValue(mobileImageAltRow);
  const mobilePicture = formatPicture(rawMobile, 'hero-new-banner-image-mobile', mobileAlt);
  if (mobilePicture) {
    imageWrapper.append(mobilePicture);
  }

  if (desktopPicture || mobilePicture) {
    hero.classList.add('has-image');
    hero.append(imageWrapper);
  }

  // 3. Overlay
  const overlay = document.createElement('div');
  overlay.className = 'hero-new-banner-overlay';
  hero.append(overlay);

  // 4. Content (Title, Description, CTA)
  const content = document.createElement('div');
  content.className = 'hero-new-banner-content';

  // Process Title & Description
  let titleEl = null;
  let descEls = [];

  if (titleRow) {
    const titleCell = titleRow.firstElementChild || titleRow;
    const headings = [...titleCell.querySelectorAll('h1, h2, h3, h4, h5, h6')];
    const paras = [...titleCell.querySelectorAll('p')];

    if (headings.length > 0) {
      // Explicit heading tag present (e.g. <h2><strong>...</strong></h2>)
      titleEl = document.createElement('div');
      titleEl.className = 'hero-new-banner-title';
      titleEl.innerHTML = headings[0].innerHTML;
      moveInstrumentation(headings[0], titleEl);

      // If no separate textRow was supplied, use remaining paragraphs in cell as description
      if (!textRow && paras.length > 0) {
        descEls = paras.map((p) => p.cloneNode(true));
      }
    } else if (!textRow && paras.length > 1) {
      // First paragraph is title, rest are description
      titleEl = document.createElement('div');
      titleEl.className = 'hero-new-banner-title';
      titleEl.innerHTML = paras[0].innerHTML;
      moveInstrumentation(paras[0], titleEl);
      descEls = paras.slice(1).map((p) => p.cloneNode(true));
    } else {
      // Standard text/html title
      const titleHtml = (titleCell.innerHTML || '').trim();
      const titleText = titleCell.textContent.trim();
      if (titleText) {
        titleEl = document.createElement('div');
        titleEl.className = 'hero-new-banner-title';
        if (/<br\s*\/?>/i.test(titleHtml) && !/<p\b/i.test(titleHtml)) {
          titleEl.innerHTML = titleHtml;
        } else if (paras.length === 1) {
          titleEl.innerHTML = paras[0].innerHTML;
        } else {
          titleEl.textContent = titleText;
        }
        moveInstrumentation(titleCell, titleEl);
      }
    }
  }

  // If textRow was explicitly supplied, override description
  if (textRow) {
    const textCell = textRow.firstElementChild || textRow;
    const textParas = [...textCell.querySelectorAll('p')];
    if (textParas.length > 0) {
      descEls = textParas.map((p) => p.cloneNode(true));
    } else {
      const descText = textCell.textContent.trim();
      if (descText) {
        const p = document.createElement('p');
        p.textContent = descText;
        descEls = [p];
      }
    }
  }

  if (titleEl) {
    content.append(titleEl);
  }

  if (descEls.length > 0) {
    const desc = document.createElement('div');
    desc.className = 'hero-new-banner-description';
    descEls.forEach((p) => desc.append(p));
    if (textRow) {
      moveInstrumentation(textRow.firstElementChild || textRow, desc);
    }
    content.append(desc);
  }

  // Process CTA
  const ctaLinkEl = ctaLinkRow?.querySelector('a');
  const ctaHref = ctaLinkEl?.getAttribute('href') || ctaLinkEl?.href || getRowValue(ctaLinkRow);
  const ctaText = getRowValue(ctaTextRow) || ctaLinkEl?.textContent?.trim() || 'Explore Cards';

  if (ctaHref) {
    const ctaWrapper = document.createElement('div');
    ctaWrapper.className = 'hero-new-banner-cta-wrapper';

    const cta = document.createElement('a');
    cta.className = 'hero-new-banner-cta';
    cta.href = ctaHref;
    cta.textContent = ctaText;
    if (ctaLinkEl?.target) cta.target = ctaLinkEl.target;

    if (ctaLinkEl) {
      moveInstrumentation(ctaLinkEl, cta);
    } else if (ctaLinkRow) {
      moveInstrumentation(ctaLinkRow, cta);
    }

    ctaWrapper.append(cta);
    content.append(ctaWrapper);
  }

  hero.append(content);

  // 5. Benefits Section
  const defaultSvgIcon = `
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
      <circle cx="12" cy="13" r="2.5"/>
    </svg>
  `;

  let parsedBenefits = [];

  if (compactBenefitsRow) {
    parsedBenefits = extractCompactBenefits(compactBenefitsRow);
  } else if (rows.length >= 13) {
    const benefitPairs = [
      { iconRow: benefit1IconRow, textRow: benefit1Row },
      { iconRow: benefit2IconRow, textRow: benefit2Row },
      { iconRow: benefit3IconRow, textRow: benefit3Row },
    ];

    benefitPairs.forEach(({ iconRow, textRow: bTextRow }) => {
      const text = getRowValue(bTextRow);
      if (!text) return;

      let authoredIcon = null;
      if (iconRow) {
        authoredIcon = iconRow.querySelector('picture, img, svg, .icon');
        if (!authoredIcon) {
          const iconLink = iconRow.querySelector('a');
          if (iconLink && /\.(svg|png|jpe?g|webp)(\?.*)?$/i.test(iconLink.href)) {
            const img = document.createElement('img');
            img.src = iconLink.href;
            img.alt = '';
            authoredIcon = img;
          }
        }
      }

      parsedBenefits.push({
        icon: authoredIcon,
        text,
        sourceEl: bTextRow,
        iconSourceEl: iconRow,
      });
    });
  }

  let benefitsContainer = null;
  if (parsedBenefits.length > 0) {
    benefitsContainer = document.createElement('div');
    benefitsContainer.className = 'hero-new-banner-benefits';

    parsedBenefits.forEach(({
      icon, text, sourceEl, iconSourceEl,
    }) => {
      const benefitItem = document.createElement('div');
      benefitItem.className = 'hero-new-banner-benefit';

      const iconSpan = document.createElement('span');
      iconSpan.className = 'hero-new-banner-benefit-icon';
      iconSpan.setAttribute('aria-hidden', 'true');

      if (icon) {
        const clonedIcon = icon.cloneNode(true);
        if (iconSourceEl) {
          moveInstrumentation(iconSourceEl, clonedIcon);
        }
        iconSpan.append(clonedIcon);
      } else {
        iconSpan.innerHTML = defaultSvgIcon;
      }

      const textSpan = document.createElement('span');
      textSpan.className = 'hero-new-banner-benefit-text';
      textSpan.textContent = text;

      if (sourceEl) {
        moveInstrumentation(sourceEl, textSpan);
      }

      benefitItem.append(iconSpan, textSpan);
      benefitsContainer.append(benefitItem);
    });
  }

  // 6. Replace Block Children
  block.replaceChildren(hero);
  if (benefitsContainer && benefitsContainer.children.length > 0) {
    block.append(benefitsContainer);
  }
}
