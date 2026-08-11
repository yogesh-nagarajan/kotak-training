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
// Known top-level nav labels on the live header, used to pick the right list
// and drop hidden megamenu / submenu markup.
const TOP_NAV = ['savings', 'current account', 'debit card', 'credit card', 'personal loan', 'insights'];

function cleanLabel(text) {
  return (text || '')
    .replace(/\s*-\s*(true|false)\s*$/i, '') // strip "Savings - false" artifacts
    .replace(/\s+/g, ' ')
    .trim();
}

export default function parse(element, { document }) {
  // Logo: the header's brand link (its aria-label / alt says "logo"), falling
  // back to the first anchor that wraps an image.
  const logoLink = element.querySelector('a[href$="kotak811.bank.in/"], a[aria-label*="logo" i]')
    || (element.querySelector('a img') ? element.querySelector('a img').closest('a') : null);
  const logoImg = element.querySelector('img');

  // CTA — the Apply Now app-link button.
  const cta = element.querySelector('a[href*="app.link"]');

  const cells = [];

  // Row 1: logo (clean anchor + image, no stray text)
  const logoCell = [];
  const logoA = document.createElement('a');
  logoA.href = (logoLink && logoLink.getAttribute('href')) || 'https://www.kotak811.bank.in/';
  if (logoImg) {
    logoA.append(logoImg);
  } else {
    logoA.textContent = 'Kotak811';
  }
  logoCell.push(logoA);
  cells.push([logoCell]);

  // Row 2: navigation — rebuild from the top-level nav labels only.
  const cleanList = document.createElement('ul');
  const seen = new Set();
  element.querySelectorAll('a[href]').forEach((a) => {
    const label = cleanLabel(a.textContent);
    const key = label.toLowerCase();
    if (TOP_NAV.includes(key) && !seen.has(key)) {
      seen.add(key);
      const li = document.createElement('li');
      const na = document.createElement('a');
      na.href = a.getAttribute('href') || '#';
      na.textContent = label;
      li.append(na);
      cleanList.append(li);
    }
  });
  cells.push([cleanList]);

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
