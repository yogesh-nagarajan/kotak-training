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

    // panel (body text, shown when active)
    const panel = document.createElement('div');
    panel.className = 'accordion-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    if (textCell) {
      [...textCell.children].forEach((el) => panel.append(el));
      if (!panel.children.length && textCell.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = textCell.textContent.trim();
        panel.append(p);
      }
    }

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
      panel.hidden = !active;
    });
    const { src, alt } = items[index];
    if (src && mediaImg.getAttribute('src') !== src) {
      mediaImg.setAttribute('src', src);
      mediaImg.alt = alt;
    }
  };

  items.forEach(({ trigger }, i) => {
    trigger.addEventListener('click', () => activate(i));
  });

  block.textContent = '';
  block.append(media, list);

  // first item active by default so the shared image has content
  if (items.length) activate(0);

  // scroll-driven: advance the active item as the block moves through the viewport
  if (items.length > 1 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = items.findIndex((it) => it.item === entry.target);
          if (idx >= 0) activate(idx);
        }
      });
    }, {
      // activate an item once it is centered in the viewport
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0,
    });
    items.forEach(({ item }) => observer.observe(item));
  }
}
