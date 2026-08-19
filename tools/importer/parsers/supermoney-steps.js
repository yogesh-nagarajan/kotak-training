/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the supermoney-steps block ("How to get started?").
 *
 * Live structure:
 *   section > div.container > div[newBlackSection]
 *     > div (heading column)      -> h2 "How to get started?"
 *     > div (steps column)
 *         > div.flex > img + p    (one per step)
 *
 * Emitted table (matches blocks/supermoney-steps/supermoney-steps.js):
 *   Row 1: title                         -> <!-- field:title -->
 *   Row 2..N: one step = icon cell + text cell
 */
export default function parse(element, { document }) {
  const cells = [];

  const heading = element.querySelector('h1, h2, h3');
  const titleCell = [document.createComment(' field:title ')];
  const titleP = document.createElement('p');
  titleP.textContent = heading ? heading.textContent.replace(/\s+/g, ' ').trim() : 'How to get started?';
  titleCell.push(titleP);
  cells.push([titleCell]);

  // Each step is a small flex row: icon image + a paragraph.
  const steps = [...element.querySelectorAll('p')]
    .map((p) => {
      const row = p.closest('div');
      const img = row ? row.querySelector('img') : null;
      return { p, img };
    })
    .filter((s) => s.p.textContent.trim());

  steps.forEach(({ p, img }) => {
    const imageCell = [document.createComment(' field:image ')];
    if (img) imageCell.push(img);
    const bodyCell = [document.createComment(' field:text ')];
    const para = document.createElement('p');
    para.textContent = p.textContent.replace(/\s+/g, ' ').trim();
    bodyCell.push(para);
    cells.push([imageCell, bodyCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'supermoney-steps', cells });
  element.replaceWith(block);
}
