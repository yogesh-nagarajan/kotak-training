/**
 * supermoney-header block.
 *
 * Expected authored structure (one column table):
 *   Row 1: logo (image + link)                     -> brand logo
 *   Row 2: navigation (a list; a nested list under a link becomes a megamenu)
 *   Row 3: call-to-action link ("Apply now")         -> highlighted button
 *
 * Nav items with a nested <ul> render as hover/focus megamenus. Every nav
 * label is a real hyperlink (matching the live site).
 *
 * @param {Element} block The supermoney-header block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const [logoRow, navRow, ctaRow] = rows;

  const nav = document.createElement('nav');
  nav.className = 'supermoney-header-nav';
  nav.setAttribute('aria-label', 'Main navigation');

  // --- Logo ---
  if (logoRow) {
    const logo = document.createElement('div');
    logo.className = 'supermoney-header-logo';
    [...logoRow.children].forEach((cell) => {
      while (cell.firstElementChild) logo.append(cell.firstElementChild);
    });
    nav.append(logo);
  }

  // --- Nav links (with optional megamenus) ---
  if (navRow) {
    const links = document.createElement('div');
    links.className = 'supermoney-header-links';
    const list = navRow.querySelector('ul');
    if (list) {
      list.querySelectorAll(':scope > li').forEach((li) => {
        // A submenu is a nested <ul> inside this top-level <li>.
        const submenu = li.querySelector(':scope > ul');
        if (submenu) {
          li.classList.add('has-megamenu');
          const topLink = li.querySelector(':scope > a');
          if (topLink) {
            topLink.setAttribute('aria-haspopup', 'true');
            topLink.setAttribute('aria-expanded', 'false');
          }
          submenu.classList.add('supermoney-header-megamenu');
          // keyboard: toggle on focus within
          li.addEventListener('focusin', () => topLink && topLink.setAttribute('aria-expanded', 'true'));
          li.addEventListener('focusout', (e) => {
            if (!li.contains(e.relatedTarget) && topLink) topLink.setAttribute('aria-expanded', 'false');
          });
        }
      });
      links.append(list);
    } else {
      [...navRow.children].forEach((cell) => {
        while (cell.firstElementChild) links.append(cell.firstElementChild);
      });
    }
    nav.append(links);
  }

  // --- CTA ---
  if (ctaRow) {
    const cta = ctaRow.querySelector('a');
    if (cta) {
      cta.classList.add('button', 'supermoney-header-cta');
      nav.append(cta);
    }
  }

  // --- Mobile hamburger ---
  const toggle = document.createElement('button');
  toggle.className = 'supermoney-header-toggle';
  toggle.setAttribute('aria-label', 'Open navigation');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<span></span><span></span><span></span>';
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  nav.append(toggle);

  block.replaceChildren(nav);
}
