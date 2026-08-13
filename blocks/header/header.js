import { getMetadata } from '../../scripts/aem.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

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
  if (navBrand) {
    const brandLink = navBrand.querySelector('a');
    if (brandLink) brandLink.className = '';
  }

  // Sections: build megamenus and wire hover/click behavior
  const navSections = nav.querySelector('.nav-sections');
  let activateMobile = () => {};
  if (navSections) {
    navSections.querySelectorAll(':scope > ul > li').forEach((navItem) => {
      if (navItem.querySelector(':scope > div')) decorateMegamenu(navItem);
      const drop = navItem.classList.contains('nav-drop');

      // desktop: open on hover
      navItem.addEventListener('mouseenter', () => {
        if (isDesktop.matches && drop) {
          closeAllSections(navSections);
          navItem.setAttribute('aria-expanded', 'true');
        }
      });
      navItem.addEventListener('mouseleave', () => {
        if (isDesktop.matches && drop) navItem.setAttribute('aria-expanded', 'false');
      });

      // click: desktop toggles; mobile activates the pill
      const topLink = navItem.querySelector(':scope > a');
      if (topLink) {
        topLink.addEventListener('click', (e) => {
          if (!isDesktop.matches && drop) {
            e.preventDefault();
            activateMobile(navItem);
          } else if (isDesktop.matches && drop) {
            e.preventDefault();
            const expanded = navItem.getAttribute('aria-expanded') === 'true';
            closeAllSections(navSections);
            navItem.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          }
        });
      }
    });
    activateMobile = setupMobilePills(navSections);
  }

  // Tools: search icon + Login pill
  const navTools = nav.querySelector('.nav-tools');
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
