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

  // tools/importer/import-supermoney-full.js
  var import_supermoney_full_exports = {};
  __export(import_supermoney_full_exports, {
    default: () => import_supermoney_full_default
  });

  // tools/importer/parsers/supermoney-header.js
  var NAV = [
    {
      label: "Savings",
      href: "/savings-account",
      subs: [
        { text: "811 Zero Balance Digital Savings Account", href: "/savings-account/811-zero-balance-digital-savings-account" },
        { text: "811 Super Savings Account", href: "/savings-account/811-super-savings-account" }
      ]
    },
    { label: "Current Account", href: "/current-account/811-business", subs: [] },
    {
      label: "Debit Card",
      href: "/debit-cards",
      subs: [
        { text: "Infinity Metal Debit Card", href: "/debit-cards/infinity-metal-debit-card" },
        { text: "PVR INOX Debit Card", href: "/debit-cards/pvr-inox-debit-card" }
      ]
    },
    {
      label: "Credit Card",
      href: "/credit-cards",
      subs: [
        { text: "Credit Card Against FD", href: "/credit-cards/811-dream-different-credit-card-against-fd" },
        { text: "Kotak811 super.money Credit Card", href: "/credit-cards/811-super-money-credit-card" }
      ]
    },
    { label: "Personal Loan", href: "/loans/personal-loan", subs: [] },
    { label: "Insights", href: "/insights", subs: [] }
  ];
  var LOGO_SRC = "https://www.kotak811.bank.in/images/loader-logo.svg";
  function parse(element, { document }) {
    const cta = element.querySelector('a[href*="app.link"]');
    const cells = [];
    const logoA = document.createElement("a");
    logoA.href = "https://www.kotak811.bank.in/";
    const logoImg = document.createElement("img");
    logoImg.src = LOGO_SRC;
    logoImg.alt = "Kotak811";
    logoA.append(logoImg);
    cells.push([[logoA]]);
    const navList = document.createElement("ul");
    NAV.forEach((item) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;
      li.append(a);
      if (item.subs && item.subs.length) {
        const sub = document.createElement("ul");
        item.subs.forEach((s) => {
          const subLi = document.createElement("li");
          const subA = document.createElement("a");
          subA.href = s.href;
          subA.textContent = s.text;
          subLi.append(subA);
          sub.append(subLi);
        });
        li.append(sub);
      }
      navList.append(li);
    });
    cells.push([navList]);
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
    const subtitleCell = [document.createComment(" field:subtitle ")];
    const subtitleP = document.createElement("p");
    subtitleP.textContent = eyebrow ? eyebrow.textContent.trim() : "";
    subtitleCell.push(subtitleP);
    cells.push([subtitleCell]);
    const titleCell = [document.createComment(" field:title ")];
    const titleP = document.createElement("p");
    titleP.textContent = heading ? heading.textContent.trim() : "";
    titleCell.push(titleP);
    cells.push([titleCell]);
    const descCell = [document.createComment(" field:description ")];
    const descP = document.createElement("p");
    descP.textContent = subtext ? subtext.textContent.trim() : "";
    descCell.push(descP);
    cells.push([descCell]);
    if (cta) {
      const linkCell = [document.createComment(" field:link ")];
      const a = document.createElement("a");
      a.href = cta.getAttribute("href") || "#";
      a.textContent = (cta.textContent || "").trim() || "Apply now";
      linkCell.push(a);
      cells.push([linkCell]);
    }
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
    const bcNav = element.querySelector('nav[class*="breadcrumb"], [class*="breadcrumb"]');
    const breadcrumb = document.createElement("p");
    breadcrumb.className = "supermoney-footer-breadcrumb";
    if (bcNav && bcNav.querySelector("a")) {
      bcNav.querySelectorAll("a").forEach((a, i) => {
        if (i > 0) breadcrumb.append(document.createTextNode(" \u203A "));
        const na = document.createElement("a");
        na.href = a.getAttribute("href") || "#";
        na.textContent = (a.textContent || "").trim();
        breadcrumb.append(na);
      });
    } else {
      const crumbs = [
        { text: "Home", href: "/" },
        { text: "Credit cards", href: "/credit-cards" },
        { text: "811 super money credit card", href: "/credit-cards/811-super-money-credit-card" }
      ];
      crumbs.forEach((c, i) => {
        if (i > 0) breadcrumb.append(document.createTextNode(" \u203A "));
        const a = document.createElement("a");
        a.href = c.href;
        a.textContent = c.text;
        breadcrumb.append(a);
      });
    }
    brandCell.push(breadcrumb);
    const SOCIAL_FALLBACK = [
      { net: "facebook", href: "https://www.facebook.com/Kotak811DigitalBank/" },
      { net: "instagram", href: "https://www.instagram.com/kotak811/" },
      { net: "twitter", href: "https://twitter.com/kotak811" },
      { net: "youtube", href: "https://www.youtube.com/@kotak811" }
    ];
    const socialList = [...element.querySelectorAll("ul")].find((ul) => ul.querySelector('a[href*="facebook"], a[href*="instagram"], a[href*="twitter"], a[href*="youtube"]'));
    const clean = document.createElement("ul");
    if (socialList) {
      socialList.querySelectorAll(":scope > li a").forEach((a) => {
        const href = a.getAttribute("href") || "#";
        const li = document.createElement("li");
        const na = document.createElement("a");
        na.href = href;
        na.textContent = href.replace(/https?:\/\/(www\.)?/, "").split(".")[0] || "link";
        li.append(na);
        clean.append(li);
      });
    } else {
      SOCIAL_FALLBACK.forEach(({ net, href }) => {
        const li = document.createElement("li");
        const na = document.createElement("a");
        na.href = href;
        na.textContent = net;
        li.append(na);
        clean.append(li);
      });
    }
    brandCell.push(clean);
    const telLink = element.querySelector('a[href^="tel:"]');
    const contact = document.createElement("p");
    contact.className = "supermoney-footer-help";
    if (telLink) {
      const label = document.createElement("span");
      label.textContent = "Need help? Connect with us through the below channels";
      const call = document.createElement("a");
      call.href = telLink.getAttribute("href");
      call.textContent = (telLink.textContent || "").trim() || "Call us on: 1800 4100";
      contact.append(label, document.createElement("br"), call);
    } else {
      const label = document.createElement("span");
      label.textContent = "Need help? Connect with us through the below channels";
      const call = document.createElement("a");
      call.href = "tel:1800 4100";
      call.textContent = "Call us on: 1800 4100";
      contact.append(label, document.createElement("br"), call);
    }
    brandCell.push(contact);
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
      const clean2 = document.createElement("ul");
      list.querySelectorAll(":scope > li a").forEach((a) => {
        const li = document.createElement("li");
        const na = document.createElement("a");
        na.href = a.getAttribute("href") || "#";
        na.textContent = (a.textContent || "").trim();
        li.append(na);
        clean2.append(li);
      });
      if (clean2.children.length) {
        cell.push(clean2);
        columnCells.push(cell);
      }
    });
    if (columnCells.length) cells.push(columnCells);
    const legalList = [...element.querySelectorAll("ul")].reverse().find((ul) => ul.querySelector('a[href*="privacy"], a[href*="terms"], a[href*="disclaimer"]'));
    if (legalList) {
      const clean2 = document.createElement("ul");
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
        clean2.append(newLi);
      });
      cells.push([[clean2]]);
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
    const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
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
