import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Decorative rupee coin. Injected once and re-used via <use> so the scattered
 * coins add no extra network requests and negligible weight.
 */
const COIN_SPRITE = `
  <svg width="0" height="0" aria-hidden="true" focusable="false" class="hero-section-coin-sprite">
    <defs>
      <g id="hero-section-coin">
        <ellipse cx="34" cy="34" rx="30" ry="30" fill="#d9dbe0"/>
        <ellipse cx="32" cy="32" rx="30" ry="30" fill="#eef0f3"/>
        <ellipse cx="32" cy="32" rx="24" ry="24" fill="#c9ccd3"/>
        <ellipse cx="32" cy="32" rx="21" ry="21" fill="#e7e9ed"/>
        <path d="M25 20h14m-14 5h14m-11 0c6 0 6 8 0 8h-3l9 11m-6-19c5 0 6-4 0-4"
          fill="none" stroke="#7b8090" stroke-width="2.4"
          stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </defs>
  </svg>`;

/** Number of scattered coins and where each sits (see CSS for offsets). */
const COIN_COUNT = 6;

function buildCoin(index) {
  const coin = document.createElement('span');
  coin.className = `hero-section-coin hero-section-coin-${index + 1}`;
  coin.setAttribute('aria-hidden', 'true');
  coin.innerHTML = '<svg viewBox="0 0 64 64"><use href="#hero-section-coin"/></svg>';
  return coin;
}

/**
 * loads and decorates the hero-section block
 * @param {Element} block The hero-section block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Rows that carry an image are the feature cards; the rest is the intro copy.
  const cardRows = rows.filter((row) => row.querySelector('picture, img'));
  const headerRows = rows.filter((row) => !cardRows.includes(row));

  // Flatten the header rows into a single ordered list of content elements so
  // we can classify them by type regardless of how many wrapper cells the
  // backend emits.
  const headerEls = [];
  headerRows.forEach((row) => {
    [...row.children].forEach((cell) => {
      while (cell.firstElementChild) headerEls.push(cell.removeChild(cell.firstElementChild));
    });
  });

  const content = document.createElement('div');
  content.className = 'hero-section-content';

  const heading = headerEls.find((el) => /^H[1-6]$/.test(el.tagName));
  const link = headerEls.find((el) => el.tagName === 'A' || el.querySelector('a'));

  headerEls.forEach((el) => {
    if (el === heading) {
      el.classList.add('hero-section-title');
      content.append(el);
      return;
    }
    if (el === link) {
      const anchor = el.tagName === 'A' ? el : el.querySelector('a');
      anchor.classList.add('button', 'accent');
      const wrapper = document.createElement('p');
      wrapper.className = 'button-container hero-section-cta';
      wrapper.append(anchor);
      content.append(wrapper);
      return;
    }
    // Text before the heading is the eyebrow; text after it is the subtitle.
    const beforeHeading = heading && content.contains(heading) === false;
    el.classList.add(beforeHeading ? 'hero-section-eyebrow' : 'hero-section-subtitle');
    content.append(el);
  });

  // Feature cards.
  let cards;
  if (cardRows.length) {
    cards = document.createElement('ul');
    cards.className = 'hero-section-cards';
    cardRows.forEach((row) => {
      const li = document.createElement('li');
      li.className = 'hero-section-card';
      moveInstrumentation(row, li);
      while (row.firstElementChild) li.append(row.firstElementChild);
      [...li.children].forEach((cell) => {
        if (cell.querySelector('picture, img')) cell.className = 'hero-section-card-icon';
        else cell.className = 'hero-section-card-body';
      });
      cards.append(li);
    });

    // Optimize every card icon and keep the authoring instrumentation.
    cards.querySelectorAll('picture > img').forEach((img) => {
      const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }]);
      moveInstrumentation(img, optimized.querySelector('img'));
      img.closest('picture').replaceWith(optimized);
    });
  }

  // Decorative floating coins (aria-hidden, no extra requests).
  const coins = document.createElement('div');
  coins.className = 'hero-section-coins';
  coins.setAttribute('aria-hidden', 'true');
  coins.innerHTML = COIN_SPRITE;
  for (let i = 0; i < COIN_COUNT; i += 1) coins.append(buildCoin(i));

  block.replaceChildren(coins, content);
  if (cards) block.append(cards);
}
