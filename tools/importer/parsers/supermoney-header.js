/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the supermoney-header block.
 *
 * Runs on the live site header (#header-nav) and emits the authored block:
 *   Row 1: logo (link + image)
 *   Row 2: navigation links (ul)
 *   Row 3: CTA link ("Apply Now")
 */
// Top-level nav with their megamenu sub-links (from the live header). Labels
// keyed lowercase; each entry has the top link href + optional submenu items.
const NAV = [
  {
    label: 'Savings',
    href: '/savings-account',
    subs: [
      { text: '811 Zero Balance Digital Savings Account', href: '/savings-account/811-zero-balance-digital-savings-account' },
      { text: '811 Super Savings Account', href: '/savings-account/811-super-savings-account' },
    ],
  },
  { label: 'Current Account', href: '/current-account/811-business', subs: [] },
  {
    label: 'Debit Card',
    href: '/debit-cards',
    subs: [
      { text: 'Infinity Metal Debit Card', href: '/debit-cards/infinity-metal-debit-card' },
      { text: 'PVR INOX Debit Card', href: '/debit-cards/pvr-inox-debit-card' },
    ],
  },
  {
    label: 'Credit Card',
    href: '/credit-cards',
    subs: [
      { text: 'Credit Card Against FD', href: '/credit-cards/811-dream-different-credit-card-against-fd' },
      { text: 'Kotak811 super.money Credit Card', href: '/credit-cards/811-super-money-credit-card' },
    ],
  },
  { label: 'Personal Loan', href: '/loans/personal-loan', subs: [] },
  { label: 'Insights', href: '/insights', subs: [] },
];

// Kotak811 brand wordmark (stable asset used across the site header/loader).
const LOGO_SRC = 'https://www.kotak811.bank.in/images/loader-logo.svg';

export default function parse(element, { document }) {
  // CTA — the Apply Now app-link button.
  const cta = element.querySelector('a[href*="app.link"]');

  const cells = [];

  // Row 1: logo — clean anchor + Kotak811 wordmark.
  const logoA = document.createElement('a');
  logoA.href = 'https://www.kotak811.bank.in/';
  const logoImg = document.createElement('img');
  logoImg.src = LOGO_SRC;
  logoImg.alt = 'Kotak811';
  logoA.append(logoImg);
  cells.push([[logoA]]);

  // Row 2: navigation with megamenus. Each top-level <li> gets a link; items
  // with subs also get a nested <ul> the block/CSS renders as a dropdown.
  const navList = document.createElement('ul');
  NAV.forEach((item) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.label;
    li.append(a);
    if (item.subs && item.subs.length) {
      const sub = document.createElement('ul');
      item.subs.forEach((s) => {
        const subLi = document.createElement('li');
        const subA = document.createElement('a');
        subA.href = s.href;
        subA.textContent = s.text;
        subLi.append(subA);
        sub.append(subLi);
      });
      li.append(sub);
    }
    navList.append(li);
  });
  cells.push([navList]);

  // Row 3: CTA
  const ctaCell = [];
  if (cta) {
    const newCta = document.createElement('a');
    newCta.href = cta.getAttribute('href') || '#';
    newCta.textContent = 'Apply Now';
    ctaCell.push(newCta);
  }
  cells.push([ctaCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'supermoney-header', cells });
  element.replaceWith(block);
}
