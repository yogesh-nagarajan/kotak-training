/*
 * Promo Carousel block
 *
 * A slim, image-only promo banner carousel (distinct from the hero carousel).
 * Each slide is a single banner image used across all breakpoints. Slides
 * cross-fade; dots below switch slides; click-drag / touch-swipe also works.
 *
 * Authored structure — one row per slide:
 *   row (slide)
 *     cell 1 -> <picture> banner image
 *
 * Decorated structure:
 *   .promo-carousel
 *     ul.promo-carousel-slides
 *       li.promo-carousel-slide  (contains the <picture>)
 *     .promo-carousel-dots
 *
 * @param {Element} block the promo-carousel block element
 */

function showSlide(block, index) {
  const track = block.querySelector('.promo-carousel-slides');
  const slides = block.querySelectorAll('.promo-carousel-slide');
  const dots = block.querySelectorAll('.promo-carousel-dot');
  const total = slides.length;
  const next = (index + total) % total;

  // Slide the track horizontally so the current image moves out and the next in.
  if (track) track.style.transform = `translateX(-${next * 100}%)`;

  slides.forEach((slide, i) => {
    const hidden = i !== next;
    slide.classList.toggle('promo-carousel-slide-active', !hidden);
    // `inert` keeps the a11y tree and tab order in sync for off-screen slides.
    if (hidden) {
      slide.setAttribute('inert', '');
      slide.setAttribute('aria-hidden', 'true');
    } else {
      slide.removeAttribute('inert');
      slide.removeAttribute('aria-hidden');
    }
  });
  dots.forEach((dot, i) => {
    dot.setAttribute('aria-selected', i === next);
    dot.setAttribute('tabindex', i === next ? '0' : '-1');
  });

  block.dataset.activeSlide = next;
}

const AUTOPLAY_MS = 5000;

/**
 * Auto-advance the promo carousel every AUTOPLAY_MS. Pauses on hover/focus.
 * Returns a `reset()` the manual controls call so the current slide always gets
 * its full dwell time after a manual navigation.
 * @param {Element} block the carousel block
 * @returns {Function} reset — restart the autoplay timer
 */
function startAutoplay(block) {
  const current = () => parseInt(block.dataset.activeSlide || '0', 10);
  let timer = null;

  const start = () => {
    if (timer) return;
    timer = setInterval(() => showSlide(block, current() + 1), AUTOPLAY_MS);
  };
  const stop = () => {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  };

  block.addEventListener('mouseenter', stop);
  block.addEventListener('mouseleave', start);
  block.addEventListener('focusin', stop);
  block.addEventListener('focusout', start);

  start();
  return () => { stop(); start(); };
}

/**
 * Enable pointer/touch swipe: dragging left -> next slide, right -> previous.
 * Uses Pointer Events so mouse drag and touch swipe share one code path.
 * @param {Element} block the carousel block
 * @param {Function} reset restart the autoplay timer after a manual swipe
 */
function bindSwipe(block, reset = () => {}) {
  const SWIPE_THRESHOLD = 40; // px of horizontal travel needed to switch
  const track = block.querySelector('.promo-carousel-slides');
  if (!track) return;

  let startX = 0;
  let dragging = false;

  const current = () => parseInt(block.dataset.activeSlide || '0', 10);

  const onDown = (e) => {
    dragging = true;
    startX = e.clientX;
    track.classList.add('promo-carousel-dragging');
  };

  const onUp = (e) => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('promo-carousel-dragging');
    const dx = e.clientX - startX;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    // drag left (negative dx) -> next; drag right (positive dx) -> previous
    showSlide(block, dx < 0 ? current() + 1 : current() - 1);
    reset();
  };

  track.addEventListener('pointerdown', onDown);
  track.addEventListener('pointerup', onUp);
  track.addEventListener('pointercancel', () => { dragging = false; track.classList.remove('promo-carousel-dragging'); });
  // Prevent the browser from turning a horizontal drag into image-drag/scroll.
  track.addEventListener('dragstart', (e) => e.preventDefault());
}

export default function decorate(block) {
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');
  block.setAttribute('aria-label', 'Promotions');

  const rows = [...block.children];

  const slidesList = document.createElement('ul');
  slidesList.className = 'promo-carousel-slides';

  rows.forEach((row, i) => {
    const slide = document.createElement('li');
    slide.className = 'promo-carousel-slide';
    slide.dataset.index = i;
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'Slide');
    slide.setAttribute('aria-label', `Slide ${i + 1} of ${rows.length}`);

    // Single banner image per slide, used across all breakpoints.
    const pic = row.querySelector('picture');
    if (pic) {
      pic.classList.add('promo-carousel-image');
      const img = pic.querySelector('img');
      if (img) {
        if (!img.getAttribute('alt')) img.setAttribute('alt', '');
        if (!img.getAttribute('width')) img.setAttribute('width', '1600');
        if (!img.getAttribute('height')) img.setAttribute('height', '260');
        img.setAttribute('loading', 'lazy');
      }
      slide.append(pic);
    }

    slidesList.append(slide);
  });

  block.textContent = '';
  block.append(slidesList);

  if (rows.length > 1) {
    const resetAutoplay = startAutoplay(block);

    const dots = document.createElement('div');
    dots.className = 'promo-carousel-dots';
    dots.setAttribute('role', 'tablist');
    dots.setAttribute('aria-label', 'Choose promotion to display');
    rows.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'promo-carousel-dot';
      dot.dataset.index = i;
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Show slide ${i + 1}`);
      dot.addEventListener('click', () => { showSlide(block, i); resetAutoplay(); });
      dots.append(dot);
    });
    block.append(dots);

    // Allow click-drag / touch-swipe to change slides.
    bindSwipe(block, resetAutoplay);
  }

  showSlide(block, 0);
}
