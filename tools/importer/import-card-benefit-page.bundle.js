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

  // tools/importer/import-card-benefit-page.js
  var import_card_benefit_page_exports = {};
  __export(import_card_benefit_page_exports, {
    default: () => import_card_benefit_page_default
  });

  // tools/importer/parsers/hero-product.js
  function parse(element, { document }) {
    element.querySelectorAll("style, script, noscript").forEach((n) => n.remove());
    const bgImage = element.querySelector('ui-background img, [class*="bg-fill"] img, ui-background picture img');
    const textContent = [];
    const eyebrow = element.querySelector("ui-text span.hero, span.hero, .header-3.hero");
    if (eyebrow && eyebrow.textContent.replace(/ /g, "").trim()) {
      const p = document.createElement("p");
      p.textContent = eyebrow.textContent.trim();
      textContent.push(p);
    }
    const headings = Array.from(element.querySelectorAll("h1, h2, h3")).filter((h) => h.textContent.replace(/ /g, "").trim());
    headings.forEach((h) => textContent.push(h));
    const productImg = element.querySelector(".display-image img, .block-hero-art-2.display-image img");
    if (productImg) {
      const productPicture = productImg.closest("picture") || productImg;
      textContent.push(productPicture);
    }
    if (!bgImage && textContent.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const imageCell = document.createDocumentFragment();
    if (bgImage) {
      imageCell.appendChild(document.createComment(" field:image "));
      imageCell.appendChild(bgImage.closest("picture") || bgImage);
    }
    cells.push([imageCell]);
    const textCell = document.createDocumentFragment();
    if (textContent.length) {
      textCell.appendChild(document.createComment(" field:text "));
      textContent.forEach((node) => textCell.appendChild(node));
    }
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-benefit.js
  function parse2(element, { document }) {
    element.querySelectorAll("style, script, noscript").forEach((n) => n.remove());
    const hasText = (el) => el && el.textContent.replace(/ /g, " ").trim();
    let titleEls = Array.from(
      element.querySelectorAll('span[class*="header-"], span[class*="font-weight-bold"]')
    ).filter((s) => !s.closest("p") && hasText(s));
    titleEls = titleEls.filter(
      (s, i, arr) => !arr.some((other, j) => j !== i && other.contains(s))
    );
    if (!titleEls.length) {
      titleEls = Array.from(element.querySelectorAll("ui-text > span")).filter((s) => s.querySelector("strong") && !s.querySelector("p") && hasText(s));
    }
    const paragraphs = Array.from(element.querySelectorAll("p")).filter(hasText);
    const titleSet = new Set(titleEls);
    const ordered = [...titleEls, ...paragraphs].sort(
      // eslint-disable-next-line no-bitwise
      (a, b) => a.compareDocumentPosition(b) & 4 ? -1 : 1
    );
    const cards = [];
    let current = null;
    ordered.forEach((node) => {
      if (titleSet.has(node)) {
        current = { titleEl: node, descriptions: [] };
        cards.push(current);
      } else if (current) {
        current.descriptions.push(node);
      }
    });
    const cells = [];
    cards.forEach((card) => {
      const titleText = hasText(card.titleEl);
      if (!titleText && !card.descriptions.length) return;
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      if (titleText) {
        const heading = document.createElement("h3");
        heading.textContent = titleText;
        textCell.appendChild(heading);
      }
      card.descriptions.forEach((p) => textCell.appendChild(p));
      cells.push(["", textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-benefit", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/citibank-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".pageLoader",
        "branding-speed-bump",
        "branding-cookie-policy"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "branding-header",
        "branding-footer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "script",
        "noscript",
        "iframe",
        "link",
        "style",
        "source",
        "template"
      ]);
      const trackingHosts = [
        "sp.analytics.yahoo.com",
        "analytics.yahoo.com",
        "doubleclick.net",
        "google-analytics.com",
        "googletagmanager.com",
        "demdex.net",
        "adnxs.com",
        "quantserve.com",
        "scorecardresearch.com",
        "facebook.com/tr"
      ];
      element.querySelectorAll("img[src]").forEach((img) => {
        const src = img.getAttribute("src") || "";
        if (trackingHosts.some((host) => src.includes(host))) {
          const wrapper = img.closest("p") || img;
          wrapper.remove();
        }
      });
    }
  }

  // tools/importer/transformers/citibank-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function findSectionElement(element, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (let i = 0; i < selectors.length; i += 1) {
      const sel = selectors[i];
      if (sel) {
        const el = element.querySelector(sel);
        if (el) return el;
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.beforeTransform) {
      const sections = payload && payload.template && payload.template.sections || [];
      if (sections.length > 1) {
        const doc = element.ownerDocument;
        for (let i = sections.length - 1; i >= 0; i -= 1) {
          const section = sections[i];
          const sectionEl = findSectionElement(element, section);
          if (sectionEl) {
            if (section.style) {
              const styleValue = Array.isArray(section.style) ? section.style.join(", ") : section.style;
              const metaBlock = WebImporter.Blocks.createBlock(doc, {
                name: "Section Metadata",
                cells: { style: styleValue }
              });
              sectionEl.after(metaBlock);
            }
            if (i > 0) {
              const hr = doc.createElement("hr");
              sectionEl.before(hr);
            }
          }
        }
      }
    }
  }

  // tools/importer/import-card-benefit-page.js
  var PAGE_TEMPLATE = {
    name: "card-benefit-page",
    description: "Citibank credit card benefit landing page with hero, benefit highlights, content showcase, and terms sections",
    urls: [
      "https://www1.citibank.com.sg/cardbenefit/cashbackplus/888_450"
    ],
    blocks: [
      {
        name: "hero-product",
        instances: ["ui-dynamic-widget:nth-of-type(4)"]
      },
      {
        name: "cards-benefit",
        instances: [".content-showcase1v4 ui-flex-grid.text-center"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero",
        selector: ["ui-dynamic-widget:nth-of-type(4)"],
        style: null,
        blocks: ["hero-product"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Benefit highlights",
        selector: ["ui-dynamic-widget:nth-of-type(6)"],
        style: null,
        blocks: ["cards-benefit"],
        defaultContent: [".content-showcase1v4 ui-h2"]
      },
      {
        id: "section-3",
        name: "Terms footnote",
        selector: ["ui-dynamic-widget:nth-of-type(7)"],
        style: null,
        blocks: [],
        defaultContent: ["ui-dynamic-widget:nth-of-type(7)"]
      }
    ]
  };
  var parsers = {
    "hero-product": parse,
    "cards-benefit": parse2
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
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
  var import_card_benefit_page_default = {
    /**
     * Main transformation function
     */
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
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
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
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
  return __toCommonJS(import_card_benefit_page_exports);
})();
