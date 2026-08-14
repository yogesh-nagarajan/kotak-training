import { getMetadata } from '../../scripts/aem.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

// the top-level nav section that represents the current page context
const CURRENT_SECTION = 'NRI';

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

/**
 * Decorate a top-level nav item that carries a megamenu panel (a nested <div>).
 * Builds the sidebar (categories) + content panels (links with icons) and wires
 * category switching. Used for the desktop dropdown; the same structure is
 * reused on mobile as the pill → discover-heading → category-list view.
 * @param {HTMLLIElement} li the top-level list item
 */
function decorateMegamenu(li) {
  const panelSource = li.querySelector(':scope > div');
  if (!panelSource) return;

  li.classList.add('nav-drop');

  const heading = panelSource.querySelector(':scope > p');
  const categoryList = panelSource.querySelector(':scope > ul');
  if (!categoryList) return;

  const panel = document.createElement('div');
  panel.className = 'nav-megamenu';

  if (heading) {
    const headEl = document.createElement('div');
    headEl.className = 'nav-megamenu-heading';
    headEl.append(...heading.childNodes);
    panel.append(headEl);
  }

  const body = document.createElement('div');
  body.className = 'nav-megamenu-body';

  const sidebar = document.createElement('ul');
  sidebar.className = 'nav-megamenu-sidebar';

  const content = document.createElement('div');
  content.className = 'nav-megamenu-content';

  [...categoryList.children].forEach((cat, index) => {
    const catLink = cat.querySelector(':scope > a');
    const catLinks = cat.querySelector(':scope > ul');

    // sidebar entry — clone the category anchor so its icon is preserved
    const sideItem = document.createElement('li');
    sideItem.className = 'nav-megamenu-category';
    const sideBtn = catLink ? catLink.cloneNode(true) : document.createElement('a');
    sideItem.append(sideBtn);
    if (index === 0) sideItem.classList.add('is-active');
    sidebar.append(sideItem);

    // content panel for this category
    const catPanel = document.createElement('ul');
    catPanel.className = 'nav-megamenu-panel';
    if (index === 0) catPanel.classList.add('is-active');
    if (catLinks) {
      [...catLinks.children].forEach((linkLi) => {
        if (linkLi.querySelector('a')) catPanel.append(linkLi);
      });
    }
    content.append(catPanel);

    const activate = () => {
      sidebar.querySelectorAll('.nav-megamenu-category').forEach((s) => s.classList.remove('is-active'));
      content.querySelectorAll('.nav-megamenu-panel').forEach((p) => p.classList.remove('is-active'));
      sideItem.classList.add('is-active');
      catPanel.classList.add('is-active');
    };
    sideItem.addEventListener('mouseenter', activate);
    sideBtn.addEventListener('focus', activate);
    // on mobile the sidebar item behaves as an expandable row
    sideBtn.addEventListener('click', (e) => {
      if (!isDesktop.matches && catPanel.children.length) {
        e.preventDefault();
        const open = sideItem.classList.contains('is-open');
        sideItem.classList.toggle('is-open', !open);
      }
    });

    body.append(sidebar, content);
  });

  panel.append(body);
  panelSource.replaceWith(panel);
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
const ICON_TOKEN = /^\s*:([a-z0-9-]+):\s*/i;

/**
 * Get a nav item's own label text — the text before its nested <ul>, with any
 * leading icon span or `:name:` icon token stripped. Handles a bare text node
 * (`<li>Personal<ul>…`) or a leading paragraph (`<li><p>Personal</p><ul>…`),
 * the shape produced by the content importer.
 * @param {Element} el The <li>
 * @returns {string} The trimmed label
 */
function getItemLabel(el) {
  const nodes = [...el.childNodes];
  let label = '';
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    if (node.nodeType === 1 && node.tagName === 'UL') break;
    const isIcon = node.nodeType === 1 && node.classList?.contains('icon');
    const text = isIcon ? '' : node.textContent.trim();
    if (text) {
      label = text.replace(ICON_TOKEN, '').trim();
      break;
    }
  }
  return label;
}

/**
 * Build the leading icon element for a nav item, from either a decorated
 * `<span class="icon icon-name">` or a `:name:` token in the label text.
 * @param {Element} el The <li>
 * @returns {Element|null} An icon <span> (with <img>), or null
 */
function getItemIcon(el) {
  const nodes = [...el.childNodes];
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    if (node.nodeType === 1 && node.tagName === 'UL') break;
    if (node.nodeType === 1 && node.classList?.contains('icon')) {
      return node.cloneNode(true);
    }
    const text = node.textContent || '';
    const match = text.match(ICON_TOKEN);
    if (match) {
      const span = document.createElement('span');
      span.className = `icon icon-${match[1]}`;
      const img = document.createElement('img');
      img.src = `${window.hlx.codeBasePath}/icons/${match[1]}.svg`;
      img.alt = '';
      img.loading = 'lazy';
      span.append(img);
      return span;
    }
    if (text.trim()) break;
  }
  return null;
}

function decorateNavItem(navSection) {
  const submenu = navSection.querySelector(':scope > ul');
  if (!submenu) return;

  navSection.classList.add('nav-drop');
  const categoryItems = [...submenu.children];
  const isMega = categoryItems.some((li) => li.querySelector(':scope > ul'));

  // label = the item's own text (before the nested list)
  const label = getItemLabel(navSection);
  if (label.toLowerCase() === CURRENT_SECTION.toLowerCase()) {
    navSection.classList.add('nav-active');
  }

  if (!isMega) {
    navSection.classList.add('nav-simple');
    return;
  }

  navSection.classList.add('nav-mega');
  submenu.classList.add('nav-mega-panel');

  // left column: category triggers; right column: the selected category's links
  const cats = document.createElement('div');
  cats.className = 'nav-mega-categories';
  const linksPanel = document.createElement('div');
  linksPanel.className = 'nav-mega-links';

  categoryItems.forEach((catLi, index) => {
    const catLabel = getItemLabel(catLi);
    const catIcon = getItemIcon(catLi);
    const catLinks = catLi.querySelector(':scope > ul');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-mega-category';
    if (catIcon) btn.append(catIcon);
    btn.append(document.createTextNode(catLabel));
    btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');

    const group = document.createElement('div');
    group.className = 'nav-mega-group';
    group.hidden = index !== 0;
    if (catLinks) group.append(catLinks.cloneNode(true));

    const activate = () => {
      cats.querySelectorAll('.nav-mega-category').forEach((b) => b.setAttribute('aria-selected', 'false'));
      linksPanel.querySelectorAll('.nav-mega-group').forEach((g) => { g.hidden = true; });
      btn.setAttribute('aria-selected', 'true');
      group.hidden = false;
    };
    btn.addEventListener('mouseenter', activate);
    btn.addEventListener('focus', activate);
    btn.addEventListener('click', activate);

    cats.append(btn);
    linksPanel.append(group);
  });

  submenu.replaceChildren(cats, linksPanel);
}

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
