/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cardsParser from './parsers/cards.js';
import columnsParser from './parsers/columns.js';
import accordionFaqParser from './parsers/accordion-faq.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/kotak811-cleanup.js';
import sectionsTransformer from './transformers/kotak811-sections.js';

// PARSER REGISTRY - map block name to parser function
const parsers = {
  hero: heroParser,
  cards: cardsParser,
  columns: columnsParser,
  'accordion-faq': accordionFaqParser,
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata
const transformers = [
  cleanupTransformer,
  sectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION - embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'super-money-credit-card',
  description: 'Kotak811 super.money credit-card product/detail page: hero banner, cashback feature cards, SEO rich-text content, feature callouts, how-to-get-started steps, eligibility/fees tables, and an FAQ accordion.',
  urls: [
    'https://www.kotak811.bank.in/credit-cards/811-super-money-credit-card',
  ],
  blocks: [
    {
      name: 'hero',
      instances: [
        'main.Credit_card.SuperMoney_main__c7k8L > section.SuperMoney_heroBan__rCeAx',
        'main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(12)',
      ],
    },
    {
      name: 'cards',
      instances: [
        'main.Credit_card.SuperMoney_main__c7k8L > section.z-pos-fix\\]',
      ],
    },
    {
      name: 'columns',
      instances: [
        'main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(4)',
        'main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(5)',
        'main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(6)',
        'main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(7)',
        'main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(8)',
        'main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(9)',
        'main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(10)',
      ],
    },
    {
      name: 'accordion-faq',
      instances: [
        'main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(13)',
      ],
    },
    {
      name: 'section-how-it-works',
      instances: [
        'main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(9)',
      ],
      section: 'accent',
    },
    {
      name: 'section-how-to-get-started',
      instances: [
        'main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(10)',
      ],
      section: 'grey',
    },
  ],
};

/**
 * Execute all page transformers for a specific hook.
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - DOM element to transform (document.body)
 * @param {Object} payload - { document, url, html, params }
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
 * Find all block instances on the page from the embedded template.
 * Skips section-* entries (those are section-metadata mappings, handled by the
 * sections transformer, not block parsers).
 * @param {Document} document
 * @param {Object} template - PAGE_TEMPLATE
 * @returns {Array} block instances { name, selector, element }
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks
    .filter((blockDef) => !blockDef.name.startsWith('section-'))
    .forEach((blockDef) => {
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

    // 2. discover blocks from the embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. parse each block; skip elements already replaced by a prior parser
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
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

    // 4. afterTransform cleanup + section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. sanitized path (root/homepage maps to /index)
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
