/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import supermoneyHeaderParser from './parsers/supermoney-header.js';
import supermoneyHeroParser from './parsers/supermoney-hero.js';
import supermoneyFooterParser from './parsers/supermoney-footer.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/supermoney-full-cleanup.js';

const parsers = {
  'supermoney-header': supermoneyHeaderParser,
  'supermoney-hero': supermoneyHeroParser,
  'supermoney-footer': supermoneyFooterParser,
};

const transformers = [cleanupTransformer];

// Full page: header + hero (merged hero+cards) + footer.
const PAGE_TEMPLATE = {
  name: 'supermoney-full',
  description: 'Full super.money page: header + hero + footer.',
  urls: [
    'https://www.kotak811.bank.in/credit-cards/811-super-money-credit-card',
  ],
  blocks: [
    { name: 'supermoney-header', instances: ['#header-nav'] },
    { name: 'supermoney-hero', instances: ['main.Credit_card.SuperMoney_main__c7k8L > section.SuperMoney_heroBan__rCeAx'] },
    { name: 'supermoney-footer', instances: ['footer.footer'] },
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

    // 2. parse header, hero, footer (order preserved: header first, footer last)
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

    // 3. afterTransform cleanup (removes leftover sections; keeps generated blocks)
    executeTransformers('afterTransform', main, payload);

    // 4. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 5. output to the credit-cards path
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
