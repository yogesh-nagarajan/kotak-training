import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the breadcrumb block
 * @param {Element} block The breadcrumb block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) {
    block.replaceChildren();
    return;
  }

  const nav = document.createElement('nav');
  nav.className = 'breadcrumb-nav';
  nav.setAttribute('aria-label', 'Breadcrumb');

  const list = document.createElement('ol');
  list.className = 'breadcrumb-list';

  rows.forEach((row) => {
    const cells = [...row.children];
    const labelCell = cells[0];
    const flagCell = cells[1];

    const isCurrent = flagCell
      && flagCell.textContent.trim().toLowerCase() === 'current';

    const li = document.createElement('li');
    li.className = 'breadcrumb-item';
    moveInstrumentation(row, li);

    const anchor = labelCell ? labelCell.querySelector('a') : null;
    const labelText = (anchor || labelCell || { textContent: '' }).textContent.trim();

    if (isCurrent) {
      const current = document.createElement('span');
      current.className = 'breadcrumb-current';
      current.setAttribute('aria-current', 'page');
      current.textContent = labelText;
      li.append(current);
    } else if (anchor) {
      anchor.className = 'breadcrumb-link';
      li.append(anchor);
    } else {
      const span = document.createElement('span');
      span.className = 'breadcrumb-link';
      span.textContent = labelText;
      li.append(span);
    }

    list.append(li);
  });

  nav.append(list);
  block.replaceChildren(nav);
}
