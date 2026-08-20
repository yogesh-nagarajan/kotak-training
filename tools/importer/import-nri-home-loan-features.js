/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import breadcrumbParser from './parsers/breadcrumb.js';
import heroCarouselParser from './parsers/hero-carousel.js';
import tabsParser from './parsers/tabs.js';
import introParser from './parsers/intro.js';
import imgContainerParser from './parsers/img-container.js';
import featureCarouselParser from './parsers/feature-carousel.js';
import ctaParser from './parsers/cta.js';
import faqParser from './parsers/faq.js';
import relatedProductsParser from './parsers/related-products.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/kotak-cleanup.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'nri-home-loan-features',
  description: 'NRI Home Loan Features product page: hero-carousel, product tabs, intro, img-container highlight, feature-carousel, disclaimer default content, CTA banner, FAQ accordion, and related-products cards.',
  urls: [
    'http://localhost:3000/nri-home-loan-features',
  ],
  blocks: [
    {
      name: 'breadcrumb',
      instances: [
        '.breadcrumb-container .breadcrumb',
        '.breadcrumb-container .breadcrumb.block',
      ],
    },
    {
      name: 'hero-carousel',
      instances: [
        '.hero-carousel-container .hero-carousel',
        'section.hero-carousel-container .hero-carousel.block',
      ],
    },
    {
      name: 'tabs',
      instances: [
        '.tabs-container .tabs',
        '.tabs-container .tabs.block',
      ],
    },
    {
      name: 'intro',
      instances: [
        '.intro-container .intro',
        '.intro-container .intro.block',
      ],
    },
    {
      name: 'img-container',
      instances: [
        '.img-container-container .img-container',
        '.img-container-container .img-container.block',
      ],
    },
    {
      name: 'feature-carousel',
      instances: [
        '.feature-carousel-container .feature-carousel',
        '.feature-carousel-container .feature-carousel.block',
      ],
    },
    {
      name: 'cta',
      instances: [
        '.cta-container .cta',
        '.cta-container .cta.block',
      ],
    },
    {
      name: 'faq',
      instances: [
        '.faq-container .faq',
        '.faq-container .faq.block',
      ],
    },
    {
      name: 'related-products',
      instances: [
        '.related-products-container .related-products',
        '.related-products-container .related-products.block',
      ],
    },
  ],
  sections: [],
};

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  breadcrumb: breadcrumbParser,
  'hero-carousel': heroCarouselParser,
  tabs: tabsParser,
  intro: introParser,
  'img-container': imgContainerParser,
  'feature-carousel': featureCarouselParser,
  cta: ctaParser,
  faq: faqParser,
  'related-products': relatedProductsParser,
};

// TRANSFORMER REGISTRY - site-wide cleanup only (no section boundaries)
const transformers = [
  cleanupTransformer,
];

/**
 * Execute all page transformers for a specific hook.
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
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
 * Find all blocks on the page based on the embedded template configuration.
 * De-duplicates elements matched by more than one candidate selector.
 * @param {Document} document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
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
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced by earlier parser
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

    // 4. afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (map root URL to /index)
    //    Strip a leading `/content` segment used only by the local dev mount so
    //    a source served at `/content/preview` still writes to `content/preview`
    //    (not `content/content/preview`). No-op for real source URLs.
    const rawPath = new URL(params.originalURL).pathname
      .replace(/^\/content(?=\/)/, '')
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
