/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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

  // tools/importer/import-supermoney-hero.js
  var import_supermoney_hero_exports = {};
  __export(import_supermoney_hero_exports, {
    default: () => import_supermoney_hero_default
  });

  // tools/importer/parsers/supermoney-hero.js
  function parse(element, { document }) {
    const cells = [];
    const bgImage = element.querySelector('img[class*="desktop-display"], img[class*="absolute"]') || element.querySelector("img");
    if (bgImage) {
      cells.push([[document.createComment(" field:image "), bgImage]]);
    }
    const eyebrow = element.querySelector('p[class*="banner_text"]');
    const heading = element.querySelector("h1");
    const subtext = element.querySelector('div[class*="description"], p[class*="description"]');
    const cta = element.querySelector('a[class*="button"], a');
    const textCell = [document.createComment(" field:text ")];
    if (eyebrow) textCell.push(eyebrow);
    if (heading) textCell.push(heading);
    if (subtext) {
      const p = document.createElement("p");
      p.textContent = subtext.textContent.trim();
      textCell.push(p);
    }
    if (cta) textCell.push(cta);
    cells.push([textCell]);
    let cardsSection = null;
    const sections = document.querySelectorAll("main > section, section");
    sections.forEach((s) => {
      if (!cardsSection && (s.className || "").split(/\s+/).includes("z-pos-fix]")) {
        cardsSection = s;
      }
    });
    if (!cardsSection) {
      const ul = document.querySelector('ul[class*="flexcards"]');
      if (ul) cardsSection = ul.closest("section") || ul;
    }
    if (cardsSection) {
      const cardItems = cardsSection.querySelectorAll("li");
      cardItems.forEach((li) => {
        const icon = li.querySelector("img");
        const h = li.querySelector("h2, h3");
        const imageCell = [document.createComment(" field:image ")];
        if (icon) imageCell.push(icon);
        const bodyCell = [document.createComment(" field:text ")];
        if (h) bodyCell.push(h);
        cells.push([imageCell, bodyCell]);
      });
      cardsSection.remove();
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "supermoney-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/supermoney-hero-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [".loader"]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#header-nav",
        "footer.footer",
        "#breadcrumb-nav",
        "iframe",
        "link",
        "meta"
      ]);
      const main = element.querySelector("main.Credit_card.SuperMoney_main__c7k8L") || element.querySelector("main");
      if (main) {
        main.querySelectorAll(":scope > section").forEach((section) => section.remove());
      }
      const TRACKER_HOSTS = /(t\.co|analytics\.twitter\.com|bat\.bing\.com|c\.bing\.com|google-analytics\.com|googletagmanager\.com|doubleclick\.net|facebook\.com\/tr)/i;
      element.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src") || "";
        if (TRACKER_HOSTS.test(src)) {
          const wrapper = img.closest("picture") || img;
          const para = wrapper.closest("p");
          wrapper.remove();
          if (para && !para.querySelector("img, picture") && !para.textContent.trim()) {
            para.remove();
          }
        }
      });
    }
  }

  // tools/importer/import-supermoney-hero.js
  var parsers = {
    "supermoney-hero": parse
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "supermoney-hero",
    description: "Merged hero + cards demo page for the supermoney-hero block.",
    urls: [
      "https://www.kotak811.bank.in/credit-cards/811-super-money-credit-card"
    ],
    blocks: [
      {
        name: "supermoney-hero",
        instances: [
          "main.Credit_card.SuperMoney_main__c7k8L > section.SuperMoney_heroBan__rCeAx"
        ]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
  var import_supermoney_hero_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath("/supermoney-hero");
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_supermoney_hero_exports);
})();
