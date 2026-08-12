/*
 * Video Highlight block
 *
 * Two columns:
 *   Left  — a clickable video card (poster + play button). Clicking opens a
 *           modal popup with the YouTube embed; the video plays in the popup.
 *           The YouTube embed's own title bar opens YouTube in a new tab
 *           (native embed behaviour).
 *   Right — a content box: heading + image + descriptive text.
 *
 * Authored structure — one row, two cells:
 *   cell 1 (video)   -> <a href="youtube-url"> label </a>, <picture> poster
 *   cell 2 (content) -> <h2> heading, <picture> image, <p> text
 *
 * @param {Element} block the video-highlight block element
 */

function youTubeId(url) {
  try {
    const u = new URL(url);
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    const parts = u.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  } catch (e) {
    return '';
  }
}

function openModal(videoId) {
  const overlay = document.createElement('div');
  overlay.className = 'video-highlight-modal';
  overlay.innerHTML = `
    <div class="video-highlight-modal-inner">
      <button type="button" class="video-highlight-close" aria-label="Close video">&times;</button>
      <div class="video-highlight-embed">
        <iframe
          src="https://www.youtube.com/embed/${videoId}"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen></iframe>
      </div>
    </div>`;

  function closeModal() {
    overlay.remove();
    document.body.style.overflow = '';
    // eslint-disable-next-line no-use-before-define
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) {
    if (e.key === 'Escape') closeModal();
  }

  overlay.querySelector('.video-highlight-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', onKey);

  document.body.append(overlay);
  document.body.style.overflow = 'hidden';
}

export default function decorate(block) {
  const row = block.firstElementChild;
  const cells = row ? [...row.children] : [];
  const videoCell = cells[0];
  const contentCell = cells[1];

  // --- Left: clickable video card ---
  if (videoCell) {
    videoCell.className = 'video-highlight-video';
    const link = videoCell.querySelector('a');
    const videoId = youTubeId(link ? link.href : '');
    const poster = videoCell.querySelector('picture');
    const label = (link && link.textContent.trim()) || 'Play video';

    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'video-highlight-play';
    card.setAttribute('aria-label', label);
    if (poster) {
      const posterImg = poster.querySelector('img');
      if (posterImg) {
        if (!posterImg.getAttribute('width')) posterImg.setAttribute('width', '1000');
        if (!posterImg.getAttribute('height')) posterImg.setAttribute('height', '480');
        posterImg.setAttribute('loading', 'lazy');
      }
      card.append(poster);
    }

    const icon = document.createElement('span');
    icon.className = 'video-highlight-play-icon';
    card.append(icon);

    card.addEventListener('click', () => openModal(videoId));

    videoCell.textContent = '';
    videoCell.append(card);
  }

  // --- Right: content box ---
  if (contentCell) {
    contentCell.className = 'video-highlight-content';
    const contentImg = contentCell.querySelector('img');
    if (contentImg) {
      if (!contentImg.getAttribute('width')) contentImg.setAttribute('width', '600');
      if (!contentImg.getAttribute('height')) contentImg.setAttribute('height', '360');
      contentImg.setAttribute('loading', 'lazy');
    }
  }
}
