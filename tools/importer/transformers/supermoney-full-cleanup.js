/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: cleanup for the full supermoney page (header + hero + footer).
 *
 * Unlike supermoney-hero-cleanup, this KEEPS the header and footer — their
 * parsers run first and replace #header-nav / footer.footer with generated
 * blocks. In afterTransform we remove only the leftover in-main content
 * sections (everything except the hero, which its parser already replaced)
 * plus tracking pixels and stray shell elements.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    WebImporter.DOMUtils.remove(element, ['.loader']);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove leftover source sections inside main (hero already replaced by its
    // parser into a block div, so only un-parsed <section>s remain).
    const main = element.querySelector('main.Credit_card.SuperMoney_main__c7k8L')
      || element.querySelector('main');
    if (main) {
      main.querySelectorAll(':scope > section').forEach((section) => section.remove());
    }

    // Strip stray shell + tracking elements (header/footer are now blocks).
    WebImporter.DOMUtils.remove(element, ['iframe', 'link', 'meta']);

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
