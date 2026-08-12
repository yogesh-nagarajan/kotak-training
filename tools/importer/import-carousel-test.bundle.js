/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-carousel-test.js
  var import_carousel_test_exports = {};
  __export(import_carousel_test_exports, {
    default: () => import_carousel_test_default
  });
  var import_carousel_test_default = {
    transform: (payload) => {
      const {
        document,
        url,
        params
      } = payload;
      WebImporter.rules.adjustImageUrls(document.body, url, params.originalURL);
      const container = document.createElement("div");
      const rowsFrom = (wrapper) => [...wrapper.children].map((row) => {
        const cells = [...row.children];
        const imageCell = cells.find((c) => c.querySelector("picture, img")) || cells[0];
        const textCell = cells.find((c) => c !== imageCell) || cells[1];
        return [imageCell, textCell];
      });
      const allCellsFrom = (wrapper) => [...wrapper.children].map((row) => [...row.children]);
      const carousel = document.querySelector(".carousel");
      if (carousel) {
        container.append(WebImporter.Blocks.createBlock(document, {
          name: "carousel",
          cells: rowsFrom(carousel)
        }));
      }
      const cardsApply = document.querySelector(".cards-apply:not(.no-symbol)");
      if (cardsApply) {
        container.append(document.createElement("hr"));
        container.append(WebImporter.Blocks.createBlock(document, {
          name: "cards-apply",
          cells: rowsFrom(cardsApply)
        }));
        container.append(WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { Style: "grey" }
        }));
      }
      const promo = document.querySelector(".promo-carousel");
      if (promo) {
        container.append(document.createElement("hr"));
        container.append(WebImporter.Blocks.createBlock(document, {
          name: "promo-carousel",
          cells: allCellsFrom(promo)
        }));
      }
      const videoHighlight = document.querySelector(".video-highlight");
      if (videoHighlight) {
        container.append(document.createElement("hr"));
        container.append(WebImporter.Blocks.createBlock(document, {
          name: "video-highlight",
          cells: allCellsFrom(videoHighlight)
        }));
      }
      const knowledgeHub = document.querySelector(".knowledge-hub");
      if (knowledgeHub) {
        container.append(document.createElement("hr"));
        const khHeading = knowledgeHub.parentElement.querySelector(":scope > h2");
        if (khHeading) container.append(khHeading);
        container.append(WebImporter.Blocks.createBlock(document, {
          name: "knowledge-hub",
          cells: allCellsFrom(knowledgeHub)
        }));
      }
      const helpCarousel = document.querySelector(".help-carousel");
      if (helpCarousel) {
        container.append(document.createElement("hr"));
        const hcHeading = helpCarousel.parentElement.querySelector(":scope > h2");
        if (hcHeading) container.append(hcHeading);
        container.append(WebImporter.Blocks.createBlock(document, {
          name: "help-carousel",
          cells: allCellsFrom(helpCarousel)
        }));
      }
      const cardsApplyNoSymbol = document.querySelector(".cards-apply.no-symbol");
      if (cardsApplyNoSymbol) {
        container.append(document.createElement("hr"));
        container.append(WebImporter.Blocks.createBlock(document, {
          name: "cards-apply (no-symbol)",
          cells: rowsFrom(cardsApplyNoSymbol)
        }));
        container.append(WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { Style: "grey" }
        }));
      }
      if (!carousel && !cardsApply && !promo && !videoHighlight && !knowledgeHub && !helpCarousel && !cardsApplyNoSymbol) {
        container.append(...document.body.childNodes);
      }
      return [{
        element: container,
        path: "/carousel-test",
        report: {
          title: document.title || "Carousel Test"
        }
      }];
    }
  };
  return __toCommonJS(import_carousel_test_exports);
})();
