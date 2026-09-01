import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the heronewbanner block
 * @param {Element} block The heronewbanner block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  // 1. Identify and extract pictures/images
  const allPictures = [...block.querySelectorAll('picture, img')].filter(
    (el) => !(el.tagName === 'IMG' && el.closest('picture')),
  );

  let desktopPic = null;
  let mobilePic = null;

  if (allPictures.length > 0) {
    [desktopPic] = allPictures;
    if (allPictures.length > 1) {
      [, mobilePic] = allPictures;
    }
  }

  // 2. Identify image rows vs text rows
  const nonImageRows = rows.filter((row) => {
    const pics = row.querySelectorAll('picture, img');
    const text = row.textContent.trim();
    return !(pics.length > 0 && text === '');
  });

  // 3. Extract CTA link, heading, description, and benefits
  let ctaElement = null;
  let headingElement = null;
  const descriptionElements = [];
  const benefitTexts = [];

  const allLinks = [...block.querySelectorAll('a')];

  nonImageRows.forEach((row, rowIndex) => {
    // Check for benefit items in bullet list (if authored as <ul>)
    const listItems = [...row.querySelectorAll('li')];
    if (listItems.length > 0) {
      listItems.forEach((li) => {
        const t = li.textContent.trim();
        if (t) benefitTexts.push(t);
      });
      return;
    }

    const isLastRow = rowIndex === nonImageRows.length - 1 && nonImageRows.length >= 3;
    const cells = [...row.children];
    const paras = [...row.querySelectorAll('p')];

    // If it's the last row and has no headings and no CTA links, treat as benefits
    if (isLastRow && !row.querySelector('h1, h2, h3, h4, h5, h6, a')) {
      paras.forEach((p) => {
        const t = p.textContent.trim();
        if (t) benefitTexts.push(t);
      });
      if (benefitTexts.length === 0 && cells.length > 0) {
        cells.forEach((c) => {
          const t = c.textContent.trim();
          if (t) benefitTexts.push(t);
        });
      }
      return;
    }

    // Process cells
    cells.forEach((cell) => {
      // Check for headings
      const h = cell.querySelector('h1, h2, h3, h4, h5, h6');
      if (h && !headingElement) {
        headingElement = h;
      }

      // Check for link / CTA
      const a = cell.querySelector('a');
      if (a && !ctaElement) {
        ctaElement = a;
      }

      // Process children for description
      const children = [...cell.children];
      if (children.length === 0 && cell.textContent.trim()) {
        const text = cell.textContent.trim();
        if (!headingElement) {
          const h2 = document.createElement('h2');
          h2.textContent = text;
          headingElement = h2;
        } else if (!ctaElement && text.startsWith('http')) {
          const cta = document.createElement('a');
          cta.href = text;
          cta.textContent = 'Learn More';
          ctaElement = cta;
        } else {
          const p = document.createElement('p');
          p.textContent = text;
          descriptionElements.push(p);
        }
      } else {
        children.forEach((child) => {
          if (child === headingElement) return;
          if (child === ctaElement || (ctaElement && child.contains(ctaElement))) return;
          if (child.matches('picture') || child.querySelector('picture, img')) return;

          if (isLastRow && !child.querySelector('h1, h2, h3, h4, h5, h6')) {
            const t = child.textContent.trim();
            if (t) benefitTexts.push(t);
            return;
          }

          descriptionElements.push(child);
        });
      }
    });
  });

  // Fallback for CTA link
  if (!ctaElement && allLinks.length > 0) {
    [ctaElement] = allLinks;
  }

  const cleanBenefits = benefitTexts.filter((b) => b.length > 0);

  // 4. Build DOM Structure
  const hero = document.createElement('div');
  hero.className = 'heronewbanner-hero';

  // Image wrapper
  if (desktopPic || mobilePic) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'heronewbanner-image';

    if (desktopPic) {
      const desktopImg = desktopPic.querySelector('img') || desktopPic;
      const optimizedDesktop = createOptimizedPicture(
        desktopImg.src,
        desktopImg.alt || 'Hero Banner',
        false,
        [{ width: '1600' }],
      );
      optimizedDesktop.classList.add('heronewbanner-image-desktop');
      moveInstrumentation(desktopImg, optimizedDesktop.querySelector('img'));
      imageWrapper.append(optimizedDesktop);
    }

    if (mobilePic) {
      const mobileImg = mobilePic.querySelector('img') || mobilePic;
      const optimizedMobile = createOptimizedPicture(
        mobileImg.src,
        mobileImg.alt || 'Hero Banner Mobile',
        false,
        [{ width: '750' }],
      );
      optimizedMobile.classList.add('heronewbanner-image-mobile');
      moveInstrumentation(mobileImg, optimizedMobile.querySelector('img'));
      imageWrapper.append(optimizedMobile);
    }

    hero.append(imageWrapper);
  }

  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'heronewbanner-overlay';
  hero.append(overlay);

  // Content wrapper
  const content = document.createElement('div');
  content.className = 'heronewbanner-content';

  if (headingElement) {
    const h = document.createElement('h2');
    h.className = 'heronewbanner-title';
    h.innerHTML = headingElement.innerHTML;
    moveInstrumentation(headingElement, h);
    content.append(h);
  }

  if (descriptionElements.length > 0) {
    const desc = document.createElement('div');
    desc.className = 'heronewbanner-description';
    descriptionElements.forEach((el) => {
      desc.append(el);
    });
    content.append(desc);
  }

  if (ctaElement) {
    const cta = document.createElement('a');
    cta.className = 'button heronewbanner-cta';
    cta.href = ctaElement.getAttribute('href') || ctaElement.href || '#';
    cta.textContent = ctaElement.textContent.trim() || 'Learn More';
    if (ctaElement.target) cta.target = ctaElement.target;
    moveInstrumentation(ctaElement, cta);

    const ctaWrapper = document.createElement('div');
    ctaWrapper.className = 'heronewbanner-cta-wrapper';
    ctaWrapper.append(cta);
    content.append(ctaWrapper);
  }

  hero.append(content);

  // Benefits Section
  let benefitsContainer = null;
  if (cleanBenefits.length > 0) {
    benefitsContainer = document.createElement('div');
    benefitsContainer.className = 'heronewbanner-benefits';

    cleanBenefits.forEach((benefitText) => {
      const item = document.createElement('div');
      item.className = 'heronewbanner-benefit';

      const icon = document.createElement('span');
      icon.className = 'heronewbanner-benefit-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 12.5L10.5 15L16 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;

      const text = document.createElement('span');
      text.className = 'heronewbanner-benefit-text';
      text.textContent = benefitText;

      item.append(icon, text);
      benefitsContainer.append(item);
    });
  }

  // Replace block children
  block.replaceChildren(hero);
  if (benefitsContainer) {
    block.append(benefitsContainer);
  }
}
