/**
 * supermoney-header block.
 *
 * Expected authored structure (one column table):
 *   Row 1: logo (image + link)                     -> brand logo
 *   Row 2: navigation links (a list of links)       -> primary nav
 *   Row 3: call-to-action link ("Apply now")         -> highlighted button
 *
 * Renders a sticky top bar: logo left, nav links center/right, CTA button.
 *
 * @param {Element} block The supermoney-header block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  const nav = document.createElement('nav');
  nav.className = 'supermoney-header-nav';
  nav.setAttribute('aria-label', 'Main navigation');

  // Row 1 = logo
  const [logoRow, navRow, ctaRow] = rows;

  if (logoRow) {
    const logo = document.createElement('div');
    logo.className = 'supermoney-header-logo';
    while (logoRow.firstElementChild) {
      const cell = logoRow.firstElementChild;
      while (cell.firstElementChild) logo.append(cell.firstElementChild);
      cell.remove();
    }
    nav.append(logo);
  }

  // Row 2 = nav links (a UL of links, or loose links)
  if (navRow) {
    const links = document.createElement('div');
    links.className = 'supermoney-header-links';
    const list = navRow.querySelector('ul');
    if (list) {
      links.append(list);
    } else {
      [...navRow.children].forEach((cell) => {
        while (cell.firstElementChild) links.append(cell.firstElementChild);
      });
    }
    nav.append(links);
  }

  // Row 3 = CTA
  if (ctaRow) {
    const cta = ctaRow.querySelector('a');
    if (cta) {
      cta.classList.add('button', 'supermoney-header-cta');
      nav.append(cta);
    }
  }

  // Hamburger toggle for mobile
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
