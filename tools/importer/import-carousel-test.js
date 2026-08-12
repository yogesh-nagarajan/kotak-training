/* eslint-disable */
/* global WebImporter */

/**
 * Import script: carousel-test
 *
 * Source is the local draft at /drafts/carousel-test.plain.html:
 *   Section 1: <div class="carousel">        (one row per slide: image + text)
 *   Section 2: <div class="cards-apply">      (one row per card: image + text)
 *              + <div class="section-metadata"> Style = grey
 *   Section 3: <div class="promo-carousel">   (one row per slide: desktop + mobile image)
 *
 * html2md flattens plain divs, so each block is rebuilt as a proper AEM block
 * table via WebImporter.Blocks.createBlock. Section breaks (<hr>) separate the
 * sections and a Section Metadata block applies the grey background.
 */
export default {
  transform: (payload) => {
    const {
      document, url, params,
    } = payload;

    WebImporter.rules.adjustImageUrls(document.body, url, params.originalURL);

    const container = document.createElement('div');

    // Helper: turn a block wrapper's direct children (rows) into [imageCell, textCell] pairs.
    const rowsFrom = (wrapper) => [...wrapper.children].map((row) => {
      const cells = [...row.children];
      const imageCell = cells.find((c) => c.querySelector('picture, img')) || cells[0];
      const textCell = cells.find((c) => c !== imageCell) || cells[1];
      return [imageCell, textCell];
    });

    // Helper: keep every original cell in each row (used by promo-carousel, which
    // has two image cells — desktop + mobile — that must both be preserved).
    const allCellsFrom = (wrapper) => [...wrapper.children].map((row) => [...row.children]);

    // --- Section 1: carousel ---
    const carousel = document.querySelector('.carousel');
    if (carousel) {
      container.append(WebImporter.Blocks.createBlock(document, {
        name: 'carousel',
        cells: rowsFrom(carousel),
      }));
    }

    // --- Section 2: cards-apply (grey background) — the top cards row ---
    const cardsApply = document.querySelector('.cards-apply:not(.no-symbol)');
    if (cardsApply) {
      // Section break before section 2
      container.append(document.createElement('hr'));

      container.append(WebImporter.Blocks.createBlock(document, {
        name: 'cards-apply',
        cells: rowsFrom(cardsApply),
      }));

      // Section Metadata: grey background
      container.append(WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { Style: 'grey' },
      }));
    }

    // --- Section 3: promo-carousel (slim image-only banner) ---
    // Grey background is applied by the block's own CSS (see promo-carousel.css),
    // so no Section Metadata block is needed here.
    const promo = document.querySelector('.promo-carousel');
    if (promo) {
      container.append(document.createElement('hr'));
      container.append(WebImporter.Blocks.createBlock(document, {
        name: 'promo-carousel',
        cells: allCellsFrom(promo),
      }));
    }

    // --- Section 4: video-highlight (two columns; grey background via block CSS) ---
    const videoHighlight = document.querySelector('.video-highlight');
    if (videoHighlight) {
      container.append(document.createElement('hr'));
      container.append(WebImporter.Blocks.createBlock(document, {
        name: 'video-highlight',
        cells: allCellsFrom(videoHighlight),
      }));
    }

    // --- Section 5: knowledge-hub (centred H2 default content + block) ---
    const knowledgeHub = document.querySelector('.knowledge-hub');
    if (knowledgeHub) {
      container.append(document.createElement('hr'));
      // The centred "Knowledge Hub" H2 is default content above the block.
      const khHeading = knowledgeHub.parentElement.querySelector(':scope > h2');
      if (khHeading) container.append(khHeading);
      container.append(WebImporter.Blocks.createBlock(document, {
        name: 'knowledge-hub',
        cells: allCellsFrom(knowledgeHub),
      }));
    }

    // --- Section 6: help-carousel (centred H2 default content + block) ---
    const helpCarousel = document.querySelector('.help-carousel');
    if (helpCarousel) {
      container.append(document.createElement('hr'));
      const hcHeading = helpCarousel.parentElement.querySelector(':scope > h2');
      if (hcHeading) container.append(hcHeading);
      container.append(WebImporter.Blocks.createBlock(document, {
        name: 'help-carousel',
        cells: allCellsFrom(helpCarousel),
      }));
    }

    // --- Section 7: cards-apply (no-symbol) — duplicate of the top cards row,
    // without the Kotak badge. The "(no-symbol)" variant maps to the CSS class.
    const cardsApplyNoSymbol = document.querySelector('.cards-apply.no-symbol');
    if (cardsApplyNoSymbol) {
      container.append(document.createElement('hr'));
      container.append(WebImporter.Blocks.createBlock(document, {
        name: 'cards-apply (no-symbol)',
        cells: rowsFrom(cardsApplyNoSymbol),
      }));
      container.append(WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { Style: 'grey' },
      }));
    }

    // Fallback if no known block matched.
    if (!carousel && !cardsApply && !promo && !videoHighlight && !knowledgeHub
      && !helpCarousel && !cardsApplyNoSymbol) {
      container.append(...document.body.childNodes);
    }

    return [{
      element: container,
      path: '/carousel-test',
      report: {
        title: document.title || 'Carousel Test',
      },
    }];
  },
};
