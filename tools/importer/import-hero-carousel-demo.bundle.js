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

  // tools/importer/import-hero-carousel-demo.js
  var import_hero_carousel_demo_exports = {};
  __export(import_hero_carousel_demo_exports, {
    default: () => import_hero_carousel_demo_default
  });

  // tools/importer/parsers/hero-carousel.js
  function withFieldHint(document, fieldName, content) {
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(` field:${fieldName} `));
    if (Array.isArray(content)) {
      content.forEach((node) => {
        if (node) frag.appendChild(node);
      });
    } else if (content) {
      frag.appendChild(content);
    }
    return frag;
  }
  function parse(element, { document }) {
    const slides = Array.from(
      element.querySelectorAll('.hero-carousel-slide, [class*="carousel-slide"], [role="group"]')
    );
    if (!slides.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const makeImg = (src, alt) => {
      if (!src) return null;
      const el = document.createElement("img");
      el.setAttribute("src", src);
      if (alt) el.setAttribute("alt", alt);
      return el;
    };
    slides.forEach((slide) => {
      const picture = slide.querySelector(".hero-carousel-image picture, picture");
      const img = slide.querySelector(".hero-carousel-image img, img");
      const alt = img && img.getAttribute("alt") || "";
      let desktopSrc = "";
      let mobileSrc = "";
      if (picture) {
        const desktopSource = picture.querySelector('source[media*="min-width"]');
        const mobileSource = picture.querySelector('source[media*="max-width"]');
        desktopSrc = desktopSource && desktopSource.getAttribute("srcset") || img && img.getAttribute("src") || "";
        mobileSrc = mobileSource && mobileSource.getAttribute("srcset") || "";
      } else if (img) {
        desktopSrc = img.getAttribute("src") || "";
      }
      const desktopImg = makeImg(desktopSrc, alt);
      const mobileImg = makeImg(mobileSrc, alt);
      const content = slide.querySelector(".hero-carousel-content") || slide;
      const title = content.querySelector('h1, h2, h3, [class*="title"]');
      const descriptions = Array.from(content.querySelectorAll(":scope > p"));
      const cta = content.querySelector("a.hero-carousel-cta, a.button, a[href]");
      const imageCell = desktopImg ? withFieldHint(document, "image", desktopImg) : "";
      const mobileImageCell = mobileImg ? withFieldHint(document, "mobileImage", mobileImg) : "";
      const textNodes = [];
      if (title) textNodes.push(title);
      descriptions.forEach((p) => textNodes.push(p));
      const textCell = textNodes.length ? withFieldHint(document, "text", textNodes) : "";
      const linkCell = cta ? withFieldHint(document, "link", cta) : "";
      cells.push([imageCell, mobileImageCell, textCell, linkCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function withFieldHint2(document, fieldName, content) {
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(` field:${fieldName} `));
    if (Array.isArray(content)) {
      content.forEach((node) => {
        if (node) frag.appendChild(node);
      });
    } else if (content) {
      frag.appendChild(content);
    }
    return frag;
  }
  function parse2(element, { document }) {
    let cards = Array.from(element.querySelectorAll(":scope > ul > li"));
    if (!cards.length) cards = Array.from(element.querySelectorAll("ul > li, li"));
    if (!cards.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const picture = card.querySelector(".cards-card-image picture, picture");
      const img = card.querySelector(".cards-card-image img, img");
      const imageEl = picture || img;
      const body = card.querySelector(".cards-card-body") || card;
      const heading = body.querySelector("h1, h2, h3, h4, h5, h6");
      const paragraphs = Array.from(body.querySelectorAll(":scope > p"));
      const cta = body.querySelector("a[href]");
      const imageCell = imageEl ? withFieldHint2(document, "image", imageEl) : "";
      const textNodes = [];
      if (heading) textNodes.push(heading);
      paragraphs.forEach((p) => textNodes.push(p));
      if (cta && !paragraphs.includes(cta)) textNodes.push(cta);
      const textCell = textNodes.length ? withFieldHint2(document, "text", textNodes) : "";
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/kotak-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.header-wrapper",
        "footer.footer-wrapper"
      ]);
    }
  }

  // tools/importer/import-hero-carousel-demo.js
  var PAGE_TEMPLATE = {
    name: "hero-carousel-demo",
    description: "Demo landing page featuring a Hero Carousel block (rotating banner slides with title, description and CTA) followed by a Cards section titled 'Why choose Kotak'.",
    urls: [
      "http://localhost:3000/preview"
    ],
    blocks: [
      {
        name: "hero-carousel",
        instances: [
          ".hero-carousel-container .hero-carousel",
          "section.hero-carousel-container .hero-carousel.block"
        ]
      },
      {
        name: "cards",
        instances: [
          ".cards-container .cards",
          ".cards-container .cards.block"
        ]
      }
    ],
    sections: []
  };
  var parsers = {
    "hero-carousel": parse,
    cards: parse2
  };
  var transformers = [
    transform
  ];
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
    const seen = /* @__PURE__ */ new Set();
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_hero_carousel_demo_default = {
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
      const rawPath = new URL(params.originalURL).pathname.replace(/^\/content(?=\/)/, "").replace(/\/$/, "").replace(/\.html?$/, "");
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
  return __toCommonJS(import_hero_carousel_demo_exports);
})();
