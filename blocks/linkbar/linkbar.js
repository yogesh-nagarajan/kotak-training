import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the linkbar — a centered row of links separated by
 * vertical dividers
 * @param {Element} block The linkbar block element
 */
export default function decorate(block) {
  const items = [...block.children];

  const list = document.createElement('div');
  list.className = 'linkbar-items';

  items.forEach((row) => {
    const link = row.querySelector('a');
    if (!link) return;
    const item = document.createElement('div');
    item.className = 'linkbar-item';
    moveInstrumentation(row, item);
    link.className = '';
    item.append(link);
    list.append(item);
  });

  block.textContent = '';
  block.append(list);
}
