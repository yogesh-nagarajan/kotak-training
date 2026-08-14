import { getMetadata } from '../../scripts/aem.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

// the top-level nav section that represents the current page context

/**
 * Fetch the nav fragment. Prefer the localhost/aem-up path, then fall back to
 * the DA/EDS production path derived from the `nav` metadata.
 * @returns {HTMLElement|null} a container holding the fragment's top-level sections
 */
async function loadNavFragment() {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';

  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch(`${navPath}.plain.html`);
  if (!resp.ok) return null;

  const container = document.createElement('div');
  container.innerHTML = await resp.text();

  // rewrite relative image paths (images/…) to the nav content folder
  container.querySelectorAll('img[src^="images/"]').forEach((img) => {
    img.src = new URL(`/content/${img.getAttribute('src')}`, window.location).href;
  });
  return container;
}

/** Collapse every open top-level menu. */
function closeAllSections(navSections) {
  navSections.querySelectorAll(':scope > ul > li[aria-expanded="true"]')
    .forEach((li) => li.setAttribute('aria-expanded', 'false'));
}

/** Close all top-level menus (alias used in other handlers). */
function toggleAllNavSections(navSections) {
  closeAllSections(navSections);
}

/**
 * Decorate a top-level nav item that carries a megamenu panel (a nested <div>).
 * Builds the sidebar (categories) + content panels (links with icons) and wires
 * category switching. Used for the desktop dropdown; the same structure is
 * reused on mobile as the pill → discover-heading → category-list view.
 * @param {HTMLLIElement} li the top-level list item
 */

/**
 * Wire the mobile "pill bar": clicking a top-level pill activates that menu and
 * shows its megamenu (heading + category list) below the pills.
 * @param {Element} navSections
 */
function setupMobilePills(navSections) {
  const items = [...navSections.querySelectorAll(':scope > ul > li')];
  const activate = (li) => {
    items.forEach((other) => other.setAttribute('aria-expanded', other === li ? 'true' : 'false'));
  };
  // default the first drop item open on mobile only (desktop opens on hover)
  const firstDrop = items.find((li) => li.classList.contains('nav-drop'));
  if (firstDrop && !isDesktop.matches) activate(firstDrop);
  return activate;
}

/**
 * Decorate a top-level nav item as a Kotak mega-menu or a simple dropdown.
 * MEGA  = the item's nested <ul> contains categories that themselves have a
 *         nested <ul> of links (two levels: category -> links).
 * SIMPLE = the item's nested <ul> contains only links (one level).
 * @param {Element} navSection The top-level <li>
 */
/**
 * Get a nav item's own label — the text before its nested <ul>. Handles both a
 * bare text node (`<li>Personal<ul>…`) and a leading paragraph
 * (`<li><p>Personal</p><ul>…`), the shape produced by the content importer.
 * @param {Element} el The <li>
 * @returns {string} The trimmed label
 */
// matches a leading EDS icon token like ":accounts:" in a text label

/**
 * Get a nav item's own label text — the text before its nested <ul>, with any
 * leading icon span or `:name:` icon token stripped. Handles a bare text node
 * (`<li>Personal<ul>…`) or a leading paragraph (`<li><p>Personal</p><ul>…`),
 * the shape produced by the content importer.
 * @param {Element} el The <li>
 * @returns {string} The trimmed label
 */

/**
 * Build the leading icon element for a nav item, from either a decorated
 * `<span class="icon icon-name">` or a `:name:` token in the label text.
 * @param {Element} el The <li>
 * @returns {Element|null} An icon <span> (with <img>), or null
 */

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await loadNavFragment();
  block.textContent = '';
  if (!fragment) return;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Brand: strip button styling from the logo link
  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  let activateMobile = () => {};
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
    activateMobile = setupMobilePills(navSections);
  }

  // mark the login button in tools for styling
  const navTools = nav.querySelector('.nav-tools');
  navTools?.querySelector('a')?.classList.add('nav-login');

  // search control: a button toggling an inline search field, placed before Login
  if (navTools) {
    const search = document.createElement('div');
    search.className = 'nav-search';
    const searchBtn = document.createElement('button');
    searchBtn.type = 'button';
    searchBtn.className = 'nav-search-toggle';
    searchBtn.setAttribute('aria-label', 'Search');
    searchBtn.setAttribute('aria-expanded', 'false');
    const searchField = document.createElement('input');
    searchField.type = 'search';
    searchField.className = 'nav-search-field';
    searchField.placeholder = 'Search';
    searchField.setAttribute('aria-label', 'Search');
    searchField.hidden = true;
    searchBtn.addEventListener('click', () => {
      const open = searchBtn.getAttribute('aria-expanded') === 'true';
      searchBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
      searchField.hidden = open;
      if (!open) searchField.focus();
    });
    search.append(searchBtn, searchField);
    navTools.prepend(search);
  }

  // Tools: search icon + Login pill

  if (navTools) {
    navTools.querySelectorAll('a').forEach((a) => {
      const label = a.textContent.trim().toLowerCase();
      if (label === 'search') {
        a.classList.add('nav-search');
        a.setAttribute('aria-label', 'Search');
        a.textContent = '';
      } else if (label === 'login') {
        a.classList.add('nav-login');
      }
    });
  }

  // Hamburger / close toggle (mobile)
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  const toggleMenu = () => {
    const expanded = nav.getAttribute('aria-expanded') === 'true';
    nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    document.body.style.overflowY = expanded || isDesktop.matches ? '' : 'hidden';
    hamburger.querySelector('button').setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  };
  hamburger.addEventListener('click', toggleMenu);
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // reset state when crossing the desktop/mobile breakpoint
  isDesktop.addEventListener('change', () => {
    nav.setAttribute('aria-expanded', 'false');
    document.body.style.overflowY = '';
    if (navSections) {
      closeAllSections(navSections);
      if (!isDesktop.matches) activateMobile(navSections.querySelector(':scope > ul > li.nav-drop'));
    }
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
