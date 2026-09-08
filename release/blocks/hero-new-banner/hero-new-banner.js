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
 * Loads and decorates the hero-new-banner block.
 * Universal Editor Model order (13 fields):
 * 0: bg_image
 * 1: bg_imageAlt
 * 2: bg_imageMobile
 * 3: bg_imageMobileAlt
 * 4: text (richtext)
 * 5: cta_link
 * 6: cta_linkText
 * 7: benefit_1_icon
 * 8: benefit_1
 * 9: benefit_2_icon
 * 10: benefit_2
 * 11: benefit_3_icon
 * 12: benefit_3
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
  let textRow = null;
  let ctaLinkRow = null;
  let ctaTextRow = null;
  let benefit1IconRow = null;
  let benefit1Row = null;
  let benefit2IconRow = null;
  let benefit2Row = null;
  let benefit3IconRow = null;
  let benefit3Row = null;

  if (rows.length >= 13) {
    [
      bgImageRow,
      bgImageAltRow,
      mobileImageRow,
      mobileImageAltRow,
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
  } else {
    // Graceful fallback for compact authored drafts
    [bgImageRow, textRow, ctaLinkRow] = rows;
    const compactBenefits = rows[3];
    if (compactBenefits) {
      const benefitParas = [...compactBenefits.querySelectorAll('p, li')];
      const benefitCells = [...compactBenefits.children];
      const items = benefitParas.length > 0 ? benefitParas : benefitCells;
      [benefit1Row, benefit2Row, benefit3Row] = items;
    }
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
    hero.append(imageWrapper);
  }

  // 3. Overlay
  const overlay = document.createElement('div');
  overlay.className = 'hero-new-banner-overlay';
  hero.append(overlay);

  // 4. Content (Title, Description, CTA)
  const content = document.createElement('div');
  content.className = 'hero-new-banner-content';

  // Process richtext textRow
  const textCell = textRow?.firstElementChild || textRow;
  if (textCell) {
    const heading = textCell.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      const title = document.createElement('h2');
      title.className = 'hero-new-banner-title';
      title.innerHTML = heading.innerHTML;
      moveInstrumentation(heading, title);
      content.append(title);
    }

    const descNodes = [];
    [...textCell.children].forEach((child) => {
      if (child === heading) return;
      if (
        child.contains(heading)
        && child.children.length === 1
        && !child.textContent.replace(heading.textContent, '').trim()
      ) {
        return;
      }
      descNodes.push(child.cloneNode(true));
    });

    if (!heading && textCell.textContent.trim()) {
      const title = document.createElement('h2');
      title.className = 'hero-new-banner-title';
      title.textContent = textCell.textContent.trim();
      moveInstrumentation(textCell, title);
      content.append(title);
    } else if (descNodes.length > 0) {
      const desc = document.createElement('div');
      desc.className = 'hero-new-banner-description';
      descNodes.forEach((node) => desc.append(node));
      content.append(desc);
    }
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
  const benefitPairs = [
    { iconRow: benefit1IconRow, textRow: benefit1Row },
    { iconRow: benefit2IconRow, textRow: benefit2Row },
    { iconRow: benefit3IconRow, textRow: benefit3Row },
  ];

  const defaultSvgIcon = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
      <circle cx="12" cy="13" r="2.5"/>
    </svg>
  `;

  let benefitsContainer = null;
  const hasBenefits = benefitPairs.some((p) => getRowValue(p.textRow));

  if (hasBenefits) {
    benefitsContainer = document.createElement('div');
    benefitsContainer.className = 'hero-new-banner-benefits';

    benefitPairs.forEach(({ iconRow, textRow: bTextRow }) => {
      const text = getRowValue(bTextRow);
      if (!text) return;

      const benefitItem = document.createElement('div');
      benefitItem.className = 'hero-new-banner-benefit';

      const iconSpan = document.createElement('span');
      iconSpan.className = 'hero-new-banner-benefit-icon';
      iconSpan.setAttribute('aria-hidden', 'true');

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

      if (authoredIcon) {
        const clonedIcon = authoredIcon.cloneNode(true);
        moveInstrumentation(authoredIcon, clonedIcon);
        iconSpan.append(clonedIcon);
      } else {
        iconSpan.innerHTML = defaultSvgIcon;
      }

      const textSpan = document.createElement('span');
      textSpan.className = 'hero-new-banner-benefit-text';
      textSpan.textContent = text;

      if (bTextRow) {
        moveInstrumentation(bTextRow, textSpan);
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

  // /* eslint-disable no-console */
  // console.log('FINAL HERONEWBANNER DOM:', block.outerHTML);
  // console.log('hero classes:', hero.className);
  // console.log('image classes:', imageWrapper?.className);
  // console.log('content classes:', content.className);
  // console.log('benefits classes:', benefitsContainer?.className);
  // /* eslint-enable no-console */
}
