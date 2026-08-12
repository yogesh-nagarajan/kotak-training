import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the pvr-benefits block
 *
 * Each authored item (row) contains: icon (image), icon alt (text), title (text).
 * Renders a semantic list of benefit cards matching the live Kotak PVR INOX page.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'pvr-benefits-list';

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'pvr-benefits-item';
    moveInstrumentation(row, li);

    const cells = [...row.children];
    const iconCell = cells[0];
    const iconAlt = cells[1]?.textContent.trim() || '';
    const titleText = cells[2]?.textContent.trim() || '';

    // Icon
    const iconWrap = document.createElement('div');
    iconWrap.className = 'pvr-benefits-icon';
    const picture = iconCell?.querySelector('picture');
    const img = iconCell?.querySelector('img');
    if (picture) {
      const pImg = picture.querySelector('img');
      if (pImg) {
        if (iconAlt) pImg.alt = iconAlt;
        pImg.loading = 'lazy';
      }
      iconWrap.append(picture);
    } else if (img) {
      if (iconAlt) img.alt = iconAlt;
      img.loading = 'lazy';
      iconWrap.append(img);
    }
    li.append(iconWrap);

    // Title (semantic heading)
    if (titleText) {
      const h3 = document.createElement('h3');
      h3.className = 'pvr-benefits-title';
      h3.textContent = titleText;
      li.append(h3);
    }

    ul.append(li);
  });

  block.replaceChildren(ul);
}
