import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the visacard block
 * @param {Element} block The visacard block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  // model order: image, video, imageAlt, eyebrow, text (richtext), link, linkText
  const [imageCell, videoCell, imageAltCell, eyebrowCell, textCell, linkCell, linkTextCell] = rows
    .map((row) => row.firstElementChild);

  // ----- media column: video (mp4) or image -----
  const media = document.createElement('div');
  media.className = 'visacard-media';
  const picture = imageCell?.querySelector('picture');
  const img = imageCell?.querySelector('img');
  // a background video may be authored as a link or plain-text URL ending in .mp4
  const videoUrl = (
    videoCell?.querySelector('a[href$=".mp4"]')?.getAttribute('href')
    || (/\.mp4(\?|$)/i.test(videoCell?.textContent.trim() || '') ? videoCell.textContent.trim() : '')
  );
  if (videoUrl) {
    // static image (shown on mobile) + animated video (shown on desktop),
    // toggled via CSS so mobile matches the source page's static card
    const still = picture || img;
    if (still) {
      still.classList.add('visacard-still');
      media.append(still);
    }
    const video = document.createElement('video');
    video.className = 'visacard-video';
    video.muted = true;
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'none');
    if (img?.getAttribute('src')) video.setAttribute('poster', img.getAttribute('src'));
    // only load/play the video on desktop; on mobile it is hidden, so avoid the
    // (multi-MB) download entirely by not attaching a source until desktop matches
    const desktop = window.matchMedia('(min-width: 900px)');
    const enableVideo = () => {
      if (video.querySelector('source')) return;
      const source = document.createElement('source');
      source.src = videoUrl;
      source.type = 'video/mp4';
      video.append(source);
      video.setAttribute('autoplay', '');
      video.load();
      video.play?.().catch(() => {});
    };
    if (desktop.matches) enableVideo();
    desktop.addEventListener('change', (e) => { if (e.matches) enableVideo(); });
    media.append(video);
  } else if (picture) {
    media.append(picture);
  } else if (img) {
    media.append(img);
  }
  const altText = imageAltCell?.textContent.trim();
  const mediaImg = media.querySelector('img');
  if (altText && mediaImg) mediaImg.alt = altText;

  // ----- content column -----
  const content = document.createElement('div');
  content.className = 'visacard-content';

  // eyebrow
  const eyebrowText = eyebrowCell?.textContent.trim();
  if (eyebrowText) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'visacard-eyebrow';
    eyebrow.textContent = eyebrowText;
    moveInstrumentation(rows[3], eyebrow);
    content.append(eyebrow);
  }

  // rich text: heading + description, plus an optional final paragraph that
  // holds a secondary link (e.g. "Existing Customer? Upgrade now"). Paragraphs
  // that contain a link are held back and rendered after the call-to-action.
  const secondaryParagraphs = [];
  if (textCell) {
    moveInstrumentation(rows[4], content);
    textCell.querySelector('h1, h2, h3, h4, h5, h6')?.classList.add('visacard-title');
    [...textCell.children].forEach((el) => {
      if (el.tagName === 'P' && el.querySelector('a')) {
        el.classList.add('visacard-secondary');
        secondaryParagraphs.push(el);
      } else {
        if (el.tagName === 'P') el.classList.add('visacard-description');
        content.append(el);
      }
    });
  }

  // primary call-to-action button
  const ctaAnchor = linkCell?.querySelector('a');
  const ctaHref = ctaAnchor?.getAttribute('href');
  const ctaLabel = (linkTextCell?.textContent || ctaAnchor?.textContent || '').trim();
  if (ctaHref && ctaLabel) {
    const cta = document.createElement('a');
    cta.className = 'button primary visacard-cta';
    cta.href = ctaHref;
    cta.textContent = ctaLabel;
    const target = ctaAnchor.getAttribute('target');
    if (target && target !== 'undefined') cta.target = target;
    moveInstrumentation(rows[5], cta);
    content.append(cta);
  }

  // secondary line renders after the call-to-action
  secondaryParagraphs.forEach((p) => content.append(p));

  block.textContent = '';
  // content first (text column on the left), then the card image on the right
  block.append(content);
  if (media.childElementCount) {
    block.append(media);
    // slide the card in from the right when it scrolls into view (source page effect)
    media.classList.add('visacard-media-slide');
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    observer.observe(media);
  }
}
