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
  // Page-specific headers keyed by page path. Each entry maps a page (matched by
  // the trailing path segment, ignoring any .plain.html/.html suffix or /content
  // mount prefix) to a dedicated nav fragment. Any page not listed falls through
  // to the global-nav logic below, unchanged.
  // Each entry maps a page (matched by the trailing path segment, ignoring any
  // .plain.html/.html suffix or /content mount prefix) to the base path of its
  // dedicated nav fragment. Both the local `/content/<name>.plain.html` and the
  // delivery `<name>.plain.html` variants are tried so it works in either env.
  const pageNavFragments = {
    '/nri-home-loan-features': '/nav-nri-home-loan',
    '/811-buisness-demo': '/nav-variation',
  };
  const currentPath = window.location.pathname.split('.')[0];
  const pageNavKey = Object.keys(pageNavFragments)
    .find((page) => currentPath.endsWith(page));
  if (pageNavKey) {
    const base = pageNavFragments[pageNavKey];
    let pageResp = await fetch(`/content${base}.plain.html`);
    if (!pageResp.ok) pageResp = await fetch(`${base}.plain.html`);
    if (pageResp.ok) {
      const pageContainer = document.createElement('div');
      pageContainer.innerHTML = await pageResp.text();
      pageContainer.querySelectorAll('img[src^="images/"]').forEach((img) => {
        img.src = new URL(`/content/${img.getAttribute('src')}`, window.location).href;
      });
      return pageContainer;
    }
    // if the page-specific fragment is missing, fall through to the default
  }

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

// matches a leading EDS icon token like ":accounts:" in a text label
const ICON_TOKEN = /^\s*:([a-z0-9-]+):\s*/i;

/**
 * Build a leading icon <span> from a `:name:` token found in a text label, so
 * the imported nav (which stores tokens as plain text) shows category icons.
 * @param {string} text
 * @returns {Element|null}
 */
function iconFromToken(text) {
  const match = (text || '').match(ICON_TOKEN);
  if (!match) return null;
  const span = document.createElement('span');
  span.className = `icon icon-${match[1]}`;
  const img = document.createElement('img');
  img.src = `${window.hlx.codeBasePath}/icons/${match[1]}.svg`;
  img.alt = '';
  img.loading = 'lazy';
  span.append(img);
  return span;
}

/**
 * Decorate a top-level nav item that carries a megamenu (a nested <ul> of
 * categories, each with its own nested <ul> of links — the shape produced by
 * the content importer). Builds the `.nav-megamenu` panel (sidebar categories +
 * content link panels) that header.css hides by default and reveals only when
 * the parent <li> has aria-expanded="true". This is what keeps the menu CLOSED
 * on initial load — without it the raw <ul> renders inline over the hero.
 * @param {HTMLLIElement} li the top-level list item
 */
function decorateMegamenu(li) {
  const categoryList = li.querySelector(':scope > ul');
  if (!categoryList) return;

  li.classList.add('nav-drop');
  li.setAttribute('aria-expanded', 'false');

  // top-level label (e.g. "Personal") for the "Discover Personal →" heading
  const topLabel = (li.querySelector(':scope > p') || li).childNodes[0]?.textContent.trim() || '';

  const panel = document.createElement('div');
  panel.className = 'nav-megamenu';

  const categoriesHaveSubLists = [...categoryList.children]
    .some((cat) => cat.querySelector(':scope > ul'));

  // "Discover {label} →" header (mega menus only; simple dropdowns skip it)
  if (topLabel && categoriesHaveSubLists) {
    const heading = document.createElement('div');
    heading.className = 'nav-megamenu-heading';
    const headingLink = document.createElement('a');
    headingLink.href = '#';
    headingLink.textContent = `Discover ${topLabel}`;
    heading.append(headingLink);
    panel.append(heading);
  }

  const body = document.createElement('div');
  body.className = 'nav-megamenu-body';

  const sidebar = document.createElement('ul');
  sidebar.className = 'nav-megamenu-sidebar';

  const content = document.createElement('div');
  content.className = 'nav-megamenu-content';

  const categories = [...categoryList.children];
  const hasSubLists = categories.some((cat) => cat.querySelector(':scope > ul'));

  // SIMPLE menus (About Us / Learn / Help): no category sub-lists — render the
  // links as ONE panel (first item highlighted as a white card), no sidebar.
  if (!hasSubLists) {
    const simplePanel = document.createElement('ul');
    simplePanel.className = 'nav-megamenu-panel nav-megamenu-simple is-active';
    categories.forEach((cat, index) => {
      const anchor = cat.querySelector('a');
      const item = document.createElement('li');
      if (index === 0) item.classList.add('is-active');
      if (anchor) {
        item.append(anchor);
      } else {
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = (cat.textContent || '').trim();
        item.append(a);
      }
      simplePanel.append(item);
    });
    content.append(simplePanel);
    body.append(content);
    panel.append(body);
    categoryList.remove();
    li.append(panel);
    return;
  }

  categories.forEach((cat, index) => {
    // category label = its own text (before any nested <ul>), icon token stripped
    const rawLabel = (cat.querySelector(':scope > p') || cat).textContent || '';
    const label = rawLabel.replace(ICON_TOKEN, '').trim();
    const icon = iconFromToken(rawLabel);
    const subLinks = cat.querySelector(':scope > ul');

    // sidebar entry
    const sideItem = document.createElement('li');
    sideItem.className = 'nav-megamenu-category';
    const sideBtn = document.createElement('a');
    sideBtn.href = subLinks ? '#' : (cat.querySelector('a')?.getAttribute('href') || '#');
    if (icon) sideBtn.append(icon);
    sideBtn.append(document.createTextNode(label));
    sideItem.append(sideBtn);
    if (index === 0) sideItem.classList.add('is-active');
    sidebar.append(sideItem);

    // content panel for this category (its links)
    const catPanel = document.createElement('ul');
    catPanel.className = 'nav-megamenu-panel';
    if (index === 0) catPanel.classList.add('is-active');
    if (subLinks) {
      [...subLinks.children].forEach((linkLi) => {
        const anchor = linkLi.querySelector('a');
        if (!anchor) return;
        // a leading `:name:` token on the <li> becomes the product icon,
        // prepended inside the anchor so it sits beside the label
        const linkIcon = iconFromToken(linkLi.textContent);
        if (linkIcon && !anchor.querySelector('.icon')) {
          // strip the literal ":name:" text nodes so only the icon+label show
          [...linkLi.childNodes].forEach((n) => {
            if (n.nodeType === 3 && ICON_TOKEN.test(n.textContent)) n.remove();
          });
          anchor.prepend(linkIcon);
        }
        catPanel.append(linkLi);
      });
    }
    content.append(catPanel);

    const activate = () => {
      sidebar.querySelectorAll('.nav-megamenu-category').forEach((s) => s.classList.remove('is-active'));
      content.querySelectorAll('.nav-megamenu-panel').forEach((p) => p.classList.remove('is-active'));
      sideItem.classList.add('is-active');
      catPanel.classList.add('is-active');
    };
    sideBtn.addEventListener('mouseenter', activate);
    sideBtn.addEventListener('focus', activate);
    sideBtn.addEventListener('click', (e) => {
      if (subLinks) e.preventDefault();
      activate();
    });
  });

  // MEGA menus: sidebar (categories) + content (active category's links)
  body.append(sidebar, content);
  panel.append(body);

  // remove the raw source list and attach the decorated (hidden) panel
  categoryList.remove();
  li.append(panel);
}

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
    // top-level items live directly under nav-sections > ul (the nav fragment is
    // fetched raw, so there is no .default-content-wrapper to traverse)
    const topSelector = navSections.querySelector(':scope > .default-content-wrapper')
      ? ':scope .default-content-wrapper > ul > li'
      : ':scope > ul > li';
    navSections.querySelectorAll(topSelector).forEach((navSection) => {
      // build the collapsed megamenu panel (starts closed via aria-expanded=false)
      if (navSection.querySelector(':scope > ul')) decorateMegamenu(navSection);

      // desktop: open on hover, close when the pointer leaves the whole item
      navSection.addEventListener('mouseenter', () => {
        if (!isDesktop.matches) return;
        closeAllSections(navSections);
        navSection.setAttribute('aria-expanded', 'true');
      });
      navSection.addEventListener('mouseleave', () => {
        if (!isDesktop.matches) return;
        navSection.setAttribute('aria-expanded', 'false');
      });

      // click/keyboard: toggle (desktop) or expand pill (mobile)
      navSection.addEventListener('click', (e) => {
        if (isDesktop.matches) {
          if (e.target.closest('.nav-megamenu')) return; // let links inside work
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          closeAllSections(navSections);
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
