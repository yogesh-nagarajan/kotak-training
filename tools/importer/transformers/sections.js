/* eslint-disable */
/* global WebImporter */
/**
 * Section transformer: inserts <hr> separators between the page's top-level
 * block wrappers so the imported document renders as distinct EDS sections,
 * matching the original 4-section layout.
 *
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - the DOM element being transformed (document.body)
 * @param {Object} payload - { document, url, html, params, template }
 */
export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;
  const { document } = payload;

  // After parsing, each block table lives inside its own top-level wrapper div.
  // Insert an <hr> before every wrapper except the first to create sections.
  const wrappers = Array.from(element.children)
    .filter((child) => child.querySelector && child.querySelector('table'));

  wrappers.forEach((wrapper, index) => {
    if (index === 0) return;
    const hr = document.createElement('hr');
    wrapper.parentNode.insertBefore(hr, wrapper);
  });
}
