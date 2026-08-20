/* global WebImporter */

/**
 * Parser for the local draft `.811-zero-hero-section` block → EDS
 * `811-zero-hero-section` block.
 *
 * The block MODEL has 5 fields that collapse into 3 field-groups (a
 * `reference` image field and its paired `imageAlt` text field render as a
 * single cell in Universal Editor). Every field-group MUST align with its own
 * block-table row, even when empty, otherwise the fields map to the wrong
 * cells:
 *
 *   Row 1 (header): block name ("811 Zero Hero Section")
 *   Row 2: Desktop Image (image + imageAlt)   — kept EMPTY (no live URL)
 *   Row 3: Mobile Image  (imageMobile + imageMobileAlt) — kept EMPTY (no live URL)
 *   Row 4: Text (richtext) — eyebrow <p> + <h1> + subtext <p> + CTA <p><a></p>
 *
 * The banner images are intentionally left empty so no external/live image URL
 * is baked into the content; authors attach DAM assets in the editor.
 *
 * @param {Element} el The `.811-zero-hero-section` source element
 * @param {Object} ctx Parser context ({ document })
 */
export default function parse(el, { document }) {
  const rows = Array.from(el.children);

  // Text row — the source row carrying headings/paragraphs/links (never the
  // image row). Gather its content into a single cell. Snapshot node
  // references first (createTable moves them into the table).
  const contentSourceRow = rows.find(
    (row) => row.querySelector('h1, h2, h3, h4, h5, h6, p, a'),
  );
  const contentCell = [];
  if (contentSourceRow) {
    Array.from(contentSourceRow.children).forEach((cell) => {
      Array.from(cell.children).forEach((node) => contentCell.push(node));
    });
  }

  // empty-block guard
  if (contentCell.length === 0) {
    el.replaceWith(...el.childNodes);
    return;
  }

  // One cell per model field-group. Image cells stay empty so no live URL is
  // written; every field still aligns with a column.
  const cells = [
    ['811 Zero Hero Section'],
    [''], // Desktop Image (image + imageAlt) — empty
    [''], // Mobile Image (imageMobile + imageMobileAlt) — empty
    [contentCell], // Text
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  el.replaceWith(table);
}
