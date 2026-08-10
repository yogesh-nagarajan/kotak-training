import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the hero-video block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  // model order: subtitle, text (richtext), link, linkText, video
  const [subtitleCell, textCell, linkCell, linkTextCell, videoCell] = rows
    .map((row) => row.firstElementChild);

  const content = document.createElement('div');
  content.className = 'hero-video-content';

  // subtitle
  const subtitleText = subtitleCell?.textContent.trim();
  if (subtitleText) {
    const subtitle = document.createElement('p');
    subtitle.className = 'hero-video-subtitle';
    subtitle.textContent = subtitleText;
    moveInstrumentation(rows[0], subtitle);
    content.append(subtitle);
  }

  // rich text: title (heading) + feature list (ul/ol). Trailing paragraphs are
  // treated as a note and moved below the call-to-action.
  const noteParagraphs = [];
  if (textCell) {
    moveInstrumentation(rows[1], content);
    textCell.querySelector('h1, h2, h3, h4, h5, h6')?.classList.add('hero-video-title');
    textCell.querySelector('ul, ol')?.classList.add('hero-video-features');
    [...textCell.children].forEach((el) => {
      if (el.tagName === 'P') {
        el.classList.add('hero-video-note');
        noteParagraphs.push(el);
      } else {
        content.append(el);
      }
    });
  }

  // call-to-action button (link + label)
  const linkAnchor = linkCell?.querySelector('a');
  const href = linkAnchor?.getAttribute('href');
  const label = (linkTextCell?.textContent || linkAnchor?.textContent || '').trim();
  if (href && label) {
    const cta = document.createElement('a');
    cta.className = 'button primary hero-video-cta';
    cta.href = href;
    cta.textContent = label;
    const target = linkAnchor.getAttribute('target');
    if (target && target !== 'undefined') cta.target = target;
    moveInstrumentation(rows[2], cta);
    content.append(cta);
  }

  // note paragraphs render after the call-to-action
  noteParagraphs.forEach((p) => content.append(p));

  // background video url (authored as plain text or a link)
  const videoUrl = (
    videoCell?.querySelector('a')?.getAttribute('href')
    || videoCell?.textContent
    || ''
  ).trim();

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
