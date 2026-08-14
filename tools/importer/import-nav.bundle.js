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

  // tools/importer/import-nav.js
  var import_nav_exports = {};
  __export(import_nav_exports, {
    default: () => import_nav_default
  });

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

  // tools/importer/import-nav.js
  var transformers = [
    transform
  ];
  function executeTransformers(hookName, element, payload) {
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, payload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  var import_nav_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      executeTransformers("afterTransform", main, payload);
      const sections = main.querySelectorAll(":scope > .section, main > .section");
      if (sections.length > 1) {
        const rebuilt = document.createElement("div");
        sections.forEach((section, i) => {
          if (i > 0) rebuilt.appendChild(document.createElement("hr"));
          const inner = section.querySelector(":scope > .default-content-wrapper") || section;
          while (inner.firstChild) rebuilt.appendChild(inner.firstChild);
        });
        main.replaceChildren(...rebuilt.childNodes);
      }
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/^\/content(?=\/)/, "").replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title || "nav", template: "nav-fragment" }
      }];
    }
  };
  return __toCommonJS(import_nav_exports);
})();
