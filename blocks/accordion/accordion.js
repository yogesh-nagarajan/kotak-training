import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the accordion
 * @param {Element} block The accordion block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // shared media panel (left): shows the active item's image
  const media = document.createElement('div');
  media.className = 'accordion-media';
  const mediaImg = document.createElement('img');
  mediaImg.loading = 'lazy';
  mediaImg.alt = '';
  media.append(mediaImg);

  // list of accordion items (right)
  const list = document.createElement('div');
  list.className = 'accordion-list';

  const items = [];

  rows.forEach((row, i) => {
    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture, img'));
    const altCell = cells.find((c) => c !== imageCell
      && !c.querySelector('h1, h2, h3, h4, h5, h6, p, ul, ol')
      && c.textContent.trim());
    const textCell = cells.find((c) => c !== imageCell && c !== altCell) || cells[cells.length - 1];

    const heading = textCell?.querySelector('h1, h2, h3, h4, h5, h6');
    const img = imageCell?.querySelector('img');
    const src = img?.getAttribute('src') || '';
    const alt = (altCell?.textContent.trim()) || img?.getAttribute('alt') || '';

    const item = document.createElement('div');
    item.className = 'accordion-item';
    moveInstrumentation(row, item);

    // trigger (clickable heading with +/- indicator)
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'accordion-trigger';
    trigger.setAttribute('aria-expanded', 'false');
    const panelId = `accordion-panel-${i}`;
    trigger.setAttribute('aria-controls', panelId);
    const label = document.createElement('span');
    label.className = 'accordion-label';
    label.textContent = heading ? heading.textContent.trim() : (textCell?.textContent.trim() || '');
    trigger.append(label);
    if (heading) heading.remove();

    // panel (body text, shown when active) — inner wrapper enables the
    // collapse animation (a single grid row that grows/shrinks)
    const panel = document.createElement('div');
    panel.className = 'accordion-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    const panelInner = document.createElement('div');
    panelInner.className = 'accordion-panel-inner';
    if (textCell) {
      [...textCell.children].forEach((el) => panelInner.append(el));
      if (!panelInner.children.length && textCell.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = textCell.textContent.trim();
        panelInner.append(p);
      }
    }
    panel.append(panelInner);

    item.append(trigger, panel);
    list.append(item);
    items.push({
      item, trigger, panel, src, alt,
    });
  });

  /**
   * Activate a single item: swap the shared image, expand its panel, collapse others.
   * @param {Number} index index of the item to activate
   */
  const activate = (index) => {
    items.forEach(({ item, trigger, panel }, i) => {
      const active = i === index;
      item.classList.toggle('accordion-active', active);
      trigger.setAttribute('aria-expanded', active ? 'true' : 'false');
      // keep the panel in the accessibility tree; visibility is animated via CSS
      panel.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    const { src, alt } = items[index];
    if (src && mediaImg.getAttribute('src') !== src) {
      mediaImg.setAttribute('src', src);
      mediaImg.alt = alt;
    }
  };

  // how long each item stays active before auto-advancing (ms)
  const AUTOPLAY_DELAY = 6000;
  let current = 0;
  let timer = null;

  const stopAutoplay = () => {
    if (timer) { clearTimeout(timer); timer = null; }
  };

  // schedule the next item; loops back to the first after the last
  const scheduleNext = () => {
    stopAutoplay();
    if (items.length < 2) return;
    timer = setTimeout(() => {
      current = (current + 1) % items.length;
      activate(current);
      scheduleNext();
    }, AUTOPLAY_DELAY);
  };

  items.forEach(({ trigger }, i) => {
    trigger.addEventListener('click', () => {
      current = i;
      activate(i);
      scheduleNext();
    });
  });

  block.textContent = '';
  block.append(media, list);

  // first item active by default so the shared image has content
  if (items.length) activate(0);

  // auto-play: continuously advance through the items, looping forever.
  // runs regardless of scroll position so it is always cycling.
  scheduleNext();
}
