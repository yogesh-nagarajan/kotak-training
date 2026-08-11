/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: cleanup for the merged supermoney-hero page import.
 *
 * Removes non-authorable site chrome (header, footer, breadcrumb, tracking
 * iframe/pixels) but does NOT trim content sections — the supermoney-hero
 * parser consumes both the hero and cards sections itself. After the parser
 * runs, any remaining non-hero/cards sections are removed in afterTransform so
 * only the merged block survives on the page.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    WebImporter.DOMUtils.remove(element, ['.loader']);
  }

  if (hookName === TransformHook.afterTransform) {
    WebImporter.DOMUtils.remove(element, [
      '#header-nav',
      'footer.footer',
      '#breadcrumb-nav',
      'iframe',
      'link',
      'meta',
    ]);

    // Remove any leftover source sections not consumed by the parser, so only
    // the generated supermoney-hero block remains.
    const main = element.querySelector('main.Credit_card.SuperMoney_main__c7k8L')
      || element.querySelector('main');
    if (main) {
      main.querySelectorAll(':scope > section').forEach((section) => section.remove());
    }

    // Remove tracking-pixel images injected by analytics/ad scripts.
    const TRACKER_HOSTS = /(t\.co|analytics\.twitter\.com|bat\.bing\.com|c\.bing\.com|google-analytics\.com|googletagmanager\.com|doubleclick\.net|facebook\.com\/tr)/i;
    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (TRACKER_HOSTS.test(src)) {
        const wrapper = img.closest('picture') || img;
        const para = wrapper.closest('p');
        wrapper.remove();
        if (para && !para.querySelector('img, picture') && !para.textContent.trim()) {
          para.remove();
        }
      }
    });
  }
}
