import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Extract a video URL from an authored cell. Handles a DAM reference (link,
 * image, or plain text with the asset path) as well as a plain URL field.
 * @param {Element} cell
 * @returns {string}
 */
function readVideoCell(cell) {
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
 * Resolve the background video URL, preferring an absolute URL (reliable on the
 * published site) over the DAM reference (which renders in the editor but may
 * not be served by Edge Delivery).
 * @param {Element} damCell
 * @param {Element} urlCell
 * @returns {string}
 */
function resolveVideoUrl(damCell, urlCell) {
  const url = readVideoCell(urlCell);
  if (url) return url;
  return readVideoCell(damCell);
}

/**
 * loads and decorates the hero-video block
 *
 * The authoring model groups the foreground copy (pretitle, title, points, note)
 * into one cell via element grouping, followed by the CTA link cell and the
 * background video cell:
 *   Row 1: content group -> pretitle (p), title (p), points (ul/ol), note (p)
 *   Row 2: ctaLink (anchor, collapsed with ctaLinkText)
 *   Row 3: video (DAM reference)
 *   Row 4: videoUrl (absolute MP4 URL, preferred on the published site)
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const [contentCell, ctaCell, videoCell, videoUrlCell] = rows
    .map((row) => row.firstElementChild);

  const content = document.createElement('div');
  content.className = 'hero-video-content';

  // Foreground copy is a grouped cell: children arrive in authored order as
  // pretitle, title, points list, and note. Detect each by element type/position
  // so the block is resilient to authors omitting optional fields.
  if (contentCell) {
    moveInstrumentation(rows[0], content);
    const children = [...contentCell.children];
    const list = children.find((el) => el.tagName === 'UL' || el.tagName === 'OL');
    const paragraphs = children.filter((el) => el.tagName === 'P');

    // first paragraph -> pretitle, second -> title (rendered as a heading)
    const [pretitleEl, titleEl] = paragraphs;
    if (pretitleEl && pretitleEl.textContent.trim()) {
      pretitleEl.classList.add('hero-video-subtitle');
      content.append(pretitleEl);
    }
    if (titleEl && titleEl.textContent.trim()) {
      const title = document.createElement('h1');
      title.className = 'hero-video-title';
      title.textContent = titleEl.textContent.trim();
      content.append(title);
    }
    if (list) {
      list.classList.add('hero-video-features');
      content.append(list);
    }

    // any remaining paragraphs after pretitle/title are the note (rendered last,
    // after the CTA); tag them now and append below.
    const noteParagraphs = paragraphs.slice(2);

    // call-to-action button (link collapsed with its text)
    const linkAnchor = ctaCell?.querySelector('a');
    const href = linkAnchor?.getAttribute('href');
    const label = (linkAnchor?.textContent || '').trim();
    if (href && label) {
      const cta = document.createElement('a');
      cta.className = 'button primary hero-video-cta';
      cta.href = href;
      cta.textContent = label;
      const target = linkAnchor.getAttribute('target');
      if (target && target !== 'undefined') cta.target = target;
      moveInstrumentation(rows[1], cta);
      content.append(cta);
    }

    // note paragraphs render after the call-to-action
    if (noteParagraphs.length) {
      const note = document.createElement('div');
      note.className = 'hero-video-note';
      noteParagraphs.forEach((p) => note.append(p));
      content.append(note);
    }
  }

  // background video: prefer the absolute URL, fall back to the DAM reference
  const videoUrl = resolveVideoUrl(videoCell, videoUrlCell);

  block.textContent = '';
  block.append(content);

  if (videoUrl) {
    const video = document.createElement('video');
    video.className = 'hero-video-media';
    video.muted = true;
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    const source = document.createElement('source');
    source.src = videoUrl;
    source.type = 'video/mp4';
    video.append(source);
    block.append(video);
  }
}
