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

  // tools/importer/import-nri-home-loan-features.js
  var import_nri_home_loan_features_exports = {};
  __export(import_nri_home_loan_features_exports, {
    default: () => import_nri_home_loan_features_default
  });

  // tools/importer/parsers/breadcrumb.js
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
    const items = Array.from(
      new Set(element.querySelectorAll(".breadcrumb-item, nav li, ol li, ul li"))
    );
    if (!items.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((li) => {
      const anchor = li.querySelector("a");
      const current = !!li.querySelector(".breadcrumb-current") || anchor && anchor.getAttribute("aria-current") === "page";
      let linkContent;
      if (anchor) {
        linkContent = anchor;
      } else {
        const label = (li.textContent || "").trim();
        linkContent = label ? document.createTextNode(label) : "";
      }
      const linkCell = withFieldHint(document, "link", linkContent);
      const currentCell = withFieldHint(
        document,
        "current",
        document.createTextNode(current ? "true" : "false")
      );
      cells.push([linkCell, currentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "breadcrumb", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-carousel.js
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
      const imageCell = desktopImg ? withFieldHint2(document, "image", desktopImg) : "";
      const mobileImageCell = mobileImg ? withFieldHint2(document, "mobileImage", mobileImg) : "";
      const textNodes = [];
      if (title) textNodes.push(title);
      descriptions.forEach((p) => textNodes.push(p));
      const textCell = textNodes.length ? withFieldHint2(document, "text", textNodes) : "";
      const linkCell = cta ? withFieldHint2(document, "link", cta) : "";
      cells.push([imageCell, mobileImageCell, textCell, linkCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs.js
  function withFieldHint3(document, fieldName, content) {
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
  function parse3(element, { document }) {
    const items = Array.from(
      new Set(element.querySelectorAll("nav li, ul li, .tabs-tab"))
    );
    if (!items.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((li) => {
      const anchor = li.querySelector("a");
      const active = li.classList.contains("tabs-tab-active") || anchor && anchor.getAttribute("aria-current") === "page";
      const linkCell = withFieldHint3(document, "link", anchor);
      const activeCell = withFieldHint3(
        document,
        "active",
        document.createTextNode(active ? "true" : "false")
      );
      cells.push([linkCell, activeCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/intro.js
  function withFieldHint4(document, fieldName, content) {
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
  function parse4(element, { document }) {
    const content = element.querySelector(".intro-content") || element;
    const textNodes = Array.from(content.children);
    if (!textNodes.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const textCell = withFieldHint4(document, "text", textNodes);
    const cells = [[textCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "intro", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/feature-carousel.js
  function withFieldHint5(document, fieldName, content) {
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
  function parse5(element, { document }) {
    const items = Array.from(element.querySelectorAll(".feature-carousel-item"));
    if (!items.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((item) => {
      var _a;
      const iconSource = item.querySelector(".feature-carousel-icon picture") || item.querySelector(".feature-carousel-icon img") || item.querySelector("picture, img");
      let iconEl = "";
      if (iconSource) {
        if (iconSource.tagName === "IMG") {
          const img = document.createElement("img");
          if (iconSource.getAttribute("src")) img.setAttribute("src", iconSource.getAttribute("src"));
          if (iconSource.getAttribute("alt")) img.setAttribute("alt", iconSource.getAttribute("alt"));
          iconEl = img;
        } else {
          iconEl = iconSource;
        }
      }
      const labelText = (_a = item.querySelector(".feature-carousel-label")) == null ? void 0 : _a.textContent.trim();
      const iconCell = iconEl ? withFieldHint5(document, "icon", iconEl) : "";
      let labelCell = "";
      if (labelText) {
        const p = document.createElement("p");
        p.textContent = labelText;
        labelCell = withFieldHint5(document, "label", p);
      }
      cells.push([iconCell, labelCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "feature-carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cta.js
  function withFieldHint6(document, fieldName, content) {
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
  function parse6(element, { document }) {
    var _a;
    const content = element.querySelector(".cta-content") || element;
    const headingText = (_a = content.querySelector(".cta-title, h1, h2, h3, h4, h5, h6")) == null ? void 0 : _a.textContent.trim();
    const anchor = content.querySelector("a[href]");
    if (!headingText && !anchor) {
      element.replaceWith(...element.childNodes);
      return;
    }
    let linkEl = "";
    if (anchor) {
      linkEl = document.createElement("a");
      linkEl.href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      if (target && target !== "undefined") linkEl.target = target;
      linkEl.textContent = anchor.textContent.trim();
    }
    let headingEl = "";
    if (headingText) {
      headingEl = document.createElement("p");
      headingEl.textContent = headingText;
    }
    const headingCell = headingEl ? withFieldHint6(document, "heading", headingEl) : "";
    const linkCell = linkEl ? withFieldHint6(document, "link", linkEl) : "";
    const cells = [[headingCell, linkCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "cta", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/faq.js
  function withFieldHint7(document, fieldName, content) {
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
  function parse7(element, { document }) {
    const items = Array.from(element.querySelectorAll(".faq-item"));
    if (!items.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((item) => {
      var _a, _b;
      const questionText = ((_a = item.querySelector(".faq-question-text")) == null ? void 0 : _a.textContent.trim()) || ((_b = item.querySelector(".faq-question")) == null ? void 0 : _b.textContent.trim()) || "";
      const answerContainer = item.querySelector(".faq-answer");
      const answerNodes = answerContainer ? Array.from(answerContainer.children) : [];
      const questionP = document.createElement("p");
      questionP.textContent = questionText;
      const questionCell = withFieldHint7(document, "question", questionP);
      const answerCell = withFieldHint7(document, "answer", answerNodes);
      cells.push([questionCell, answerCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/related-products.js
  function withFieldHint8(document, fieldName, content) {
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
  function parse8(element, { document }) {
    let cards = Array.from(element.querySelectorAll(":scope > ul > li"));
    if (!cards.length) cards = Array.from(element.querySelectorAll("ul > li, li"));
    if (!cards.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const makeLink = (anchor) => {
      if (!anchor) return null;
      const href = anchor.getAttribute("href");
      if (!href) return null;
      const link = document.createElement("a");
      link.setAttribute("href", href);
      const target = anchor.getAttribute("target");
      if (target && target !== "undefined") link.setAttribute("target", target);
      link.textContent = (anchor.textContent || "").replace(/[\s→]+$/, "").trim();
      return link;
    };
    cards.forEach((card) => {
      const imageEl = card.querySelector(".related-products-image picture") || card.querySelector(".related-products-image img") || card.querySelector("picture, img");
      const headingSrc = card.querySelector(".related-products-title, h1, h2, h3, h4, h5, h6");
      let heading = null;
      if (headingSrc) {
        heading = document.createElement("h3");
        heading.textContent = (headingSrc.textContent || "").trim();
      }
      let descNodes = Array.from(card.querySelectorAll(".related-products-desc > *"));
      if (!descNodes.length) {
        const desc = card.querySelector(".related-products-desc");
        if (desc) descNodes = Array.from(desc.children);
      }
      const knowMoreAnchor = makeLink(card.querySelector("a.related-products-know-more"));
      const applyAnchor = makeLink(card.querySelector("a.related-products-apply"));
      const imageCell = imageEl ? withFieldHint8(document, "image", imageEl) : "";
      const textNodes = [];
      if (heading) textNodes.push(heading);
      descNodes.forEach((node) => textNodes.push(node));
      const textCell = textNodes.length ? withFieldHint8(document, "text", textNodes) : "";
      const knowMoreCell = knowMoreAnchor ? withFieldHint8(document, "knowMoreLink", knowMoreAnchor) : "";
      const applyCell = applyAnchor ? withFieldHint8(document, "applyLink", applyAnchor) : "";
      cells.push([imageCell, textCell, knowMoreCell, applyCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "related-products", cells });
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

  // tools/importer/import-nri-home-loan-features.js
  var PAGE_TEMPLATE = {
    name: "nri-home-loan-features",
    description: "NRI Home Loan Features product page: hero-carousel, product tabs, intro, feature-carousel, disclaimer default content, CTA banner, FAQ accordion, and related-products cards.",
    urls: [
      "http://localhost:3000/nri-home-loan-features"
    ],
    blocks: [
      {
        name: "breadcrumb",
        instances: [
          ".breadcrumb-container .breadcrumb",
          ".breadcrumb-container .breadcrumb.block"
        ]
      },
      {
        name: "hero-carousel",
        instances: [
          ".hero-carousel-container .hero-carousel",
          "section.hero-carousel-container .hero-carousel.block"
        ]
      },
      {
        name: "tabs",
        instances: [
          ".tabs-container .tabs",
          ".tabs-container .tabs.block"
        ]
      },
      {
        name: "intro",
        instances: [
          ".intro-container .intro",
          ".intro-container .intro.block"
        ]
      },
      {
        name: "feature-carousel",
        instances: [
          ".feature-carousel-container .feature-carousel",
          ".feature-carousel-container .feature-carousel.block"
        ]
      },
      {
        name: "cta",
        instances: [
          ".cta-container .cta",
          ".cta-container .cta.block"
        ]
      },
      {
        name: "faq",
        instances: [
          ".faq-container .faq",
          ".faq-container .faq.block"
        ]
      },
      {
        name: "related-products",
        instances: [
          ".related-products-container .related-products",
          ".related-products-container .related-products.block"
        ]
      }
    ],
    sections: []
  };
  var parsers = {
    breadcrumb: parse,
    "hero-carousel": parse2,
    tabs: parse3,
    intro: parse4,
    "feature-carousel": parse5,
    cta: parse6,
    faq: parse7,
    "related-products": parse8
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
  var import_nri_home_loan_features_default = {
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
  return __toCommonJS(import_nri_home_loan_features_exports);
})();
