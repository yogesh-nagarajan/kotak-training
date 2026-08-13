import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the tabs block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Product navigation');

  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const [linkCell, activeCell] = row.children;

    const li = document.createElement('li');
    li.className = 'tabs-tab';
    moveInstrumentation(row, li);

    const anchor = linkCell?.querySelector('a');
    const isActive = activeCell?.textContent.trim().toLowerCase() === 'active';

    if (anchor) {
      if (isActive) {
        li.classList.add('tabs-tab-active');
        anchor.setAttribute('aria-current', 'page');
      }
      li.append(anchor);
    }

    ul.append(li);
  });

  nav.append(ul);
  block.replaceChildren(nav);
}
