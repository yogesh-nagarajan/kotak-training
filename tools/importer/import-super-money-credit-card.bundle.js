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

  // tools/importer/import-super-money-credit-card.js
  var import_super_money_credit_card_exports = {};
  __export(import_super_money_credit_card_exports, {
    default: () => import_super_money_credit_card_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document: document2 }) {
    const bgImage = element.querySelector('img[class*="desktop-display"], img[class*="absolute"]');
    const h1 = element.querySelector("h1");
    const heading = h1 || element.querySelector("h2");
    if (!bgImage && !h1) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const eyebrow = element.querySelector('p[class*="banner_text"]');
    const subtext = element.querySelector('div[class*="description"], p[class*="description"]');
    const ctas = Array.from(element.querySelectorAll('a[class*="button"]'));
    const cells = [];
    if (bgImage) {
      const imageCell = [document2.createComment(" field:image "), bgImage];
      cells.push([imageCell]);
    }
    const textCell = [document2.createComment(" field:text ")];
    if (eyebrow) textCell.push(eyebrow);
    if (heading) textCell.push(heading);
    if (subtext) textCell.push(subtext);
    ctas.forEach((cta) => textCell.push(cta));
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse2(element, { document: document2 }) {
    let cardItems = Array.from(element.querySelectorAll('li[class*="card"]'));
    if (cardItems.length === 0) {
      cardItems = Array.from(element.querySelectorAll("ul > li"));
    }
    if (cardItems.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cardItems.forEach((item) => {
      const image = item.querySelector("img");
      const imageCell = [document2.createComment(" field:image ")];
      if (image) imageCell.push(image);
      const heading = item.querySelector("h2, h3, h4");
      const paragraphs = Array.from(item.querySelectorAll("p")).filter((p) => p.textContent.trim().length > 0);
      const textCell = [document2.createComment(" field:text ")];
      if (heading) textCell.push(heading);
      paragraphs.forEach((p) => textCell.push(p));
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse3(element, { document: document2 }) {
    const grid = element.querySelector('div[class*="grid-cols"], div[class*="grid"]') || element.querySelector(".container > div") || element.querySelector(".container");
    if (!grid) {
      element.replaceWith(...element.childNodes);
      return;
    }
    let columns = Array.from(grid.children).filter((c) => c.nodeType === 1);
    if (columns.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const row = columns.map((col) => {
      const contentNodes = Array.from(col.children).filter((n) => n.nodeType === 1);
      return contentNodes.length ? contentNodes : [col];
    });
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  function parse4(element, { document: document2 }) {
    let items = Array.from(element.querySelectorAll('div[class*="accordion__section"]'));
    if (items.length === 0) {
      items = Array.from(element.querySelectorAll('div[class*="accordion__content"]')).map((c) => c.parentElement).filter(Boolean);
    }
    if (items.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((item) => {
      const questionEl = item.querySelector(".accordion__title h3, .accordion__title h2, .accordion__title h4, h3, h2, h4");
      const questionText = questionEl ? questionEl.textContent.trim() : "";
      const contentBody = item.querySelector('div[class*="accordion__text"], div[class*="accordion__content"]');
      const answerNodes = [];
      if (contentBody) {
        Array.from(contentBody.children).filter((n) => n.nodeType === 1 && n.textContent.trim().length > 0).forEach((n) => answerNodes.push(n));
      }
      if (!questionText && answerNodes.length === 0) return;
      const titleCell = [document2.createComment(" field:summary ")];
      if (questionText) titleCell.push(document2.createTextNode(questionText));
      const contentCell = [document2.createComment(" field:text ")];
      answerNodes.forEach((n) => contentCell.push(n));
      cells.push([titleCell, contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/kotak811-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [".loader"]);
      const main = element.querySelector("main.Credit_card.SuperMoney_main__c7k8L") || element.querySelector("main");
      if (main) {
        const KEEP = (section) => section.matches("section.SuperMoney_heroBan__rCeAx") || (section.className || "").split(/\s+/).includes("z-pos-fix]");
        Array.from(main.querySelectorAll(":scope > section")).forEach((section) => {
          if (!KEEP(section)) section.remove();
        });
      }
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#header-nav",
        // main site navigation / header
        "footer.footer",
        // site footer (also removes the nested #breadcrumb-nav)
        "#breadcrumb-nav",
        // breadcrumb navigation (explicit, in case footer scope changes)
        "iframe",
        // cross-sell tracking iframe (#__tvc_uuid_frame)
        "link",
        // stray body-level <link> (loader-logo asset)
        "meta"
        // stray body-level <meta>
      ]);
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

  // tools/importer/transformers/kotak811-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var MAIN_SELECTOR = "main.Credit_card.SuperMoney_main__c7k8L";
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const doc = element.ownerDocument || payload && payload.document || document;
      const container = element.querySelector(MAIN_SELECTOR);
      if (!container) return;
      const groups = Array.from(container.children);
      if (groups.length === 0) return;
      const styleByIndex = {};
      const blocks = payload && payload.template && payload.template.blocks || [];
      blocks.forEach((block) => {
        if (!block || !block.section) return;
        (block.instances || []).forEach((selector) => {
          const matches = [...String(selector).matchAll(/:nth-of-type\((\d+)\)/g)];
          if (matches.length === 0) return;
          const nth = parseInt(matches[matches.length - 1][1], 10);
          if (!Number.isNaN(nth)) styleByIndex[nth - 1] = block.section;
        });
      });
      groups.forEach((group, index) => {
        if (index > 0) {
          group.before(doc.createElement("hr"));
        }
        const style = styleByIndex[index];
        if (style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { Style: style }
          });
          group.after(sectionMetadata);
        }
      });
    }
  }

  // tools/importer/import-super-money-credit-card.js
  var parsers = {
    hero: parse,
    cards: parse2,
    columns: parse3,
    "accordion-faq": parse4
  };
  var transformers = [
    transform,
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "super-money-credit-card",
    description: "Kotak811 super.money credit-card product/detail page: hero banner, cashback feature cards, SEO rich-text content, feature callouts, how-to-get-started steps, eligibility/fees tables, and an FAQ accordion.",
    urls: [
      "https://www.kotak811.bank.in/credit-cards/811-super-money-credit-card"
    ],
    blocks: [
      {
        name: "hero",
        instances: [
          "main.Credit_card.SuperMoney_main__c7k8L > section.SuperMoney_heroBan__rCeAx",
          "main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(12)"
        ]
      },
      {
        name: "cards",
        instances: [
          "main.Credit_card.SuperMoney_main__c7k8L > section.z-pos-fix\\]"
        ]
      },
      {
        name: "columns",
        instances: [
          "main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(4)",
          "main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(5)",
          "main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(6)",
          "main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(7)",
          "main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(8)",
          "main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(9)",
          "main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(10)"
        ]
      },
      {
        name: "accordion-faq",
        instances: [
          "main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(13)"
        ]
      },
      {
        name: "section-how-it-works",
        instances: [
          "main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(9)"
        ],
        section: "accent"
      },
      {
        name: "section-how-to-get-started",
        instances: [
          "main.Credit_card.SuperMoney_main__c7k8L > section:nth-of-type(10)"
        ],
        section: "grey"
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.filter((blockDef) => !blockDef.name.startsWith("section-")).forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        let elements = [];
        try {
          elements = document2.querySelectorAll(selector);
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
  var import_super_money_credit_card_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_super_money_credit_card_exports);
})();
