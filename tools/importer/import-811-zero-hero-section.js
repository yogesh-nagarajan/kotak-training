/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import zeroHeroParser from './parsers/811-zero-hero-section.js';

// PARSER REGISTRY
const parsers = {
  '811-zero-hero-section': zeroHeroParser,
};

// PAGE TEMPLATE CONFIGURATION
// NOTE: the block class starts with a digit, so it must be matched with the
// attribute selector [class~="811-zero-hero-section"] (a `.811-…` class
// selector is invalid and throws in querySelectorAll).
const PAGE_TEMPLATE = {
  name: '811-zero-hero-section',
  description: 'Kotak811 zero-balance digital savings account hero: full-bleed banner with centered eyebrow, heading, subtext and CTA.',
  urls: [
    'http://localhost:3000/drafts/811-zero-hero-section.plain.html',
  ],
  blocks: [
    {
      name: '811-zero-hero-section',
      instances: ['div[class~="811-zero-hero-section"]'],
    },
  ],
};

/**
 * Find all block instances on the page based on the embedded template.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Discover and parse blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 2. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 3. Force the output path to /811-zero-hero-section
    const path = WebImporter.FileUtils.sanitizePath('/811-zero-hero-section');

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
