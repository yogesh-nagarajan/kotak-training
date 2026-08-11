/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the supermoney-footer block.
 *
 * Runs on the live site footer (footer.footer) and emits the authored block:
 *   Row 1: brand (logo + social links)
 *   Row 2: link columns  -> one cell per column (h3 + link list)
 *   Row 3: legal bar (copyright + legal links)
 */
export default function parse(element, { document }) {
  const cells = [];

  // --- Row 1: brand (logo + breadcrumb + social + contact) ---
  const brandCell = [];
  const logo = element.querySelector('img');
  if (logo) {
    const p = document.createElement('p');
    p.append(logo);
    brandCell.push(p);
  }

  // Breadcrumb: Home > Credit cards > 811 super money credit card. Lazy-loaded
  // on the live footer, so synthesize from the known path when absent.
  const bcNav = element.querySelector('nav[class*="breadcrumb"], [class*="breadcrumb"]');
  const breadcrumb = document.createElement('p');
  breadcrumb.className = 'supermoney-footer-breadcrumb';
  if (bcNav && bcNav.querySelector('a')) {
    bcNav.querySelectorAll('a').forEach((a, i) => {
      if (i > 0) breadcrumb.append(document.createTextNode(' › '));
      const na = document.createElement('a');
      na.href = a.getAttribute('href') || '#';
      na.textContent = (a.textContent || '').trim();
      breadcrumb.append(na);
    });
  } else {
    const crumbs = [
      { text: 'Home', href: '/' },
      { text: 'Credit cards', href: '/credit-cards' },
      { text: '811 super money credit card', href: '/credit-cards/811-super-money-credit-card' },
    ];
    crumbs.forEach((c, i) => {
      if (i > 0) breadcrumb.append(document.createTextNode(' › '));
      const a = document.createElement('a');
      a.href = c.href;
      a.textContent = c.text;
      breadcrumb.append(a);
    });
  }
  brandCell.push(breadcrumb);
  // Social links = the "Follow us" list (first small list of external social links).
  // The live footer lazy-loads this region, so it is often absent from the
  // scraped DOM. Fall back to the known Kotak811 social handles when missing.
  const SOCIAL_FALLBACK = [
    { net: 'facebook', href: 'https://www.facebook.com/Kotak811DigitalBank/' },
    { net: 'instagram', href: 'https://www.instagram.com/kotak811/' },
    { net: 'twitter', href: 'https://twitter.com/kotak811' },
    { net: 'youtube', href: 'https://www.youtube.com/@kotak811' },
  ];
  const socialList = [...element.querySelectorAll('ul')].find((ul) => ul.querySelector('a[href*="facebook"], a[href*="instagram"], a[href*="twitter"], a[href*="youtube"]'));
  const clean = document.createElement('ul');
  if (socialList) {
    socialList.querySelectorAll(':scope > li a').forEach((a) => {
      const href = a.getAttribute('href') || '#';
      const li = document.createElement('li');
      const na = document.createElement('a');
      na.href = href;
      na.textContent = href.replace(/https?:\/\/(www\.)?/, '').split('.')[0] || 'link';
      li.append(na);
      clean.append(li);
    });
  } else {
    SOCIAL_FALLBACK.forEach(({ net, href }) => {
      const li = document.createElement('li');
      const na = document.createElement('a');
      na.href = href;
      na.textContent = net;
      li.append(na);
      clean.append(li);
    });
  }
  brandCell.push(clean);

  // Contact block: "Need help?" + Call us. Also lazy-loaded, so synthesize it
  // when a tel: link isn't present in the scraped footer.
  const telLink = element.querySelector('a[href^="tel:"]');
  const contact = document.createElement('p');
  contact.className = 'supermoney-footer-help';
  if (telLink) {
    const label = document.createElement('span');
    label.textContent = 'Need help? Connect with us through the below channels';
    const call = document.createElement('a');
    call.href = telLink.getAttribute('href');
    call.textContent = (telLink.textContent || '').trim() || 'Call us on: 1800 4100';
    contact.append(label, document.createElement('br'), call);
  } else {
    const label = document.createElement('span');
    label.textContent = 'Need help? Connect with us through the below channels';
    const call = document.createElement('a');
    call.href = 'tel:1800 4100';
    call.textContent = 'Call us on: 1800 4100';
    contact.append(label, document.createElement('br'), call);
  }
  brandCell.push(contact);

  cells.push([brandCell]);

  // --- Row 2: link columns (each h3 + following list becomes one cell) ---
  const columnCells = [];
  element.querySelectorAll('h3').forEach((h3) => {
    const heading = (h3.textContent || '').trim();
    // Skip non-column headings (e.g. brand headings without a following list).
    let list = h3.nextElementSibling;
    while (list && list.tagName !== 'UL') list = list.nextElementSibling;
    if (!list) return;
    const cell = [];
    const newH3 = document.createElement('h3');
    newH3.textContent = heading;
    cell.push(newH3);
    const clean = document.createElement('ul');
    list.querySelectorAll(':scope > li a').forEach((a) => {
      const li = document.createElement('li');
      const na = document.createElement('a');
      na.href = a.getAttribute('href') || '#';
      na.textContent = (a.textContent || '').trim();
      li.append(na);
      clean.append(li);
    });
    if (clean.children.length) {
      cell.push(clean);
      columnCells.push(cell);
    }
  });
  if (columnCells.length) cells.push(columnCells);

  // --- Row 3: legal bar (bottom list with copyright + legal links) ---
  const legalList = [...element.querySelectorAll('ul')].reverse()
    .find((ul) => ul.querySelector('a[href*="privacy"], a[href*="terms"], a[href*="disclaimer"]'));
  if (legalList) {
    const clean = document.createElement('ul');
    legalList.querySelectorAll(':scope > li').forEach((li) => {
      const a = li.querySelector('a');
      const newLi = document.createElement('li');
      if (a) {
        const na = document.createElement('a');
        na.href = a.getAttribute('href') || '#';
        na.textContent = (li.textContent || '').trim();
        newLi.append(na);
      } else {
        newLi.textContent = (li.textContent || '').trim();
      }
      clean.append(newLi);
    });
    cells.push([[clean]]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'supermoney-footer', cells });
  // Footer lives outside main; append the generated block into the body so it
  // survives the cleanup transformer (which only strips inside main sections).
  element.replaceWith(block);
}
