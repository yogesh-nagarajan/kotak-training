import { getMetadata } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const LINK_COLLAPSE_LIMIT = 8;

function textOf(el) {
  return el ? el.textContent.trim() : '';
}

function firstPicture(el) {
  if (!el) return null;
  return el.querySelector('picture, img');
}

/** Normalize the variant onto the block; default to footer-hero. */
function resolveVariant(block) {
  if (block.classList.contains('footer-simple')) return 'footer-simple';
  block.classList.add('footer-hero');
  return 'footer-hero';
}

/**
 * A config row carries the brand band: it has a logo picture and/or the
 * headline text, but no link list. Columns and badges always contain anchors
 * or images-with-links, so this only matches the leading brand row.
 */
function isConfigRow(row) {
  const cells = [...row.children];
  const hasLogo = firstPicture(cells[0]);
  const hasLinks = row.querySelectorAll('a').length > 0;
  return Boolean(hasLogo) && !hasLinks;
}

/** A badge row: an image plus a label/link, optionally with a group title. */
function isBadgeRow(row) {
  return Boolean(firstPicture(row)) && row.querySelectorAll('a').length <= 2;
}

/** Build the red brand band (logo + headline + subheadline). */
function buildBrand(row) {
  const cells = [...row.children];
  const logoPic = firstPicture(cells[0]);
  const logoAlt = textOf(cells[1]);
  const headline = textOf(cells[2]);
  const subheadline = textOf(cells[3]);

  const band = document.createElement('div');
  band.className = 'footer-band';
  moveInstrumentation(row, band);

  if (logoPic) {
    const brand = document.createElement('div');
    brand.className = 'footer-brand';
    const img = logoPic.tagName === 'IMG' ? logoPic : logoPic.querySelector('img');
    if (img) img.alt = logoAlt || img.alt || 'Kotak Mahindra Bank';
    brand.append(logoPic);
    band.append(brand);
  }
  if (headline) {
    const h = document.createElement('h2');
    h.className = 'footer-headline';
    h.textContent = headline;
    band.append(h);
  }
  if (subheadline) {
    const p = document.createElement('p');
    p.className = 'footer-subheadline';
    p.textContent = subheadline;
    band.append(p);
  }
  return band.children.length ? band : null;
}

/** Collapse long link lists behind a See more / See less toggle. */
function addSeeMore(list, items) {
  if (items.length <= LINK_COLLAPSE_LIMIT) return null;
  items.forEach((li, i) => { if (i >= LINK_COLLAPSE_LIMIT) li.hidden = true; });
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'footer-see-more';
  button.setAttribute('aria-expanded', 'false');
  button.textContent = 'See more';
  button.addEventListener('click', () => {
    const next = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(next));
    button.textContent = next ? 'See less' : 'See more';
    items.forEach((li, i) => { li.hidden = !next && i >= LINK_COLLAPSE_LIMIT; });
  });
  return button;
}

/** Build one link column: a title heading + a list of links. */
function buildColumn(row) {
  const cells = [...row.children];
  if (!cells.length) return null;

  const column = document.createElement('div');
  column.className = 'footer-column';
  moveInstrumentation(row, column);

  const titleText = textOf(cells[0]);
  if (titleText) {
    const heading = document.createElement('h2');
    heading.className = 'footer-column-title';
    heading.textContent = titleText;
    column.append(heading);
  }

  const list = document.createElement('ul');
  list.className = 'footer-column-links';
  const items = [];
  row.querySelectorAll('a').forEach((anchor) => {
    const label = textOf(anchor);
    if (!label) return;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = anchor.getAttribute('href') || '#';
    a.textContent = label;
    li.append(a);
    list.append(li);
    items.push(li);
  });

  if (!items.length) return titleText ? column : null;
  column.append(list);
  const seeMore = addSeeMore(list, items);
  if (seeMore) column.append(seeMore);
  return column;
}

/** Build one badge group (app links, DICGC trust badge, etc). */
function buildBadge(row) {
  const badge = document.createElement('div');
  badge.className = 'footer-badge';
  moveInstrumentation(row, badge);

  const cells = [...row.children];
  const groupTitle = textOf(cells[0]) && !firstPicture(cells[0]) ? textOf(cells[0]) : '';
  if (groupTitle) {
    const t = document.createElement('p');
    t.className = 'footer-badge-title';
    t.textContent = groupTitle;
    badge.append(t);
  }

  const items = document.createElement('div');
  items.className = 'footer-badge-items';
  const pic = firstPicture(row);
  const anchor = row.querySelector('a');
  const wrapper = anchor ? document.createElement('a') : document.createElement('div');
  wrapper.className = 'footer-badge-item';
  if (anchor) {
    wrapper.href = anchor.getAttribute('href') || '#';
    wrapper.setAttribute('rel', 'noopener');
  }
  if (pic) wrapper.append(pic);
  const label = [...row.querySelectorAll('*')]
    .map((n) => (n.children.length ? '' : textOf(n)))
    .find((t) => t && t !== groupTitle);
  if (label) {
    const span = document.createElement('span');
    span.textContent = label;
    wrapper.append(span);
  }
  items.append(wrapper);
  badge.append(items);
  return badge;
}

/** Build the bottom copyright bar. */
function buildCopyright(row) {
  if (!row || !textOf(row)) return null;
  const bar = document.createElement('div');
  bar.className = 'footer-copyright';
  while (row.firstChild) bar.append(row.firstChild);
  return bar;
}

function transformFooter(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  resolveVariant(block);

  const band = [];
  const columns = [];
  const badges = [];
  const copyrightRows = [];

  rows.forEach((row) => {
    if (isConfigRow(row)) {
      band.push(row);
    } else if (isBadgeRow(row)) {
      badges.push(row);
    } else if (row.querySelector('a')) {
      columns.push(row);
    } else {
      copyrightRows.push(row);
    }
  });

  const out = document.createDocumentFragment();

  // brand band (footer-hero only; footer-simple hides it via CSS if present)
  band.forEach((row) => {
    const el = buildBrand(row);
    if (el) out.append(el);
  });

  // link columns
  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  const cols = document.createElement('div');
  cols.className = 'footer-columns';
  columns.forEach((row) => {
    const col = buildColumn(row);
    if (col) cols.append(col);
  });
  if (cols.children.length) inner.append(cols);

  // badge groups (app links, DICGC)
  if (badges.length) {
    const badgeRow = document.createElement('div');
    badgeRow.className = 'footer-badges';
    badges.forEach((row) => badgeRow.append(buildBadge(row)));
    inner.append(badgeRow);
  }
  if (inner.children.length) out.append(inner);

  // copyright bar
  copyrightRows.forEach((row) => {
    const bar = buildCopyright(row);
    if (bar) out.append(bar);
  });

  block.replaceChildren(out);
}

async function loadAuthoredFooter(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const candidates = [
    `/content${footerPath}.plain.html`,
    `${footerPath}.plain.html`,
    `/drafts${footerPath}.plain.html`,
  ];
  // try each candidate in order, stopping at the first that resolves
  const resp = await candidates.reduce(
    (acc, url) => acc.then((prev) => (prev && prev.ok ? prev : fetch(url))),
    Promise.resolve(null),
  );
  if (!resp || !resp.ok) return false;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
  wrapper.querySelectorAll('img[src^="images/"]').forEach((img) => {
    img.src = new URL(`/content/${img.getAttribute('src')}`, window.location).href;
  });

  const authored = wrapper.querySelector('.footer') || wrapper;
  [...authored.classList].forEach((cls) => {
    if (cls !== 'footer' && cls !== 'block') block.classList.add(cls);
  });
  block.replaceChildren(...authored.children);
  return block.children.length > 0;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const hasContent = [...block.children].some(
    (row) => textOf(row) || row.querySelector('img, a, picture'),
  );
  if (!hasContent) {
    const loaded = await loadAuthoredFooter(block);
    if (!loaded) return;
  }
  transformFooter(block);
}
