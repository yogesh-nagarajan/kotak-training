/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the supermoney-content block.
 *
 * Runs on the long-form SEO content section (.SEOcontent that contains the
 * fees / cashback tables). Emits the whole body — headings, paragraphs, lists
 * and tables — as a single richtext cell so it renders as flowing content.
 *
 * Emitted table (matches blocks/supermoney-content/supermoney-content.js):
 *   Row 1: content (rich text)  -> <!-- field:content -->
 */
export default function parse(element, { document }) {
  const cell = [document.createComment(' field:content ')];

  // The inner wrapper holds the actual content; fall back to the section.
  const source = element.querySelector('.container, [class*="content"]') || element;

  // Collect meaningful content nodes in document order.
  const allowed = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'UL', 'OL', 'TABLE']);
  const seen = new Set();
  source.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, table').forEach((node) => {
    if (!allowed.has(node.tagName)) return;
    // Skip nodes nested inside another collected node (e.g. <li>, table cells).
    if (node.closest('table') && node.tagName !== 'TABLE') return;
    if (node.parentElement && node.parentElement.closest('ul, ol') && node.tagName !== 'UL' && node.tagName !== 'OL') return;
    if (seen.has(node)) return;

    const text = node.textContent.replace(/\s+/g, ' ').trim();
    if (!text && node.tagName !== 'TABLE') return;

    if (node.tagName === 'TABLE') {
      // Clean the table: keep only rows/cells with a plain structure.
      const table = document.createElement('table');
      node.querySelectorAll('tr').forEach((tr) => {
        const newTr = document.createElement('tr');
        tr.querySelectorAll('th, td').forEach((td) => {
          const cellEl = document.createElement(td.tagName === 'TH' ? 'th' : 'td');
          // Preserve nested lists inside a cell; otherwise flatten to text.
          const innerList = td.querySelector('ul, ol');
          if (innerList) {
            cellEl.appendChild(innerList.cloneNode(true));
          } else {
            cellEl.textContent = td.textContent.replace(/\s+/g, ' ').trim();
          }
          newTr.appendChild(cellEl);
        });
        if (newTr.children.length) table.appendChild(newTr);
      });
      if (table.querySelector('tr')) cell.push(table);
      seen.add(node);
      return;
    }

    if (node.tagName === 'UL' || node.tagName === 'OL') {
      const list = document.createElement(node.tagName === 'OL' ? 'ol' : 'ul');
      node.querySelectorAll(':scope > li').forEach((li) => {
        const newLi = document.createElement('li');
        const a = li.querySelector('a');
        if (a) {
          const na = document.createElement('a');
          na.href = a.getAttribute('href') || '#';
          na.textContent = li.textContent.replace(/\s+/g, ' ').trim();
          newLi.appendChild(na);
        } else {
          newLi.textContent = li.textContent.replace(/\s+/g, ' ').trim();
        }
        list.appendChild(newLi);
      });
      if (list.children.length) cell.push(list);
      seen.add(node);
      return;
    }

    // Heading or paragraph.
    const el = document.createElement(node.tagName.toLowerCase());
    el.textContent = text;
    cell.push(el);
    seen.add(node);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'supermoney-content', cells: [[cell]] });
  element.replaceWith(block);
}
