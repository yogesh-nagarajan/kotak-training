import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const AUTOPLAY_INTERVAL = 5000;

/**
 * Build a single slide element from an authored row.
 * Expected cell order: image, imageAlt, text (richtext), link, linkText
 * @param {Element} row The authored row element
 * @returns {Element} The decorated slide
 */
function buildSlide(row) {
  const cells = [...row.children];
  const [imageCell, altCell, textCell, linkCell, linkTextCell] = cells;

  const slide = document.createElement('div');
  slide.className = 'hero-carousel-slide';
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');
  moveInstrumentation(row, slide);

  // background image (full-bleed behind the content)
  const img = imageCell?.querySelector('img');
  if (img) {
    const alt = (altCell?.textContent || img.getAttribute('alt') || '').trim();
    const picture = createOptimizedPicture(img.src, alt, false, [{ width: '1600' }]);
    const image = document.createElement('div');
    image.className = 'hero-carousel-image';
    image.append(picture);
    slide.append(image);
  }

  // text content: heading + description
  const content = document.createElement('div');
  content.className = 'hero-carousel-content';
  if (textCell) {
    textCell.querySelector('h1, h2, h3, h4, h5, h6')?.classList.add('hero-carousel-title');
    while (textCell.firstElementChild) content.append(textCell.firstElementChild);
  }

  // call-to-action button (link + optional label override)
  const linkAnchor = linkCell?.querySelector('a');
  const href = linkAnchor?.getAttribute('href');
  const label = (linkTextCell?.textContent || linkAnchor?.textContent || '').trim();
  if (href && label) {
    const cta = document.createElement('a');
    cta.className = 'button primary hero-carousel-cta';
    cta.href = href;
    cta.textContent = label;
    const target = linkAnchor.getAttribute('target');
    if (target && target !== 'undefined') cta.target = target;
    content.append(cta);
  }

  if (content.children.length) slide.append(content);
  return slide;
}

/**
 * loads and decorates the hero-carousel block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const slides = rows.map(buildSlide);

  const track = document.createElement('div');
  track.className = 'hero-carousel-track';
  slides.forEach((slide) => track.append(slide));

  block.textContent = '';
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  block.setAttribute('aria-label', 'Hero carousel');
  block.append(track);

  // a single slide needs no controls or auto-play
  if (slides.length <= 1) return;

  let current = 0;
  let timer;

  // navigation dots (click handlers attached once behavior is defined below)
  const nav = document.createElement('div');
  nav.className = 'hero-carousel-dots';
  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', 'Choose slide to display');
  const dots = slides.map((slide, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero-carousel-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    nav.append(dot);
    return dot;
  });

  // previous / next arrows
  const makeArrow = (dir, label) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `hero-carousel-arrow hero-carousel-arrow-${dir}`;
    btn.setAttribute('aria-label', label);
    return btn;
  };
  const prev = makeArrow('prev', 'Previous slide');
  const next = makeArrow('next', 'Next slide');

  block.append(prev, next, nav);

  function setActive(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', i !== current ? 'true' : 'false');
      slide.querySelectorAll('a').forEach((a) => {
        if (i !== current) a.setAttribute('tabindex', '-1');
        else a.removeAttribute('tabindex');
      });
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
      dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
  }

  function stopAutoplay() {
    clearInterval(timer);
  }

  function startAutoplay() {
    timer = setInterval(() => setActive(current + 1), AUTOPLAY_INTERVAL);
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // wire up controls
  dots.forEach((dot, i) => dot.addEventListener('click', () => {
    setActive(i);
    resetAutoplay();
  }));
  prev.addEventListener('click', () => {
    setActive(current - 1);
    resetAutoplay();
  });
  next.addEventListener('click', () => {
    setActive(current + 1);
    resetAutoplay();
  });

  // auto-play, paused on hover/focus for accessibility
  block.addEventListener('mouseenter', stopAutoplay);
  block.addEventListener('mouseleave', startAutoplay);
  block.addEventListener('focusin', stopAutoplay);
  block.addEventListener('focusout', startAutoplay);

  setActive(0);
  startAutoplay();
}
