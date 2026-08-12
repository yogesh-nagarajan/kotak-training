/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroProductParser from './parsers/hero-product.js';
import cardsBenefitParser from './parsers/cards-benefit.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/citibank-cleanup.js';
import sectionsTransformer from './transformers/citibank-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'card-benefit-page',
  description: 'Citibank credit card benefit landing page with hero, benefit highlights, content showcase, and terms sections',
  urls: [
    'https://www1.citibank.com.sg/cardbenefit/cashbackplus/888_450',
  ],
  blocks: [
    {
      name: 'hero-product',
      instances: ['ui-dynamic-widget:nth-of-type(4)'],
    },
    {
      name: 'cards-benefit',
      instances: ['.content-showcase1v4 ui-flex-grid.text-center'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero',
      selector: ['ui-dynamic-widget:nth-of-type(4)'],
      style: null,
      blocks: ['hero-product'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Benefit highlights',
      selector: ['ui-dynamic-widget:nth-of-type(6)'],
      style: null,
      blocks: ['cards-benefit'],
      defaultContent: ['.content-showcase1v4 ui-h2'],
    },
    {
      id: 'section-3',
      name: 'Terms footnote',
      selector: ['ui-dynamic-widget:nth-of-type(7)'],
      style: null,
      blocks: [],
      defaultContent: ['ui-dynamic-widget:nth-of-type(7)'],
    },
  ],
};

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'hero-product': heroProductParser,
  'cards-benefit': cardsBenefitParser,
};

// TRANSFORMER REGISTRY - cleanup runs first, section transformer after
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - The hook name ('beforeTransform' or 'afterTransform')
 * @param {Element} element - The DOM element to transform (typically document.body or main)
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
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
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  /**
   * Main transformation function
   */
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
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

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (full localized path without extension).
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

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
