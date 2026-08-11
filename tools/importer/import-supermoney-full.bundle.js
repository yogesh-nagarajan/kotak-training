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

  // tools/importer/import-supermoney-full.js
  var import_supermoney_full_exports = {};
  __export(import_supermoney_full_exports, {
    default: () => import_supermoney_full_default
  });

  // tools/importer/parsers/supermoney-header.js
  var TOP_NAV = ["savings", "current account", "debit card", "credit card", "personal loan", "insights"];
  function cleanLabel(text) {
    return (text || "").replace(/\s*-\s*(true|false)\s*$/i, "").replace(/\s+/g, " ").trim();
  }
  function parse(element, { document }) {
    const logoLink = element.querySelector('a[href$="kotak811.bank.in/"], a[aria-label*="logo" i]') || (element.querySelector("a img") ? element.querySelector("a img").closest("a") : null);
    const logoImg = element.querySelector("img");
    const cta = element.querySelector('a[href*="app.link"]');
    const cells = [];
    const logoCell = [];
    const logoA = document.createElement("a");
    logoA.href = logoLink && logoLink.getAttribute("href") || "https://www.kotak811.bank.in/";
    if (logoImg) {
      logoA.append(logoImg);
    } else {
      logoA.textContent = "Kotak811";
    }
    logoCell.push(logoA);
    cells.push([logoCell]);
    const cleanList = document.createElement("ul");
    const seen = /* @__PURE__ */ new Set();
    element.querySelectorAll("a[href]").forEach((a) => {
      const label = cleanLabel(a.textContent);
      const key = label.toLowerCase();
      if (TOP_NAV.includes(key) && !seen.has(key)) {
        seen.add(key);
        const li = document.createElement("li");
        const na = document.createElement("a");
        na.href = a.getAttribute("href") || "#";
        na.textContent = label;
        li.append(na);
        cleanList.append(li);
      }
    });
    cells.push([cleanList]);
    const ctaCell = [];
    if (cta) {
      const newCta = document.createElement("a");
      newCta.href = cta.getAttribute("href") || "#";
      newCta.textContent = "Apply Now";
      ctaCell.push(newCta);
    }
    cells.push([ctaCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "supermoney-header", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/supermoney-hero.js
  function parse2(element, { document }) {
    const cells = [];
    const bgImage = element.querySelector('img[class*="desktop-display"], img[class*="absolute"]') || element.querySelector("img");
    if (bgImage) {
      cells.push([[document.createComment(" field:image "), bgImage]]);
    }
    const mobileImage = element.querySelector('img[class*="mobile-display"]');
    if (mobileImage && mobileImage !== bgImage) {
      cells.push([[document.createComment(" field:imageMobile "), mobileImage]]);
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

  // tools/importer/parsers/supermoney-footer.js
  function parse3(element, { document }) {
    const cells = [];
    const brandCell = [];
    const logo = element.querySelector("img");
    if (logo) {
      const p = document.createElement("p");
      p.append(logo);
      brandCell.push(p);
    }
    const socialList = [...element.querySelectorAll("ul")].find((ul) => ul.querySelector('a[href*="facebook"], a[href*="instagram"], a[href*="twitter"], a[href*="youtube"]'));
    if (socialList) {
      const clean = document.createElement("ul");
      socialList.querySelectorAll(":scope > li a").forEach((a) => {
        const li = document.createElement("li");
        const na = document.createElement("a");
        na.href = a.getAttribute("href") || "#";
        na.textContent = (a.getAttribute("href") || "").replace(/https?:\/\/(www\.)?/, "").split(".")[0] || "link";
        li.append(na);
        clean.append(li);
      });
      brandCell.push(clean);
    }
    cells.push([brandCell]);
    const columnCells = [];
    element.querySelectorAll("h3").forEach((h3) => {
      const heading = (h3.textContent || "").trim();
      let list = h3.nextElementSibling;
      while (list && list.tagName !== "UL") list = list.nextElementSibling;
      if (!list) return;
      const cell = [];
      const newH3 = document.createElement("h3");
      newH3.textContent = heading;
      cell.push(newH3);
      const clean = document.createElement("ul");
      list.querySelectorAll(":scope > li a").forEach((a) => {
        const li = document.createElement("li");
        const na = document.createElement("a");
        na.href = a.getAttribute("href") || "#";
        na.textContent = (a.textContent || "").trim();
        li.append(na);
        clean.append(li);
      });
      if (clean.children.length) {
        cell.push(clean);
        columnCells.push(cell);
      }
    });
    if (columnCells.length) cells.push(columnCells);
    const legalList = [...element.querySelectorAll("ul")].reverse().find((ul) => ul.querySelector('a[href*="privacy"], a[href*="terms"], a[href*="disclaimer"]'));
    if (legalList) {
      const clean = document.createElement("ul");
      legalList.querySelectorAll(":scope > li").forEach((li) => {
        const a = li.querySelector("a");
        const newLi = document.createElement("li");
        if (a) {
          const na = document.createElement("a");
          na.href = a.getAttribute("href") || "#";
          na.textContent = (li.textContent || "").trim();
          newLi.append(na);
        } else {
          newLi.textContent = (li.textContent || "").trim();
        }
        clean.append(newLi);
      });
      cells.push([[clean]]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "supermoney-footer", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/supermoney-full-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [".loader"]);
    }
    if (hookName === TransformHook.afterTransform) {
      const main = element.querySelector("main.Credit_card.SuperMoney_main__c7k8L") || element.querySelector("main");
      if (main) {
        main.querySelectorAll(":scope > section").forEach((section) => section.remove());
      }
      WebImporter.DOMUtils.remove(element, ["iframe", "link", "meta"]);
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

  // tools/importer/import-supermoney-full.js
  var parsers = {
    "supermoney-header": parse,
    "supermoney-hero": parse2,
    "supermoney-footer": parse3
  };
  var transformers = [transform];
  var PAGE_TEMPLATE = {
    name: "supermoney-full",
    description: "Full super.money page: header + hero + footer.",
    urls: [
      "https://www.kotak811.bank.in/credit-cards/811-super-money-credit-card"
    ],
    blocks: [
      { name: "supermoney-header", instances: ["#header-nav"] },
      { name: "supermoney-hero", instances: ["main.Credit_card.SuperMoney_main__c7k8L > section.SuperMoney_heroBan__rCeAx"] },
      { name: "supermoney-footer", instances: ["footer.footer"] }
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
  var import_supermoney_full_default = {
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
  return __toCommonJS(import_supermoney_full_exports);
})();
