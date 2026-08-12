/*
 * Carousel block
 *
 * Authored structure — one row per slide, two cells:
 *   row (slide)
 *     cell 1 -> <picture> full-bleed background image
 *     cell 2 -> <h1> heading, <p> body copy, <p><strong><a></a></strong></p> CTA
 *
 * Decorated structure:
 *   .carousel[role="region"]
 *     .carousel-slides (ul)
 *       li.carousel-slide
 *         .carousel-slide-image    -> background photo
 *         .carousel-slide-content  -> heading + copy + CTA (left-aligned overlay)
 *     .carousel-nav-buttons (prev / next — no background, dark chevrons)
 *     .carousel-dots (one indicator per slide)
 *
 * @param {Element} block the carousel block element
 */

let carouselId = 0;

function showSlide(block, index) {
  const track = block.querySelector('.carousel-slides');
  const slides = block.querySelectorAll('.carousel-slide');
  const dots = block.querySelectorAll('.carousel-dot');
  const total = slides.length;
  // wrap around
  const next = (index + total) % total;

  // Slide the track horizontally so the current slide moves out and the next in.
  if (track) track.style.transform = `translateX(-${next * 100}%)`;

  slides.forEach((slide, i) => {
    const hidden = i !== next;
    slide.classList.toggle('carousel-slide-active', !hidden);
    // Use `inert` so off-screen slides are removed from the a11y tree AND tab
    // order together — avoids the "aria-hidden element contains focusable
    // descendant" violation that a bare aria-hidden would cause.
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
 * Auto-advance the carousel every AUTOPLAY_MS. Pauses on hover/focus.
 * Returns a `reset()` used by the manual controls so the current slide always
 * gets its full dwell time after a manual navigation.
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

function bindControls(block, reset = () => {}) {
  const prev = block.querySelector('.carousel-nav-prev');
  const next = block.querySelector('.carousel-nav-next');
  const current = () => parseInt(block.dataset.activeSlide || '0', 10);

  prev?.addEventListener('click', () => { showSlide(block, current() - 1); reset(); });
  next?.addEventListener('click', () => { showSlide(block, current() + 1); reset(); });

  block.querySelectorAll('.carousel-dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(block, parseInt(dot.dataset.index, 10));
      reset();
    });
  });
}

export default function decorate(block) {
  carouselId += 1;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');
  block.setAttribute('aria-label', `Carousel ${carouselId}`);

  const rows = [...block.children];

  const slidesList = document.createElement('ul');
  slidesList.className = 'carousel-slides';

  rows.forEach((row, i) => {
    const slide = document.createElement('li');
    slide.className = 'carousel-slide';
    slide.dataset.index = i;
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'Slide');
    slide.setAttribute('aria-label', `Slide ${i + 1} of ${rows.length}`);

    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture, img'));
    const contentCell = cells.find((c) => c !== imageCell && c.textContent.trim())
      || cells.find((c) => c !== imageCell);

    if (imageCell) {
      imageCell.className = 'carousel-slide-image';
      const img = imageCell.querySelector('img');
      if (img) {
        if (!img.getAttribute('alt')) img.setAttribute('alt', '');
        // Reserve space (no CLS): default banner ratio 1910x640.
        if (!img.getAttribute('width')) img.setAttribute('width', '1910');
        if (!img.getAttribute('height')) img.setAttribute('height', '640');
        // First slide is the LCP image -> eager; the rest lazy.
        img.setAttribute('loading', i === 0 ? 'eager' : 'lazy');
        if (i === 0) img.setAttribute('fetchpriority', 'high');
      }
      slide.append(imageCell);
    }

    if (contentCell) {
      contentCell.className = 'carousel-slide-content';
      // Accessibility: keep a single page H1 (first slide); demote later slide
      // headings to H2 so heading levels never skip (H1 -> H2 -> H3 ...).
      if (i > 0) {
        contentCell.querySelectorAll('h1').forEach((h1) => {
          const h2 = document.createElement('h2');
          h2.className = h1.className;
          while (h1.firstChild) h2.append(h1.firstChild);
          h1.replaceWith(h2);
        });
      }
      slide.append(contentCell);
    }

    slidesList.append(slide);
  });

  block.textContent = '';
  block.append(slidesList);

  // Navigation only makes sense with more than one slide.
  if (rows.length > 1) {
    const nav = document.createElement('div');
    nav.className = 'carousel-nav-buttons';
    nav.innerHTML = `
      <button type="button" class="carousel-nav-prev" aria-label="Previous slide"></button>
      <button type="button" class="carousel-nav-next" aria-label="Next slide"></button>`;
    block.append(nav);

    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    dots.setAttribute('role', 'tablist');
    dots.setAttribute('aria-label', 'Choose slide to display');
    rows.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.dataset.index = i;
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Show slide ${i + 1}`);
      dots.append(dot);
    });
    block.append(dots);

    const resetAutoplay = startAutoplay(block);
    bindControls(block, resetAutoplay);
  }

  showSlide(block, 0);
}
