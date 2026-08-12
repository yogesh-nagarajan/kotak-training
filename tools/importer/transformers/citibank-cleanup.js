/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Citibank site-wide cleanup.
 *
 * Source is an Angular SPA (app-root). All selectors below were verified
 * against migration-work/cleaned.html for the Cash Back+ card benefit page.
 *
 * Non-authorable site chrome that EDS auto-populates (header/footer) or that
 * is not page content (cookie policy, speed bump, page loader) is removed.
 *
 * IMPORTANT: The empty spacer <ui-dynamic-widget> elements (widgets 1-3, 5, 8)
 * are intentionally NOT removed. The section transformer and block parsers
 * target content via `ui-dynamic-widget:nth-of-type(N)`; removing the spacer
 * widgets would renumber the remaining widgets and break those selectors.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / non-content chrome that appear before the page body.
    // Verified in cleaned.html: <div class="pageLoader"> (line 2),
    // <branding-speed-bump> (line 8), <branding-cookie-policy> (line 10).
    WebImporter.DOMUtils.remove(element, [
      '.pageLoader',
      'branding-speed-bump',
      'branding-cookie-policy',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Site header/footer are auto-populated in EDS -> remove the source chrome.
    // Verified in cleaned.html: <branding-header> (line 42) wrapping
    // <header id="header"> (line 43); <branding-footer> (line 6230) wrapping
    // <footer> (line 6232), <branding-footer-prelogin> and <branding-footer-nav>.
    WebImporter.DOMUtils.remove(element, [
      'branding-header',
      'branding-footer',
    ]);

    // Safe non-authorable elements. <script>/<noscript> verified in cleaned.html
    // (lines 6594/6596); the rest are no-ops if absent.
    WebImporter.DOMUtils.remove(element, [
      'script',
      'noscript',
      'iframe',
      'link',
      'style',
      'source',
      'template',
    ]);

    // Remove analytics/tracking pixel images that are injected into the DOM by
    // martech scripts (e.g. Yahoo dot pixel sp.analytics.yahoo.com/sp.pl). These
    // are not authorable content but survive into the imported page as <img>.
    const trackingHosts = [
      'sp.analytics.yahoo.com',
      'analytics.yahoo.com',
      'doubleclick.net',
      'google-analytics.com',
      'googletagmanager.com',
      'demdex.net',
      'adnxs.com',
      'quantserve.com',
      'scorecardresearch.com',
      'facebook.com/tr',
    ];
    element.querySelectorAll('img[src]').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (trackingHosts.some((host) => src.includes(host))) {
        const wrapper = img.closest('p') || img;
        wrapper.remove();
      }
    });
  }
}
