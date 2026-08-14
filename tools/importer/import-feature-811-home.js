/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cardsParser from './parsers/cards.js';
import imgContainerParser from './parsers/img-container.js';

// TRANSFORMER IMPORTS
import sectionsTransformer from './transformers/sections.js';

// PARSER REGISTRY
const parsers = {
  hero: heroParser,
  cards: cardsParser,
  'img-container': imgContainerParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'feature-811-home',
  description: 'Kotak811 home landing page (no carousel): hero banner, benefit card grid, ActivMoney image container, and secondary hero.',
  urls: [
    'http://localhost:3000/drafts/feature-811-home.plain.html',
  ],
  blocks: [
    { name: 'hero', instances: ['div.hero'] },
    { name: 'cards', instances: ['div.cards'] },
    { name: 'img-container', instances: ['div.img-container'] },
  ],
  sections: [
    { id: 'section-1', name: 'Intro hero' },
    { id: 'section-2', name: 'Core benefits cards' },
    { id: 'section-3', name: 'ActivMoney image container' },
    { id: 'section-4', name: 'Secondary hero' },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
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

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform hook
    executeTransformers('beforeTransform', main, payload);

    // 2. find blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. parse each block
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

    // 4. afterTransform hook (section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. force the output path to /feature-811-home (source is a drafts/*.plain.html file)
    const path = WebImporter.FileUtils.sanitizePath('/feature-811-home');

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
