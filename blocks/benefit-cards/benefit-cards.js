/*
 * Benefit Cards block
 *
 * A single component rendering 4 benefit cards (icon image + title + short
 * description). On desktop the row overlaps the bottom of the hero banner
 * above it; on tablet/mobile it becomes a horizontal slider (scroll-snap +
 * drag/swipe). One block = one JS/CSS pair, so it stays performant.
 *
 * Authored structure — one row per card, two cells:
 *   cell 1 -> <picture> icon image
 *   cell 2 -> <h3> title, <p> description
 *
 * @param {Element} block the benefit-cards block element
 */

function bindDrag(track) {
  let startX = 0;
  let startScroll = 0;
  let dragging = false;

  track.addEventListener('pointerdown', (e) => {
    dragging = true;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.classList.add('benefit-cards-dragging');
  });
  track.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    track.scrollLeft = startScroll - (e.clientX - startX);
  });
  const end = () => { dragging = false; track.classList.remove('benefit-cards-dragging'); };
  track.addEventListener('pointerup', end);
  track.addEventListener('pointercancel', end);
  track.addEventListener('pointerleave', end);
  track.addEventListener('dragstart', (e) => e.preventDefault());
}

/*
 * Fade the cards in on scroll — a dependency-free replacement for the
 * data-aos="fade-in" / data-aos-delay behaviour in the reference markup.
 * Cards start hidden (via CSS) and reveal once the row scrolls into view.
 */
function bindReveal(track) {
  // Mark JS-driven reveal as active. The hidden start state is scoped to this
  // class in CSS, so if JS never runs the cards stay fully visible.
  track.classList.add('benefit-cards-reveal');
  if (!('IntersectionObserver' in window)) {
    track.classList.add('benefit-cards-in');
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('benefit-cards-in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  observer.observe(track);
}

export default function decorate(block) {
  const track = document.createElement('ul');
  track.className = 'benefit-cards-track';
  // keyboard-focusable so the scrollable row can be moved with arrow keys
  track.setAttribute('tabindex', '0');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture, img'));
    const bodyCell = cells.find((c) => c !== imageCell) || cells[cells.length - 1];

    const li = document.createElement('li');
    li.className = 'benefit-cards-card';

    if (imageCell) {
      imageCell.className = 'benefit-cards-icon';
      const img = imageCell.querySelector('img');
      if (img) {
        if (!img.getAttribute('alt')) img.setAttribute('alt', '');
        if (!img.getAttribute('width')) img.setAttribute('width', '160');
        if (!img.getAttribute('height')) img.setAttribute('height', '94');
        img.setAttribute('loading', 'lazy');
      }
      li.append(imageCell);
    }
    if (bodyCell) {
      bodyCell.className = 'benefit-cards-body';
      li.append(bodyCell);
    }
    track.append(li);
  });

  block.textContent = '';
  block.append(track);

  bindDrag(track);
  bindReveal(track);
}
