/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Citibank section breaks + section metadata.
 *
 * Runs in beforeTransform and is driven by payload.template.sections.
 * Section selectors were verified against migration-work/cleaned.html
 * (all are direct children of <ui-dynamic-page>):
 *   section-1 Hero               -> ui-dynamic-widget:nth-of-type(4)
 *   section-2 Benefit highlights -> ui-dynamic-widget:nth-of-type(6)
 *   section-3 Terms footnote     -> ui-dynamic-widget:nth-of-type(7)
 *
 * Behaviour:
 *  - Insert an <hr> before every section except the first (expected: 2).
 *  - Create a Section Metadata block after a section only when section.style
 *    is set. All three sections have style === null, so none are created.
 *
 * IMPORTANT: This runs in beforeTransform (NOT afterTransform). The section
 * selectors use positional `ui-dynamic-widget:nth-of-type(N)`. Block parsers
 * (hero-product) replace whole widgets via element.replaceWith, which renumbers
 * the remaining widgets and invalidates these selectors. Inserting the <hr>
 * breaks in beforeTransform (while widget numbering is intact) keeps section
 * boundaries correct; the inserted <hr> elements are a different tag, so they
 * do not affect the nth-of-type counts the block parsers rely on.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

function findSectionElement(element, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (let i = 0; i < selectors.length; i += 1) {
    const sel = selectors[i];
    if (sel) {
      const el = element.querySelector(sel);
      if (el) return el;
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    const sections = (payload && payload.template && payload.template.sections) || [];
    if (sections.length > 1) {
      const doc = element.ownerDocument;
      // Process in reverse so inserted nodes never shift later lookups.
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const sectionEl = findSectionElement(element, section);
        if (sectionEl) {
          // Section Metadata block only when a style is defined (non-null/non-empty).
          if (section.style) {
            const styleValue = Array.isArray(section.style)
              ? section.style.join(', ')
              : section.style;
            const metaBlock = WebImporter.Blocks.createBlock(doc, {
              name: 'Section Metadata',
              cells: { style: styleValue },
            });
            sectionEl.after(metaBlock);
          }
          // Section break before every section except the first.
          if (i > 0) {
            const hr = doc.createElement('hr');
            sectionEl.before(hr);
          }
        }
      }
    }
  }
}
