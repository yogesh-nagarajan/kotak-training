/* eslint-disable */
/* global WebImporter */

/**
 * Import script: 811-business
 *
 * Source is the local draft at /drafts/811-business.plain.html — a single
 * <div class="hero-811"> banner (media cell with desktop + mobile <picture>,
 * plus a content cell with eyebrow/heading/subhead/CTA).
 *
 * html2md flattens plain divs, so the block is rebuilt via
 * WebImporter.Blocks.createBlock, preserving all cells in the row.
 */
export default {
  transform: (payload) => {
    const {
      document, url, params,
    } = payload;

    WebImporter.rules.adjustImageUrls(document.body, url, params.originalURL);

    const container = document.createElement('div');

    // Keep every original cell in each row (media cell holds 2 pictures).
    const allCellsFrom = (wrapper) => [...wrapper.children].map((row) => [...row.children]);

    const hero = document.querySelector('.hero-811');
    if (hero) {
      container.append(WebImporter.Blocks.createBlock(document, {
        name: 'hero-811',
        cells: allCellsFrom(hero),
      }));
    }

    const benefits = document.querySelector('.benefit-cards');
    if (benefits) {
      container.append(WebImporter.Blocks.createBlock(document, {
        name: 'benefit-cards',
        cells: allCellsFrom(benefits),
      }));
    }

    const promo = document.querySelector('.promo-banner');
    if (promo) {
      container.append(WebImporter.Blocks.createBlock(document, {
        name: 'promo-banner',
        cells: allCellsFrom(promo),
      }));
    }

    if (!hero && !benefits && !promo) {
      container.append(...document.body.childNodes);
    }

    return [{
      element: container,
      path: '/feature-911-branch-kushagra',
      report: {
        title: document.title || '811 Business',
      },
    }];
  },
};
