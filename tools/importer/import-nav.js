/* eslint-disable */
/* global WebImporter */

// Minimal fragment importer for the site navigation fragment (/nav).
// The nav fragment is entirely default content (brand link, nav list, login
// link) with NO blocks, so this script does cleanup only — no block parsers.
// It exists so the header block's `/nav.plain.html` fetch resolves from the
// content/ folder on the content mount (mirroring a production EDS site where
// the nav fragment lives at the site root).

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/kotak-cleanup.js';

const transformers = [
  cleanupTransformer,
];

function executeTransformers(hookName, element, payload) {
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, payload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // cleanup only (no blocks on the nav fragment)
    executeTransformers('beforeTransform', main, payload);
    executeTransformers('afterTransform', main, payload);

    // The nav fragment has three logical sections (brand, nav list, login) that
    // MUST round-trip as three separate top-level blocks so the header block can
    // map nav.children[0/1/2] -> brand/sections/tools. The live page renders them
    // as `.section`/`.section-wrapper` divs; rebuild `main` from those sections
    // separated by <hr> (EDS' section separator in .plain.html) so the importer
    // re-serialises three sections instead of collapsing into one.
    const sections = main.querySelectorAll(':scope > .section, main > .section');
    if (sections.length > 1) {
      const rebuilt = document.createElement('div');
      sections.forEach((section, i) => {
        if (i > 0) rebuilt.appendChild(document.createElement('hr'));
        // unwrap one level of section/section-wrapper chrome where present
        const inner = section.querySelector(':scope > .default-content-wrapper') || section;
        while (inner.firstChild) rebuilt.appendChild(inner.firstChild);
      });
      main.replaceChildren(...rebuilt.childNodes);
    }

    // A nav fragment carries no page metadata and no images, so skip
    // createMetadata (it would append a stray "Metadata"/"Image" block that
    // renders as visible content). Only normalise link URLs.
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // path from the source URL; strip the local /content mount prefix so a page
    // served at /content/nav still writes to content/nav (not content/content/nav)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/^\/content(?=\/)/, '')
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title || 'nav', template: 'nav-fragment' },
    }];
  },
};
