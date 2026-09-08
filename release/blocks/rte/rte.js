import { moveInstrumentation } from '../../scripts/scripts.js';

const MAX_LINES = 5;

/**
 * Toggle the expanded/collapsed state of the block.
 * @param {Element} block
 * @param {HTMLAnchorElement} toggle
 * @param {string} moreLabel
 * @param {string} lessLabel
 */
function setExpanded(block, toggle, moreLabel, lessLabel, expanded) {
  block.classList.toggle('rte-expanded', expanded);
  toggle.textContent = expanded ? lessLabel : moreLabel;
  toggle.setAttribute('aria-expanded', String(expanded));
}

/**
 * loads and decorates the rte block
 *
 * Authoring model order: title, text (richtext), readMoreLabel, readLessLabel
 * When the body copy exceeds MAX_LINES it is clamped and a Read More / Read Less
 * toggle is shown; otherwise the toggle is omitted.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const [titleCell, textCell, moreCell, lessCell] = rows.map((row) => row.firstElementChild);

  const moreLabel = (moreCell?.textContent || 'Read More').trim();
  const lessLabel = (lessCell?.textContent || 'Read Less').trim();

  block.textContent = '';
  block.style.setProperty('--rte-max-lines', MAX_LINES);

  // title
  const titleText = titleCell?.textContent.trim();
  if (titleText) {
    const title = document.createElement('h2');
    title.className = 'rte-title';
    title.textContent = titleText;
    moveInstrumentation(rows[0], title);
    block.append(title);
  }

  // body text
  const content = document.createElement('div');
  content.className = 'rte-text';
  if (textCell) {
    moveInstrumentation(rows[1], content);
    [...textCell.childNodes].forEach((n) => content.append(n));
  }
  block.append(content);

  // toggle (only added when the text overflows past MAX_LINES)
  const toggle = document.createElement('a');
  toggle.className = 'rte-toggle';
  toggle.href = '#';
  toggle.setAttribute('role', 'button');
  toggle.textContent = moreLabel;

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    const expanded = !block.classList.contains('rte-expanded');
    setExpanded(block, toggle, moreLabel, lessLabel, expanded);
  });

  // Decide whether clamping is needed by comparing the clamped height (5 lines)
  // against the full scroll height. Runs after layout so measurements are real.
  const applyClamp = () => {
    // temporarily clamp to measure
    block.classList.add('rte-clamped');
    const overflowing = content.scrollHeight - content.clientHeight > 1;
    if (overflowing) {
      if (!toggle.isConnected) block.append(toggle);
      setExpanded(block, toggle, moreLabel, lessLabel, false);
    } else {
      // fits within MAX_LINES -> no clamp, no toggle
      block.classList.remove('rte-clamped');
      if (toggle.isConnected) toggle.remove();
    }
  };

  // measure after fonts/layout settle
  if (document.fonts?.ready) {
    document.fonts.ready.then(applyClamp);
  } else {
    applyClamp();
  }
  // re-evaluate on resize (line count changes with width)
  window.addEventListener('resize', applyClamp);
}
