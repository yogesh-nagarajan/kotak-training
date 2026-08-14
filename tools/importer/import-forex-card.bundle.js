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

  // tools/importer/import-forex-card.js
  var import_forex_card_exports = {};
  __export(import_forex_card_exports, {
    default: () => import_forex_card_default
  });

  // tools/importer/parsers/hero-p.js
  function parse(el, { document }) {
    const picture = el.querySelector("picture");
    const img = el.querySelector("img");
    const imageCell = picture || img || "";
    const contentCell = [];
    const sourceTitle = el.querySelector("h1");
    const title = document.createElement("h1");
    title.textContent = sourceTitle ? sourceTitle.textContent.trim() : "";
    contentCell.push(title);
    const sourceSubtitle = [...el.querySelectorAll("p")].find((p) => p.textContent.trim() && !p.querySelector("a.btn, a.btn-primary"));
    if (sourceSubtitle && sourceSubtitle.textContent.trim()) {
      const subtitle = document.createElement("p");
      subtitle.textContent = sourceSubtitle.textContent.trim().replace(/\s+/g, " ");
      contentCell.push(subtitle);
    }
    const sourceCta = el.querySelector("a.btn, a.btn-primary, a");
    if (sourceCta && sourceCta.getAttribute("href")) {
      const ctaWrap = document.createElement("p");
      const cta = document.createElement("a");
      cta.setAttribute("href", sourceCta.getAttribute("href"));
      cta.textContent = sourceCta.textContent.trim() || "Apply Now";
      ctaWrap.append(cta);
      contentCell.push(ctaWrap);
    }
    const cells = [
      ["Hero P"],
      [imageCell],
      [contentCell]
    ];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    el.replaceWith(table);
  }

  // tools/importer/transformers/cleanup.js
  function transform(hookName, element, payload) {
    const { document } = payload;
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        "script",
        "style",
        "noscript",
        "link",
        "svg",
        "header",
        "footer",
        "nav",
        ".header",
        ".footer",
        ".navigation",
        ".modal",
        ".cookie-banner",
        ".breadcrumb",
        ".breadcrumbs"
      ]);
      return;
    }
    if (hookName === "afterTransform") {
      const heroTable = [...element.querySelectorAll("table")].find((t) => t.textContent.trim().startsWith("Hero P"));
      const introHeading = [...element.querySelectorAll("h2, h3")].find((h) => /Carry Multiple Currencies/i.test(h.textContent));
      const introNodes = [];
      if (introHeading) {
        introNodes.push(introHeading);
        let sib = introHeading.nextElementSibling;
        while (sib && !/^H[1-6]$/.test(sib.tagName)) {
          if (sib.textContent.trim()) introNodes.push(sib);
          sib = sib.nextElementSibling;
        }
      }
      if (!heroTable) return;
      const keep = [];
      keep.push(heroTable);
      if (introNodes.length) {
        const hr = document.createElement("hr");
        keep.push(hr);
        introNodes.forEach((n) => keep.push(n.cloneNode(true)));
      }
      element.replaceChildren(...keep);
    }
  }

  // tools/importer/import-forex-card.js
  var parsers = {
    "hero-p": parse
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "forex-card",
    description: "Kotak prepaid/forex card landing page: owl hero banner (mapped to hero-p) followed by intro content.",
    urls: [
      "https://www.kotak.bank.in/en/personal-banking/cards/prepaid-card/forex-card.html"
    ],
    blocks: [
      {
        name: "hero-p",
        instances: [".owl-hero-banner"]
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
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_forex_card_default = {
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
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath("/forex-card");
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
  return __toCommonJS(import_forex_card_exports);
})();
