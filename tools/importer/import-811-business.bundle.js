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

  // tools/importer/import-811-business.js
  var import_811_business_exports = {};
  __export(import_811_business_exports, {
    default: () => import_811_business_default
  });
  var import_811_business_default = {
    transform: (payload) => {
      const {
        document,
        url,
        params
      } = payload;
      WebImporter.rules.adjustImageUrls(document.body, url, params.originalURL);
      const container = document.createElement("div");
      const allCellsFrom = (wrapper) => [...wrapper.children].map((row) => [...row.children]);
      const hero = document.querySelector(".hero-811");
      if (hero) {
        container.append(WebImporter.Blocks.createBlock(document, {
          name: "hero-811",
          cells: allCellsFrom(hero)
        }));
      }
      const benefits = document.querySelector(".benefit-cards");
      if (benefits) {
        container.append(WebImporter.Blocks.createBlock(document, {
          name: "benefit-cards",
          cells: allCellsFrom(benefits)
        }));
      }
      const promo = document.querySelector(".promo-banner");
      if (promo) {
        container.append(WebImporter.Blocks.createBlock(document, {
          name: "promo-banner",
          cells: allCellsFrom(promo)
        }));
      }
      if (!hero && !benefits && !promo) {
        container.append(...document.body.childNodes);
      }
      return [{
        element: container,
        path: "/811-business",
        report: {
          title: document.title || "811 Business"
        }
      }];
    }
  };
  return __toCommonJS(import_811_business_exports);
})();
