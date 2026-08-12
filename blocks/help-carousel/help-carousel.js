/*
 * Help Carousel block
 *
 * A horizontally draggable row of help cards (icon + title + description).
 * Peek layout: 5 cards visible on desktop, 3 on tablet, 2 on mobile — the rest
 * are revealed by dragging/scrolling the row left. A progress bar under the row
 * reflects the scroll position.
 *
 * Authored structure — one row per card, two cells:
 *   cell 1 -> icon key (text, e.g. "help") OR an <img>/<picture>
 *   cell 2 -> <h3> title, <p> description
 *
 * @param {Element} block the help-carousel block element
 */

// Inline SVG icons keyed by name (stroke uses currentColor -> Kotak navy).
const ICONS = {
  help: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7" stroke-linecap="round"/><circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none"/></svg>',
  contact: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7" stroke-linecap="round"/><circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none"/></svg>',
  locate: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  fraud: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3s7 2 7 5v4c0 5-7 9-7 9s-7-4-7-9V8c0-3 7-5 7-5Z"/><path d="M12 9v3.5" stroke-linecap="round"/><circle cx="12" cy="15.5" r="0.6" fill="currentColor" stroke="none"/></svg>',
  complaint: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18" /></svg>',
  card: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 13.5h.01" stroke-linecap="round"/></svg>',
};

function bindDrag(track, progressFill) {
  let startX = 0;
  let startScroll = 0;
  let dragging = false;

  const updateProgress = () => {
    if (!progressFill) return;
    const max = track.scrollWidth - track.clientWidth;
    const pct = max > 0 ? (track.scrollLeft / max) * 100 : 100;
    progressFill.style.setProperty('--help-progress', `${pct}%`);
  };

  track.addEventListener('pointerdown', (e) => {
    dragging = true;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.classList.add('help-carousel-dragging');
  });
  track.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    track.scrollLeft = startScroll - (e.clientX - startX);
  });
  const end = () => { dragging = false; track.classList.remove('help-carousel-dragging'); };
  track.addEventListener('pointerup', end);
  track.addEventListener('pointercancel', end);
  track.addEventListener('pointerleave', end);
  track.addEventListener('dragstart', (e) => e.preventDefault());
  track.addEventListener('scroll', updateProgress, { passive: true });

  updateProgress();
}

export default function decorate(block) {
  const rows = [...block.children];

  const track = document.createElement('ul');
  track.className = 'help-carousel-track';

  rows.forEach((row) => {
    const cells = [...row.children];
    const iconCell = cells[0];
    const textCell = cells[1] || cells[0];

    const li = document.createElement('li');
    li.className = 'help-carousel-card';

    // Icon: use an authored image if present, else map the text key to an SVG.
    const iconWrap = document.createElement('span');
    iconWrap.className = 'help-carousel-icon';
    const img = iconCell && iconCell.querySelector('img, svg');
    if (img) {
      iconWrap.append(img);
    } else {
      const key = (iconCell ? iconCell.textContent : '').trim().toLowerCase();
      iconWrap.innerHTML = ICONS[key] || ICONS.help;
    }
    li.append(iconWrap);

    const body = document.createElement('div');
    body.className = 'help-carousel-body';
    if (textCell) {
      [...textCell.children].forEach((node) => body.append(node));
    }
    li.append(body);

    track.append(li);
  });

  // Progress bar
  const progress = document.createElement('div');
  progress.className = 'help-carousel-progress';
  const fill = document.createElement('span');
  fill.className = 'help-carousel-progress-fill';
  progress.append(fill);

  block.textContent = '';
  block.append(track, progress);

  bindDrag(track, fill);
}
