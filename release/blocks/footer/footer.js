import { getMetadata } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const LINK_COLLAPSE_LIMIT = 6;
const MAX_ROWS_CAP = 4;

function textOf(el) {
  return el ? el.textContent.trim() : '';
}

function firstPicture(el) {
  if (!el) return null;
  return el.querySelector('picture') || el.querySelector('img');
}

function isVariantValue(value) {
  const v = value.toLowerCase();
  return v === 'variant1' || v === 'variant2' || v === 'full' || v === 'inner';
}

function normalizeVariant(value) {
  const v = (value || '').toLowerCase();
  if (v === 'variant2' || v === 'inner') return 'variant2';
  return 'variant1';
}

function parseMaxRows(value) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1) return MAX_ROWS_CAP;
  return Math.min(MAX_ROWS_CAP, n);
}

function moveChildren(from, to) {
  if (!from || !to) return;
  while (from.firstChild) to.append(from.firstChild);
}

/**
 * Collect authored text+link pairs from a column row.
 * Supports nested footer-link items, extra cells, and richtext lists of anchors.
 */
function extractLinks(row, startIndex) {
  const cells = [...row.children];
  const links = [];
  const seen = new Set();

  const pushAnchor = (anchor) => {
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';
    const label = textOf(anchor);
    const key = `${href}::${label}`;
    if (!label || seen.has(key)) return;
    seen.add(key);
    const item = { href, label, source: anchor.closest('div') || anchor };
    links.push(item);
  };

  cells.slice(startIndex).forEach((cell) => {
    const nestedRows = [...cell.children].filter((child) => child.tagName === 'DIV');
    if (nestedRows.length) {
      nestedRows.forEach((nested) => {
        const nestedCells = [...nested.children];
        const nestedAnchor = nested.querySelector('a');
        if (nestedAnchor) {
          pushAnchor(nestedAnchor);
          return;
        }
        const label = textOf(nestedCells[0] || nested);
        const href = textOf(nestedCells[1]) || nested.querySelector('a')?.getAttribute('href') || '#';
        if (!label) return;
        const fake = document.createElement('a');
        fake.href = href;
        fake.textContent = label;
        nested.append(fake);
        pushAnchor(fake);
      });
      return;
    }
    cell.querySelectorAll('a').forEach(pushAnchor);
    if (!cell.querySelector('a')) {
      const label = textOf(cell);
      if (label) {
        const fake = document.createElement('a');
        fake.href = '#';
        fake.textContent = label;
        cell.append(fake);
        pushAnchor(fake);
      }
    }
  });

  return links;
}

function createSeeMore(list, items) {
  if (items.length <= LINK_COLLAPSE_LIMIT) return null;
  items.forEach((li, index) => {
    if (index >= LINK_COLLAPSE_LIMIT) li.hidden = true;
  });

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'footer-see-more';
  button.setAttribute('aria-expanded', 'false');
  button.textContent = 'See more';

  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    const next = !expanded;
    button.setAttribute('aria-expanded', String(next));
    button.textContent = next ? 'See less' : 'See more';
    items.forEach((li, index) => {
      li.hidden = !next && index >= LINK_COLLAPSE_LIMIT;
    });
    list.classList.toggle('is-expanded', next);
  });

  return button;
}

function decorateColumn(row) {
  const cells = [...row.children];
  if (!cells.length) return null;

  const titleCell = cells[0];
  const maybeRows = textOf(cells[1]);
  const hasMaxRows = cells.length > 1 && /^[1-4]$/.test(maybeRows);
  const maxRows = hasMaxRows ? parseMaxRows(maybeRows) : MAX_ROWS_CAP;
  const linkStart = hasMaxRows ? 2 : 1;
  const links = extractLinks(row, linkStart);

  const column = document.createElement('div');
  column.className = 'footer-column';
  column.style.setProperty('--footer-max-rows', String(maxRows));
  moveInstrumentation(row, column);

  const titleText = textOf(titleCell);
  if (titleText) {
    const heading = document.createElement('h2');
    heading.className = 'footer-column-title';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'footer-column-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    const label = document.createElement('span');
    label.textContent = titleText;
    const icon = document.createElement('span');
    icon.className = 'footer-column-icon';
    icon.setAttribute('aria-hidden', 'true');
    toggle.append(label, icon);
    heading.append(toggle);
    column.append(heading);
    toggle.addEventListener('click', () => {
      const open = column.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  const list = document.createElement('ul');
  list.className = 'footer-column-links';
  const items = links.map(({ href, label, source }) => {
    const li = document.createElement('li');
    if (source) moveInstrumentation(source, li);
    const a = document.createElement('a');
    a.href = href || '#';
    a.textContent = label;
    li.append(a);
    list.append(li);
    return li;
  });

  const seeMore = createSeeMore(list, items);
  const panel = document.createElement('div');
  panel.className = 'footer-column-panel';
  panel.append(list);
  if (seeMore) panel.append(seeMore);
  column.append(panel);

  return column;
}

function applyBackground(section, picture) {
  if (!section || !picture) return;
  const img = picture.tagName === 'IMG' ? picture : picture.querySelector('img');
  const src = img?.getAttribute('src');
  if (src) {
    section.style.backgroundImage = `url("${src}")`;
    section.classList.add('has-background');
  }
}

function decorateConfig(row, block) {
  const cells = [...row.children];
  let offset = 0;
  if (isVariantValue(textOf(cells[0]))) {
    block.classList.add(normalizeVariant(textOf(cells[0])));
    offset = 1;
  } else if (!block.classList.contains('variant1') && !block.classList.contains('variant2')) {
    block.classList.add('variant1');
  }

  const logoCell = cells[offset];
  const logoAlt = textOf(cells[offset + 1]);
  const cinTitleCell = cells[offset + 2];
  const cinSubtitleCell = cells[offset + 3];
  const cinBgCell = cells[offset + 4];
  const legalCell = cells[offset + 5];
  const socialCell = cells[offset + 6];
  const parts = {};

  const logoPic = firstPicture(logoCell);
  if (logoPic) {
    const brand = document.createElement('div');
    brand.className = 'footer-brand';
    const img = logoPic.tagName === 'IMG' ? logoPic : logoPic.querySelector('img');
    if (img && logoAlt) img.alt = logoAlt;
    else if (img && !img.alt) img.alt = 'Kotak Mahindra Bank';
    brand.append(logoPic);
    parts.brand = brand;
  }

  const cinTitleText = textOf(cinTitleCell);
  const cinSubtitleText = textOf(cinSubtitleCell);
  const cinBg = firstPicture(cinBgCell);
  if (cinTitleText || cinSubtitleText || cinBg) {
    const cin = document.createElement('div');
    cin.className = 'footer-cin';
    applyBackground(cin, cinBg);
    const inner = document.createElement('div');
    inner.className = 'footer-cin-inner';
    if (cinTitleText) {
      const heading = document.createElement('h2');
      heading.className = 'footer-cin-title';
      heading.textContent = cinTitleText;
      inner.append(heading);
    }
    if (cinSubtitleText) {
      const sub = document.createElement('p');
      sub.className = 'footer-cin-subtitle';
      sub.textContent = cinSubtitleText;
      inner.append(sub);
    }
    cin.append(inner);
    parts.cin = cin;
  }

  const hasLegal = legalCell && (textOf(legalCell) || legalCell.querySelector('a, p'));
  const hasSocial = socialCell && (textOf(socialCell) || socialCell.querySelector('a, img'));
  if (hasLegal || hasSocial) {
    const legal = document.createElement('div');
    legal.className = 'footer-legal';
    const wrap = document.createElement('div');
    wrap.className = 'footer-legal-inner';
    if (hasLegal) {
      const text = document.createElement('div');
      text.className = 'footer-legal-text';
      moveChildren(legalCell, text);
      wrap.append(text);
    }
    if (hasSocial) {
      const social = document.createElement('div');
      social.className = 'footer-social';
      moveChildren(socialCell, social);
      wrap.append(social);
    }
    legal.append(wrap);
    parts.legal = legal;
  }

  return parts;
}

function isStandaloneLinkRow(row) {
  const cells = [...row.children];
  if (!cells.length) return false;
  if (/^[1-4]$/.test(textOf(cells[1]))) return false;
  if (textOf(cells[0]) && cells.length >= 3) return false;
  return Boolean(row.querySelector('a'))
    || (cells.length === 2 && /^(https?:\/\/|\/|#)/i.test(textOf(cells[1])));
}

function groupColumnRows(rows) {
  const grouped = [];
  rows.forEach((row) => {
    if (isStandaloneLinkRow(row) && grouped.length) {
      const host = grouped[grouped.length - 1];
      let bucket = host.lastElementChild;
      if (!bucket || /^[1-4]$/.test(textOf(bucket))) {
        bucket = document.createElement('div');
        host.append(bucket);
      }
      bucket.append(row);
      return;
    }
    grouped.push(row);
  });
  return grouped;
}

function isConfigRow(row, block) {
  if (block.classList.contains('variant1') || block.classList.contains('variant2')) return true;
  const first = textOf(row.children[0]);
  if (isVariantValue(first)) return true;
  if (firstPicture(row.children[0]) && row.querySelectorAll('a').length === 0) return true;
  return false;
}

function transformFooter(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  let configParts = {};
  let columnRows = rows;
  if (isConfigRow(rows[0], block)) {
    configParts = decorateConfig(rows[0], block);
    columnRows = rows.slice(1);
  }
  if (!block.classList.contains('variant1') && !block.classList.contains('variant2')) {
    block.classList.add('variant1');
  }

  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  const columns = document.createElement('div');
  columns.className = 'footer-columns';
  if (configParts.brand) inner.append(configParts.brand);
  groupColumnRows(columnRows).forEach((row) => {
    const column = decorateColumn(row);
    if (column) columns.append(column);
  });
  inner.append(columns);

  const fragment = document.createDocumentFragment();
  fragment.append(inner);
  if (configParts.cin) fragment.append(configParts.cin);
  if (configParts.legal) fragment.append(configParts.legal);
  block.replaceChildren(fragment);
}

async function loadAuthoredFooter(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const candidates = [
    `/content${footerPath}.plain.html`,
    `${footerPath}.plain.html`,
    `/drafts${footerPath}.plain.html`,
  ];
  let resp;
  for (const url of candidates) {
    resp = await fetch(url);
    if (resp.ok) break;
  }
  if (!resp.ok) return false;

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
 * @param {Element} block The block element
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
