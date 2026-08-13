import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

// the top-level nav section that represents the current page context
const CURRENT_SECTION = 'NRI';

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
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
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand?.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) {
        decorateNavItem(navSection);
      }
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
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

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
