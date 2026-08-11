/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Kotak811 site-wide cleanup.
 *
 * Strips non-authorable page shell / chrome so the imported document contains
 * only the page-level authorable content that lives inside
 * `main.Credit_card.SuperMoney_main__c7k8L`. The import script exports
 * `document.body`, so every non-authorable element left in <body> would leak
 * into the output — hence they are removed here.
 *
 * Every selector below was verified against migration-work/cleaned.html for
 * https://www.kotak811.bank.in/credit-cards/811-super-money-credit-card
 * (no guessed selectors):
 *   - <div class="loader hideLoader">              -> `.loader`         loading-spinner overlay
 *   - <nav ... id="header-nav">                    -> `#header-nav`     main site header / navigation
 *   - <footer class="footer ...">                  -> `footer.footer`   site footer (also wraps the breadcrumb nav)
 *   - <nav ... id="breadcrumb-nav"> (inside footer) -> `#breadcrumb-nav` breadcrumb navigation
 *   - <iframe id="__tvc_uuid_frame" ...>           -> `iframe`          cross-sell tracking iframe
 *   - <link href=".../loader-logo.svg">            -> `link`            stray body-level asset <link>
 *   - <meta>                                       -> `meta`            stray body-level <meta>
 *
 * No cookie/consent banners, <script>, <style>, or <noscript> elements are
 * present in the captured DOM (verified 0 occurrences), so none are targeted.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Loading-spinner overlay (non-authorable). Removed early; outside main,
    // so it never affects block matching.
    WebImporter.DOMUtils.remove(element, ['.loader']);

    // TEMPORARY SCOPE: keep only the hero banner and the cashback cards.
    // Remove every other content section from main so the imported page shows
    // just those two blocks. The second hero (CTA band, nth-of-type(12)) is
    // intentionally dropped too. Done in beforeTransform so removed sections
    // are never matched/parsed downstream.
    const main = element.querySelector('main.Credit_card.SuperMoney_main__c7k8L')
      || element.querySelector('main');
    if (main) {
      const KEEP = (section) => section.matches('section.SuperMoney_heroBan__rCeAx')
        || (section.className || '').split(/\s+/).includes('z-pos-fix]');
      Array.from(main.querySelectorAll(':scope > section')).forEach((section) => {
        if (!KEEP(section)) section.remove();
      });
    }
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome + leftover shell elements.
    WebImporter.DOMUtils.remove(element, [
      '#header-nav',     // main site navigation / header
      'footer.footer',   // site footer (also removes the nested #breadcrumb-nav)
      '#breadcrumb-nav', // breadcrumb navigation (explicit, in case footer scope changes)
      'iframe',          // cross-sell tracking iframe (#__tvc_uuid_frame)
      'link',            // stray body-level <link> (loader-logo asset)
      'meta',            // stray body-level <meta>
    ]);

    // Remove tracking-pixel images injected by analytics/ad scripts (Twitter,
    // Bing, etc.). These are 1x1 beacons, not authorable content; they get
    // appended into <body> and would otherwise leak into the imported page.
    const TRACKER_HOSTS = /(t\.co|analytics\.twitter\.com|bat\.bing\.com|c\.bing\.com|google-analytics\.com|googletagmanager\.com|doubleclick\.net|facebook\.com\/tr)/i;
    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (TRACKER_HOSTS.test(src)) {
        const wrapper = img.closest('picture') || img;
        const para = wrapper.closest('p');
        // Drop the beacon; if its <p> wrapper is now empty, drop that too.
        wrapper.remove();
        if (para && !para.querySelector('img, picture') && !para.textContent.trim()) {
          para.remove();
        }
      }
    });
  }
}
