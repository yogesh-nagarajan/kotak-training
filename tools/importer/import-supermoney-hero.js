/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import supermoneyHeroParser from './parsers/supermoney-hero.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/supermoney-hero-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'supermoney-hero': supermoneyHeroParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION — only the hero section is mapped; the parser
// pulls in the cards section itself and merges both into one supermoney-hero block.
const PAGE_TEMPLATE = {
  name: 'supermoney-hero',
  description: 'Merged hero + cards demo page for the supermoney-hero block.',
  urls: [
    'https://www.kotak811.bank.in/credit-cards/811-super-money-credit-card',
  ],
  blocks: [
    {
      name: 'supermoney-hero',
      instances: [
        'main.Credit_card.SuperMoney_main__c7k8L > section.SuperMoney_heroBan__rCeAx',
      ],
    },
  ],
};

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

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      let elements = [];
      try {
        elements = document.querySelectorAll(selector);
      } catch (e) {
        console.warn(`Invalid selector for ${blockDef.name}: ${selector}`);
      }
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

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. discover + parse the hero block (which also merges in the cards)
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      }
    });

    // 3. afterTransform cleanup (removes leftover sections; keeps the generated block div)
    executeTransformers('afterTransform', main, payload);

    // 4. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 5. fixed output path for this demo page
    const path = WebImporter.FileUtils.sanitizePath('/supermoney-hero');

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
