/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: img-container
 * Base block: img-container (single block, one row)
 * Source: local drafts (811-business, feature-811-home) + nri-home-loan-features
 * Generated: 2026-08-18
 *
 * xwalk single block. Exactly ONE row whose cells map positionally to the
 * model's field GROUPS. Model fields (blocks/img-container/_img-container.json
 * -> model "img-container"), in order:
 *   - text            (richtext)    -> col 1, field:text (heading + paragraph[s])
 *   - image           (reference)   -> col 2, field:image (<picture>/<img>)
 *   - imageAlt         (text)       -> COLLAPSED (Alt suffix)   -> <img alt="">
 *   - imageTitle       (text)       -> COLLAPSED (Title suffix) -> <img title="">
 *   - link            (aem-content) -> col 3, field:link (<a href>)
 *   - link_newTab     (boolean)     -> col 3, field:link_newTab (grouped w/ link)
 *   - layout_alignment (select)     -> col 4, field:layout_alignment (grouped)
 *   - layout_class    (text)        -> col 4, field:layout_class (grouped)
 * => ALWAYS 4 columns, one row: [text, image, link-group, layout-group].
 *
 * Column count MUST be identical (4) every time. xwalk maps cells to model
 * field groups positionally, so a field with no content still emits its column
 * as an EMPTY cell (empty string => empty <div>, no field hint). Dropping a
 * cell shifts every later field into the wrong column — that is the
 * "content isn't mapping to the model correctly" error. Fields that collapse by
 * suffix (imageAlt/Alt, imageTitle/Title) are NOT separate cells: they ride as
 * attributes on the image element.
 */

/**
 * Wrap cell content with a Universal Editor field hint comment placed BEFORE
 * the content. Grouped fields call this multiple times into the same fragment.
 */
function fieldHint(document, fieldName, content) {
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createComment(` field:${fieldName} `));
  if (Array.isArray(content)) {
    content.forEach((node) => {
      if (node) frag.appendChild(node);
    });
  } else if (content) {
    frag.appendChild(content);
  }
  return frag;
}

/** Append field-hint fragment(s) into a single grouped cell fragment. */
function groupCell(document, entries) {
  // entries: [{ name, content }] — only include entries that have content, but
  // always return a fragment (empty '' handled by caller when the whole group
  // is empty).
  const present = entries.filter((e) => {
    if (Array.isArray(e.content)) return e.content.length > 0;
    return !!e.content;
  });
  if (!present.length) return '';
  const frag = document.createDocumentFragment();
  present.forEach((e) => frag.appendChild(fieldHint(document, e.name, e.content)));
  return frag;
}

export default function parse(element, { document }) {
  // Scope to the inner content wrapper when present, otherwise the block itself.
  // In the rendered/decorated DOM this is the source; in the raw draft the block
  // holds a text row and an image row.
  const rows = Array.from(element.children);

  // --- image (field:image) + collapsed imageAlt/imageTitle ------------------
  // Prefer the decorated media wrapper, then any picture/img in the block.
  const imageEl = element.querySelector('.img-container-media picture')
    || element.querySelector('.img-container-media img')
    || element.querySelector('picture, img')
    || null;

  // Rebuild a clean <img> so alt/title collapse onto it and helper markup is
  // dropped. Keep <picture> sources when present.
  let imageCell = '';
  if (imageEl) {
    const img = imageEl.tagName === 'IMG' ? imageEl : imageEl.querySelector('img');
    // read alt/title that may already be on the source image
    const altText = (img && img.getAttribute('alt')) || '';
    const titleText = (img && img.getAttribute('title')) || '';
    if (img) {
      if (altText) img.setAttribute('alt', altText);
      else img.removeAttribute('alt');
      if (titleText) img.setAttribute('title', titleText);
    }
    imageCell = fieldHint(document, 'image', imageEl);
  }

  // --- text (field:text) ----------------------------------------------------
  // Everything that isn't the image: headings + paragraphs, in document order.
  const textWrapper = element.querySelector('.img-container-text');
  let textNodes = [];
  if (textWrapper) {
    textNodes = Array.from(textWrapper.children);
  } else {
    const imageRow = rows.find((row) => row.querySelector('picture, img'));
    rows.filter((row) => row !== imageRow).forEach((row) => {
      Array.from(row.children).forEach((cell) => {
        // a cell may be the text itself or wrap it in another div
        const kids = Array.from(cell.children);
        if (kids.length) kids.forEach((n) => textNodes.push(n));
      });
    });
  }
  // drop any node that is (or contains) the image so it isn't duplicated
  textNodes = textNodes.filter((n) => n && !n.querySelector?.('picture, img') && n.tagName !== 'PICTURE' && n.tagName !== 'IMG');
  const textCell = textNodes.length ? fieldHint(document, 'text', textNodes) : '';

  // --- link group (field:link + field:link_newTab) -------------------------
  const anchor = element.querySelector('.img-container-link, a[href]');
  let linkGroup = '';
  if (anchor && anchor.getAttribute('href')) {
    const link = document.createElement('a');
    link.setAttribute('href', anchor.getAttribute('href'));
    const linkText = (anchor.textContent || '').trim();
    if (linkText) link.textContent = linkText;
    const newTab = anchor.getAttribute('target') === '_blank';
    const newTabP = document.createElement('p');
    newTabP.textContent = newTab ? 'true' : 'false';
    linkGroup = groupCell(document, [
      { name: 'link', content: link },
      { name: 'link_newTab', content: newTabP },
    ]);
  }

  // --- layout group (field:layout_alignment + field:layout_class) ----------
  // Alignment is encoded on the block class (img-container-align-*); custom css
  // classes are any other extra classes on the block.
  const classes = Array.from(element.classList);
  const alignClass = classes.find((c) => c.startsWith('img-container-align-'));
  const alignment = alignClass ? alignClass.replace('img-container-align-', '') : '';
  const known = new Set(['img-container', 'block', alignClass]);
  const customClasses = classes.filter((c) => !known.has(c));

  const layoutEntries = [];
  if (alignment) {
    const alignP = document.createElement('p');
    alignP.textContent = alignment;
    layoutEntries.push({ name: 'layout_alignment', content: alignP });
  }
  if (customClasses.length) {
    const classP = document.createElement('p');
    classP.textContent = customClasses.join(' ');
    layoutEntries.push({ name: 'layout_class', content: classP });
  }
  const layoutGroup = groupCell(document, layoutEntries);

  // Empty-block guard: nothing at all -> unwrap so content isn't lost.
  if (!imageCell && !textCell && !linkGroup && !layoutGroup) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Fixed 4-column single row — never conditionally omit a cell.
  const cells = [[textCell, imageCell, linkGroup, layoutGroup]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'img-container', cells });
  element.replaceWith(block);
}
