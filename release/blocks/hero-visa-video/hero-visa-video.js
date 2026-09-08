import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Read a URL from an authored cell, handling either a link/image reference or
 * a plain text URL.
 * @param {Element} cell
 * @returns {string}
 */
function readUrl(cell) {
  if (!cell) return '';
  return (
    cell.querySelector('a')?.getAttribute('href')
    || cell.querySelector('img')?.getAttribute('src')
    || cell.querySelector('source')?.getAttribute('src')
    || cell.textContent
    || ''
  ).trim();
}

/**
 * loads and decorates the hero-visa-video block
 *
 * Authoring model groups fields into four cells (via element grouping):
 *   Row 1: content group    -> pretitle (p), title (p), description (richtext)
 *   Row 2: primaryLink       -> anchor collapsed with primaryLinkText
 *   Row 3: secondary group   -> description (p), link (anchor collapsed w/ text)
 *   Row 4: media group       -> video (absolute MP4 URL), image (DAM reference)
 *
 * On desktop the video plays next to the content; on mobile the video is hidden
 * and the image renders below the content.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const [contentCell, primaryCell, secondaryCell, mediaCell] = rows
    .map((row) => row.firstElementChild);

  const content = document.createElement('div');
  content.className = 'hero-visa-video-content';

  // content group: pretitle (first p), title (second p), description (rest)
  if (contentCell) {
    moveInstrumentation(rows[0], content);
    const paragraphs = [...contentCell.children].filter((el) => el.tagName === 'P');
    const [pretitleEl, titleEl] = paragraphs;

    if (pretitleEl && pretitleEl.textContent.trim()) {
      pretitleEl.classList.add('hero-visa-video-pretitle');
      content.append(pretitleEl);
    }
    if (titleEl && titleEl.textContent.trim()) {
      const title = document.createElement('h1');
      title.className = 'hero-visa-video-title';
      title.textContent = titleEl.textContent.trim();
      content.append(title);
    }

    const descNodes = [...contentCell.children]
      .filter((el) => el !== pretitleEl && el !== titleEl);
    if (descNodes.length) {
      const desc = document.createElement('div');
      desc.className = 'hero-visa-video-description';
      descNodes.forEach((el) => desc.append(el));
      content.append(desc);
    }
  }

  // primary button (super A/c): link collapsed with its text
  const primaryAnchor = primaryCell?.querySelector('a');
  if (primaryAnchor) {
    const href = primaryAnchor.getAttribute('href');
    const label = primaryAnchor.textContent.trim();
    if (href && label) {
      const primary = document.createElement('a');
      primary.className = 'button primary hero-visa-video-primary';
      primary.href = href;
      primary.textContent = label;
      const target = primaryAnchor.getAttribute('target');
      if (target && target !== 'undefined') primary.target = target;
      moveInstrumentation(rows[1], primary);
      content.append(primary);
    }
  }

  // secondary action group: leading description text + link
  if (secondaryCell) {
    const secondaryText = [...secondaryCell.children]
      .filter((el) => el.tagName === 'P' && !el.querySelector('a'))
      .map((el) => el.textContent.trim())
      .find((text) => text);
    const secondaryAnchor = secondaryCell.querySelector('a');

    if (secondaryText || secondaryAnchor) {
      const secondary = document.createElement('p');
      secondary.className = 'hero-visa-video-secondary';
      moveInstrumentation(rows[2], secondary);
      if (secondaryText) secondary.append(document.createTextNode(`${secondaryText} `));
      if (secondaryAnchor) {
        const link = document.createElement('a');
        link.className = 'hero-visa-video-secondary-link';
        link.href = secondaryAnchor.getAttribute('href');
        link.textContent = secondaryAnchor.textContent.trim();
        const target = secondaryAnchor.getAttribute('target');
        if (target && target !== 'undefined') link.target = target;
        secondary.append(link);
      }
      content.append(secondary);
    }
  }

  // media group: video (desktop) + image (mobile / desktop fallback)
  const media = document.createElement('div');
  media.className = 'hero-visa-video-media';

  const img = mediaCell?.querySelector('img');
  const videoUrl = readUrl([...(mediaCell?.children || [])].find((el) => !el.querySelector('img')));
  const isDesktop = window.matchMedia('(min-width: 900px)').matches;

  if (videoUrl && isDesktop) {
    const video = document.createElement('video');
    video.className = 'hero-visa-video-player';
    video.muted = true;
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'none');
    const source = document.createElement('source');
    source.src = videoUrl;
    source.type = 'video/mp4';
    video.append(source);
    media.append(video);
  }

  if (img) {
    const picture = createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]);
    const pictureImg = picture.querySelector('img');
    pictureImg.className = 'hero-visa-video-image';
    moveInstrumentation(img, pictureImg);
    media.append(picture);
  }

  block.textContent = '';
  block.append(content);
  if (media.childElementCount) block.append(media);
}
