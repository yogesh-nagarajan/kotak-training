import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the visacard block
 * @param {Element} block The visacard block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  // model order: image, imageAlt, eyebrow, text (richtext), link, linkText
  const [imageCell, imageAltCell, eyebrowCell, textCell, linkCell, linkTextCell] = rows
    .map((row) => row.firstElementChild);

  // ----- media column: video (mp4) or image -----
  const media = document.createElement('div');
  media.className = 'visacard-media';
  const picture = imageCell?.querySelector('picture');
  const img = imageCell?.querySelector('img');
  // a background video may be authored as a link or plain-text URL ending in .mp4
  const videoUrl = (
    imageCell?.querySelector('a[href$=".mp4"]')?.getAttribute('href')
    || (/\.mp4(\?|$)/i.test(imageCell?.textContent.trim() || '') ? imageCell.textContent.trim() : '')
  );
  if (videoUrl) {
    const video = document.createElement('video');
    video.className = 'visacard-video';
    video.muted = true;
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    if (img?.getAttribute('src')) video.setAttribute('poster', img.getAttribute('src'));
    const source = document.createElement('source');
    source.src = videoUrl;
    source.type = 'video/mp4';
    video.append(source);
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
    moveInstrumentation(rows[2], eyebrow);
    content.append(eyebrow);
  }

  // rich text: heading + description, plus an optional final paragraph that
  // holds a secondary link (e.g. "Existing Customer? Upgrade now"). Paragraphs
  // that contain a link are held back and rendered after the call-to-action.
  const secondaryParagraphs = [];
  if (textCell) {
    moveInstrumentation(rows[3], content);
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
    moveInstrumentation(rows[4], cta);
    content.append(cta);
  }

  // secondary line renders after the call-to-action
  secondaryParagraphs.forEach((p) => content.append(p));

  block.textContent = '';
  // content first (text column on the left), then the card image on the right
  block.append(content);
  if (media.childElementCount) block.append(media);
}
