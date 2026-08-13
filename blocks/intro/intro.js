import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the intro block
 * @param {Element} block The intro block element
 */
export default function decorate(block) {
  // The block delivers a single row with a single cell holding rich text:
  // a heading (h2) followed by one or more paragraphs. Flatten the row/cell
  // wrappers so the heading and paragraphs sit directly inside .intro-content.
  const [row] = block.children;
  if (!row) return;

  const content = document.createElement('div');
  content.className = 'intro-content';
  // preserve authoring instrumentation on the flattened wrapper
  moveInstrumentation(row, content);

  [...row.children].forEach((cell) => {
    while (cell.firstElementChild) content.append(cell.firstElementChild);
  });

  content.querySelector('h1, h2, h3, h4, h5, h6')?.classList.add('intro-title');

  block.replaceChildren(content);
}
