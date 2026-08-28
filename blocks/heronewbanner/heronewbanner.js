export default function decorate(block) {
  /*
   * Expected authored structure:
   *
   * Row 1 - Hero Image
   * Row 2 - Title
   * Row 3 - Description
   * Row 4 - CTA Text
   * Row 5 - CTA Link
   * Row 6 - Benefit 1
   * Row 7 - Benefit 2
   * Row 8 - Benefit 3
   */

  const rows = [...block.children];

  if (!rows.length) {
    return;
  }

  /*
   * Get the first cell from each authored row.
   */
  const getCell = (index) => rows[index]?.children?.[0];

  /*
   * Read authored values.
   */
  const imageCell = getCell(0);
  const titleCell = getCell(1);
  const descriptionCell = getCell(2);
  const ctaTextCell = getCell(3);
  const ctaLinkCell = getCell(4);
  const benefit1Cell = getCell(5);
  const benefit2Cell = getCell(6);
  const benefit3Cell = getCell(7);

  /*
   * Image.
   */
  const image = imageCell?.querySelector('img');

  /*
   * Title.
   */
  const title = titleCell?.innerHTML.trim() || '';

  /*
   * Description.
   */
  const description = descriptionCell?.innerHTML.trim() || '';

  /*
   * CTA.
   */
  const ctaText = ctaTextCell?.textContent.trim() || '';

  const existingLink = ctaLinkCell?.querySelector('a');

  const ctaLink = existingLink?.href
    || ctaLinkCell?.textContent.trim()
    || '#';

  /*
   * Benefits.
   */
  const benefits = [
    benefit1Cell?.textContent.trim(),
    benefit2Cell?.textContent.trim(),
    benefit3Cell?.textContent.trim(),
  ].filter(Boolean);

  /*
   * =====================================================
   * HERO
   * =====================================================
   */

  const hero = document.createElement('div');

  hero.className = 'heronewbanner-hero';

  /*
   * Set background image.
   */
  if (image?.src) {
    hero.style.setProperty(
      '--heronewbanner-image',
      `url("${image.src}")`,
    );
  }

  /*
   * Overlay.
   */
  const overlay = document.createElement('div');

  overlay.className = 'heronewbanner-overlay';

  /*
   * Copy container.
   */
  const copy = document.createElement('div');

  copy.className = 'heronewbanner-copy';

  /*
   * Title.
   */
  if (title) {
    const heading = document.createElement('h2');

    heading.className = 'heronewbanner-title';

    heading.innerHTML = title;

    copy.append(heading);
  }

  /*
   * Description.
   */
  if (description) {
    const paragraph = document.createElement('p');

    paragraph.className = 'heronewbanner-description';

    paragraph.innerHTML = description;

    copy.append(paragraph);
  }

  /*
   * CTA.
   */
  if (ctaText) {
    const link = document.createElement('a');

    link.className = 'heronewbanner-cta';

    link.href = ctaLink;

    link.textContent = ctaText;

    copy.append(link);
  }

  /*
   * Build hero.
   */
  hero.append(
    overlay,
    copy,
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
        width="13"
        height="13"
        fill="none"
      >
        <path
          d="M5 10.5L12 4L19 10.5V20H5V10.5Z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
        <path
          d="M9 20V14H15V20"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
      </svg>
    `;

    /*
     * Benefit text.
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
   * Replace authored markup
   * with the final block markup.
   */
  block.replaceChildren(
    hero,
    benefitsContainer,
  );
}
