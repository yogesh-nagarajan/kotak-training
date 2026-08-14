/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: kotak site-wide cleanup.
 *
 * Removes non-authorable site chrome so the import contains only page-level
 * authorable content. All selectors below are verified against
 * migration-work/cleaned.html for the "hero-carousel-demo" template
 * (locally-rendered AEM Edge Delivery preview markup).
 *
 * Verified in cleaned.html:
 *   - <header class="header-wrapper"> ... <div class="header block"> (line 2-5)
 *   - <footer class="footer-wrapper"> ... <div class="footer block"> (line 111-114)
 *
 * No cookie banners, overlays, breadcrumbs, sidebars, search, or utility nav
 * are present in the captured DOM, so none are targeted here (never guess
 * selectors). Add site-specific selectors from captured DOM as later
 * templates of this site are migrated.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome (site shell header/footer). Selectors
    // verified in migration-work/cleaned.html.
    WebImporter.DOMUtils.remove(element, [
      'header.header-wrapper',
      'footer.footer-wrapper',
    ]);
  }
}
