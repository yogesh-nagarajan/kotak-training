import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// Resolve decorative coin assets relative to this block so paths hold up in any
// deployment. Two versions — a wide desktop layout and a lighter mobile one —
// are swapped via CSS `display`; the hidden one is never fetched by the browser.
const COINS_DESKTOP = new URL('./coins-desktop.png', import.meta.url).href;
const COINS_MOBILE = new URL('./coins-mobile.png', import.meta.url).href;

/** Desktop coins show at >=900px; below that the mobile set is used. */
const DESKTOP_QUERY = '(min-width: 900px)';

/** Create one decorative, non-blocking coin <img> (no src yet — set on demand). */
function createCoinImg(className) {
  const img = document.createElement('img');
  img.className = className;
  img.alt = '';
  img.loading = 'lazy';
  img.decoding = 'async';
  img.setAttribute('aria-hidden', 'true');
  return img;
}

/**
 * Build the decorative coin layer: two absolutely-positioned <img> tags (desktop
 * + mobile). Only the image matching the current viewport gets a `src`, so the
 * browser downloads exactly one; a matchMedia listener fills in the other lazily
 * if the viewport later crosses the breakpoint. Both are aria-hidden and never
 * block rendering.
 */
function buildCoins() {
  const coins = document.createElement('div');
  coins.className = 'hero-section-coins';
  coins.setAttribute('aria-hidden', 'true');

  const desktop = createCoinImg('hero-section-coins-desktop');
  const mobile = createCoinImg('hero-section-coins-mobile');
  coins.append(desktop, mobile);

  const mq = window.matchMedia(DESKTOP_QUERY);
  const applySources = () => {
    if (mq.matches && !desktop.src) desktop.src = COINS_DESKTOP;
    if (!mq.matches && !mobile.src) mobile.src = COINS_MOBILE;
  };
  applySources();
  // populate the other image only if/when the viewport crosses the breakpoint
  mq.addEventListener('change', applySources);

  return coins;
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

  // Decorative floating coins: two responsive <img> tags (desktop + mobile).
  block.replaceChildren(buildCoins(), content);
  if (cards) block.append(cards);
}
