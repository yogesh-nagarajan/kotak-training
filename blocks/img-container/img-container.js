const FIELD_PREFIX = 'field:';

/** @returns {string|null} the field name for a `<!-- field:NAME -->` comment */
function markerName(node) {
  if (node.nodeType !== Node.COMMENT_NODE) return null;
  const value = node.nodeValue.trim();
  return value.startsWith(FIELD_PREFIX) ? value.slice(FIELD_PREFIX.length).trim() : null;
}

/**
 * Builds a map of field name -> owning nodes for every `<!-- field:NAME -->`
 * marker in the block. Crosswalk-authored content prefixes each field's content
 * with such a comment. Grouped fields (e.g. `link` + `link_newTab`) share a
 * single cell, so a cell can contain several markers, and AEM's block
 * decoration may wrap a cell's contents in a `<p>` — pushing the markers one
 * level deeper. We therefore search each cell recursively for markers; each
 * marker owns the sibling nodes that follow it up to the next marker.
 * @param {Element[]} cells the flattened list of block cells
 * @returns {Object<string, {nodes: Node[]}>}
 */
function collectFields(cells) {
  const fields = {};
  const walk = (parent) => {
    let current = null;
    [...parent.childNodes].forEach((node) => {
      const name = markerName(node);
      if (name) {
        current = { nodes: [] };
        fields[name] = current;
      } else if (current) {
        current.nodes.push(node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // no marker seen yet at this level: descend in case decoration wrapped
        // the markers inside a child element (e.g. a <p>)
        walk(node);
      }
    });
  };
  cells.forEach((cell) => walk(cell));
  return fields;
}

/**
 * loads and decorates the img-container block
 * @param {Element} block The img-container block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Flatten every cell across the delivered rows. Crosswalk emits a single row
  // whose cells carry `field:NAME` markers; hand-authored drafts emit separate
  // rows for text and image. Both collapse to a flat list of cells here.
  const cells = rows.flatMap((row) => [...row.children]);
  const fields = collectFields(cells);
  const hasMarkers = Object.keys(fields).length > 0;

  // helpers to read a marked field's content
  const nodesOf = (name) => (fields[name] ? fields[name].nodes : []);
  const elementOf = (name, selector) => {
    const owner = fields[name];
    if (!owner) return null;
    const matches = (n) => n.nodeType === Node.ELEMENT_NODE
      && (!selector || n.matches(selector) || n.querySelector(selector));
    const match = owner.nodes.find(matches);
    if (!match) return null;
    return selector && !match.matches(selector) ? match.querySelector(selector) : match;
  };
  const textOf = (name) => nodesOf(name)
    .map((n) => n.textContent || '')
    .join(' ')
    .trim();

  // Resolve content from field markers when present, otherwise fall back to
  // positional/heuristic parsing so legacy hand-authored content still renders.
  const image = hasMarkers
    ? elementOf('image', 'picture, img')
    : (cells.find((cell) => cell.querySelector('picture, img')) || {}).querySelector?.('picture, img');
  const textNodes = hasMarkers
    ? nodesOf('text')
    : cells
      .filter((cell) => !cell.querySelector('picture, img') && cell.querySelector('h1, h2, h3, h4, h5, h6, p'))
      .flatMap((cell) => [...cell.children]);

  const alt = textOf('imageAlt');
  const imageTitle = textOf('imageTitle');
  const alignment = textOf('layout_alignment').toLowerCase();
  const cssClass = textOf('layout_class');
  const linkAnchor = elementOf('link', 'a');
  const linkHref = linkAnchor ? linkAnchor.getAttribute('href') : '';
  const openNewTab = ['true', 'yes', 'on', '1'].includes(textOf('link_newTab').toLowerCase());

  // text column: flatten authored heading/paragraphs directly into the wrapper
  const text = document.createElement('div');
  text.className = 'img-container-text';
  textNodes
    .filter((n) => n.nodeType === Node.ELEMENT_NODE)
    .forEach((el) => text.append(el));

  // media column
  const media = document.createElement('div');
  media.className = 'img-container-media';
  if (image) {
    const img = image.tagName === 'IMG' ? image : image.querySelector('img');
    if (img) {
      if (alt) img.setAttribute('alt', alt);
      if (imageTitle) img.setAttribute('title', imageTitle);
    }

    // wrap the image in a link when a URL is authored, otherwise append as-is
    if (linkHref) {
      const anchor = document.createElement('a');
      anchor.className = 'img-container-link';
      anchor.href = linkHref;
      if (linkAnchor && linkAnchor.title) anchor.title = linkAnchor.title;
      else if (imageTitle) anchor.title = imageTitle;
      if (openNewTab) {
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
      }
      anchor.append(image);
      media.append(anchor);
    } else {
      media.append(image);
    }
  } else if (hasMarkers) {
    // author mode with no image selected yet: show a placeholder so the block
    // stays visible and selectable in the editor
    const placeholder = document.createElement('div');
    placeholder.className = 'img-container-placeholder';
    placeholder.textContent = 'Select an image';
    media.append(placeholder);
  }

  // alignment / position modifier (default center)
  const align = ['left', 'right', 'center'].includes(alignment) ? alignment : 'center';
  block.classList.add(`img-container-align-${align}`);

  // optional author-provided css class(es)
  if (cssClass) block.classList.add(...cssClass.split(/\s+/).filter(Boolean));

  // rebuild: text first, media second (CSS controls desktop order)
  block.replaceChildren();
  if (text.children.length) block.append(text);
  if (media.children.length) block.append(media);
}
