export default function decorate(block) {
  const rows = [...block.children];

  /*
   * The model fields are authored as rows.
   *
   * 0 - Background Image
   * 1 - Background Image Alt Text
   * 2 - Mobile Background Image
   * 3 - Mobile Image Alt Text
   * 4 - Heading & Text
   * 5 - CTA Link
   * 6 - CTA Text
   * 7 - Benefit 1
   * 8 - Benefit 2
   * 9 - Benefit 3
   */

  const getCell = (index) => rows[index]?.children?.[0];

  const backgroundImageCell = getCell(0);
  const backgroundImageAlt = getCell(1)?.textContent.trim() || '';

  const mobileImageCell = getCell(2);
  const mobileImageAlt = getCell(3)?.textContent.trim() || '';

  const textCell = getCell(4);

  const ctaLinkCell = getCell(5);
  const ctaText = getCell(6)?.textContent.trim() || '';

  const benefits = [
    getCell(7)?.textContent.trim(),
    getCell(8)?.textContent.trim(),
    getCell(9)?.textContent.trim(),
  ].filter(Boolean);

  /*
   * =====================================================
   * IMAGES
   * =====================================================
   */

  const desktopImage = backgroundImageCell?.querySelector('img');
  const mobileImage = mobileImageCell?.querySelector('img');

  /*
   * =====================================================
   * TEXT
   * =====================================================
   */

  const heading = textCell?.querySelector('h1, h2, h3')?.innerHTML.trim() || '';

  const headingElement = textCell?.querySelector('h1, h2, h3');

  let description = '';

  if (headingElement) {
    const descriptionParts = [];

    let currentElement = headingElement.nextElementSibling;

    while (currentElement) {
      descriptionParts.push(currentElement.outerHTML);
      currentElement = currentElement.nextElementSibling;
    }

    description = descriptionParts.join('');
  } else if (textCell) {
    description = textCell.innerHTML.trim();
  }

  /*
   * =====================================================
   * CTA
   * =====================================================
   */

  const ctaLinkElement = ctaLinkCell?.querySelector('a');

  const ctaHref = ctaLinkElement?.href
    || ctaLinkCell?.textContent.trim()
    || '#';

  /*
   * =====================================================
   * HERO
   * =====================================================
   */

  const hero = document.createElement('div');

  hero.className = 'heronewbanner-hero';

  /*
   * Desktop background image.
   */

  if (desktopImage?.src) {
    hero.style.setProperty(
      '--heronewbanner-image',
      `url("${desktopImage.src}")`,
    );
  }

  /*
   * Mobile background image.
   */

  if (mobileImage?.src) {
    hero.style.setProperty(
      '--heronewbanner-mobile-image',
      `url("${mobileImage.src}")`,
    );
  }

  /*
   * Accessibility attributes.
   */

  if (backgroundImageAlt) {
    hero.setAttribute(
      'aria-label',
      backgroundImageAlt,
    );
  }

  if (mobileImageAlt) {
    hero.setAttribute(
      'data-mobile-image-alt',
      mobileImageAlt,
    );
  }

  /*
   * Overlay.
   */

  const overlay = document.createElement('div');

  overlay.className = 'heronewbanner-overlay';

  /*
   * Content wrapper.
   */

  const content = document.createElement('div');

  content.className = 'heronewbanner-content';

  /*
   * Heading.
   */

  if (heading) {
    const title = document.createElement('h2');

    title.className = 'heronewbanner-title';

    title.innerHTML = heading;

    content.append(title);
  }

  /*
   * Description.
   */

  if (description) {
    const descriptionElement = document.createElement('div');

    descriptionElement.className = 'heronewbanner-description';

    descriptionElement.innerHTML = description;

    content.append(descriptionElement);
  }

  /*
   * CTA.
   */

  if (ctaText) {
    const cta = document.createElement('a');

    cta.className = 'heronewbanner-cta';

    cta.href = ctaHref;

    cta.textContent = ctaText;

    content.append(cta);
  }

  /*
   * Build hero.
   */

  hero.append(
    overlay,
    content,
  );

  /*
   * =====================================================
   * BENEFITS
   * =====================================================
   */

  const benefitsContainer = document.createElement('div');

  benefitsContainer.className = 'heronewbanner-benefits';

  benefits.forEach((benefit) => {
    const item = document.createElement('div');

    item.className = 'heronewbanner-benefit';

    /*
     * Icon.
     */

    const icon = document.createElement('span');

    icon.className = 'heronewbanner-benefit-icon';

    icon.setAttribute(
      'aria-hidden',
      'true',
    );

    icon.innerHTML = `
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          stroke-width="1.5"
        />
        <path
          d="M8 12.5L10.5 15L16 9.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `;

    /*
     * Text.
     */

    const text = document.createElement('span');

    text.className = 'heronewbanner-benefit-text';

    text.textContent = benefit;

    item.append(
      icon,
      text,
    );

    benefitsContainer.append(item);
  });

  /*
   * =====================================================
   * FINAL BLOCK
   * =====================================================
   */

  block.replaceChildren(
    hero,
    benefitsContainer,
  );
}
