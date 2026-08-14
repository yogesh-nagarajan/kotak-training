import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the cta block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [row] = [...block.children];
  const [headingCell, linkCell] = row ? [...row.children] : [];

  const content = document.createElement('div');
  content.className = 'cta-content';

  // heading
  const headingText = headingCell?.textContent.trim();
  if (headingText) {
    const title = document.createElement('h2');
    title.className = 'cta-title';
    title.textContent = headingText;
    moveInstrumentation(headingCell, title);
    content.append(title);
  }

  // call-to-action button (rendered from the authored link, if present)
  const linkAnchor = (linkCell || block).querySelector('a');
  const href = linkAnchor?.getAttribute('href');
  if (href) {
    const button = document.createElement('a');
    button.className = 'button cta-button';
    button.href = href;
    button.textContent = linkAnchor.textContent.trim();
    const target = linkAnchor.getAttribute('target');
    if (target && target !== 'undefined') button.target = target;
    moveInstrumentation(linkAnchor, button);
    content.append(button);
  }

  block.textContent = '';
  block.append(content);
}
