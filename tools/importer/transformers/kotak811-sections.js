/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Kotak811 section breaks + section metadata.
 *
 * Runs in afterTransform ONLY (after block parsers have replaced their source
 * <section> elements with block tables). At that point the direct children of
 * `main.Credit_card.SuperMoney_main__c7k8L` are the ordered content groups of
 * the page (block tables for parsed sections, original <section> elements for
 * default-content sections). Their DOM order matches the original 14 content
 * sections one-to-one, because parsers use element.replaceWith(block) in place.
 *
 * What it does:
 *   1. Inserts an <hr> before every non-first content group -> 13 section
 *      breaks for the 14 content sections (EDS `---` separators).
 *   2. Appends a "Section Metadata" block to the styled sections so the EDS
 *      section container gets the right background styling:
 *        - index 8 ("How it works")      -> Style: accent
 *        - index 9 ("How to get started") -> Style: grey
 *      Hero sections (index 0 and 11) intentionally receive NO section
 *      metadata: their backgrounds are block-intrinsic (full-bleed banner /
 *      lifestyle photo), not section-container styling.
 *
 * Styling source: This project's tools/importer/page-templates.json stores
 * section styling under blocks[].section (there is no top-level
 * template.sections array). The style-by-index map below is derived from
 * payload.template.blocks entries that carry a `section` property, reading the
 * 1-based `:nth-of-type(N)` from each instance selector (verified in
 * page-templates.json):
 *   - section-how-it-works      -> section:nth-of-type(9)  -> index 8 -> accent
 *   - section-how-to-get-started-> section:nth-of-type(10) -> index 9 -> grey
 *
 * Container selector `main.Credit_card.SuperMoney_main__c7k8L` verified in
 * migration-work/cleaned.html (14 direct <section> children).
 *
 * Note on validation: the automatic section-validation block only runs for
 * transformers that reference `template.sections` (an array of >=2). This
 * project uses `blocks[].section` instead, so that block is not emitted;
 * confirm correctness via the "Elements added" report instead — expect
 * hr (x13) plus two Section Metadata tables (table x2 with their tr/th/td/p).
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const MAIN_SELECTOR = 'main.Credit_card.SuperMoney_main__c7k8L';

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const doc = element.ownerDocument || (payload && payload.document) || document;

    const container = element.querySelector(MAIN_SELECTOR);
    if (!container) return;

    // Snapshot the content groups before mutating so element references stay
    // stable while we insert <hr>/metadata around them.
    const groups = Array.from(container.children);
    if (groups.length === 0) return;

    // Build a style-by-index map from template blocks that carry a `section`
    // property (accent / grey). Index = (1-based nth-of-type in selector) - 1.
    const styleByIndex = {};
    const blocks = (payload && payload.template && payload.template.blocks) || [];
    blocks.forEach((block) => {
      if (!block || !block.section) return;
      (block.instances || []).forEach((selector) => {
        const matches = [...String(selector).matchAll(/:nth-of-type\((\d+)\)/g)];
        if (matches.length === 0) return;
        const nth = parseInt(matches[matches.length - 1][1], 10);
        if (!Number.isNaN(nth)) styleByIndex[nth - 1] = block.section;
      });
    });

    groups.forEach((group, index) => {
      // Section break before every content group except the first.
      if (index > 0) {
        group.before(doc.createElement('hr'));
      }

      // Section Metadata block for styled sections (appended within the same
      // section, i.e. after the group content but before the next <hr>).
      const style = styleByIndex[index];
      if (style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { Style: style },
        });
        group.after(sectionMetadata);
      }
    });
  }
}
