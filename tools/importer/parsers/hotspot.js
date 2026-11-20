/* eslint-disable */
/* global WebImporter */

/**
 * hotspot parser.
 * Source (decorated): .hotspot.block with
 *   - row 1: > div > div > picture img (background map)
 *   - one child div.hotspot per point, inline style left/top (e.g. "38.5%"),
 *     a "data" attribute holding the media URL and
 *     .hotspot-content iframe[src] (video /play URL or 3D viewer URL).
 * Target table (3 columns):
 *   row 1 = [background image]
 *   each following row = [media link, left %, top %]
 * Positions come from the inline styles; when missing they are read from the
 * page's .plain.html (same origin) block table, matched by point index.
 * All URLs are kept verbatim.
 */

function plainHtmlCandidates(document, params) {
  const urls = [];
  const add = (base) => {
    try {
      const u = new URL(base);
      if (!/\.plain\.html$/.test(u.pathname)) {
        u.pathname = `${u.pathname.replace(/\/$/, '/index').replace(/\.html$/, '')}.plain.html`;
      }
      u.hash = '';
      if (!urls.includes(u.href)) urls.push(u.href);
    } catch (e) { /* ignore */ }
  };
  try { if (document.location && /^https?:/.test(document.location.href)) add(document.location.href); } catch (e) { /* ignore */ }
  if (params && params.originalURL) add(params.originalURL);
  return urls;
}

function fetchPlainBlock(document, params, selector) {
  const candidates = plainHtmlCandidates(document, params);
  for (let i = 0; i < candidates.length; i += 1) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', candidates[i], false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
        const doc = new DOMParser().parseFromString(xhr.responseText, 'text/html');
        const found = doc.querySelector(selector);
        if (found) return found;
      }
    } catch (e) {
      console.warn(`[hotspot] could not load ${candidates[i]}: ${e.message}`);
    }
  }
  return null;
}

// A Dynamic Media video delivery URL (`/adobe/assets/urn:…/play`). A link whose text is its own
// DM URL is turned into a DA link-image by the import, so these get the asset name as text.
function dmVideoLabel(href) {
  const m = href.match(/\/adobe\/assets\/urn:[^:/]+:[^:/]+:([^/?#]+)\/play(?:[?#]|$)/);
  return m ? `Video: ${decodeURIComponent(m[1])}` : null;
}

function link(document, href) {
  const a = document.createElement('a');
  a.setAttribute('href', href);
  a.textContent = dmVideoLabel(href) || href;
  return a;
}

export default function parse(element, { document, params }) {
  const cells = [];

  // Row 1: background image (first row of the block, not inside a .hotspot point).
  const bgImg = [...element.querySelectorAll(':scope > div:not(.hotspot) img')][0];
  let plainBlock = null;
  if (bgImg && bgImg.getAttribute('src')) {
    const img = document.createElement('img');
    img.setAttribute('src', bgImg.getAttribute('src'));
    img.setAttribute('alt', bgImg.getAttribute('alt') || '');
    cells.push([img]);
  } else {
    plainBlock = fetchPlainBlock(document, params, '.hotspot');
    const a = plainBlock && plainBlock.querySelector(':scope > div:first-child a[href]');
    if (a) cells.push([link(document, a.getAttribute('href'))]);
    else cells.push(['']);
  }

  const points = [...element.querySelectorAll(':scope > div.hotspot')];
  let plainRows = null;
  const getPlainRow = (idx) => {
    if (!plainRows) {
      if (!plainBlock) plainBlock = fetchPlainBlock(document, params, '.hotspot');
      plainRows = plainBlock ? [...plainBlock.querySelectorAll(':scope > div')].slice(1) : [];
    }
    return plainRows[idx];
  };

  points.forEach((point, idx) => {
    const frames = [...point.querySelectorAll('iframe[src]')].map((f) => f.getAttribute('src'));
    const media = frames.length ? frames : (point.getAttribute('data') ? [point.getAttribute('data').trim()] : []);
    let left = (point.style && point.style.left) || '';
    let top = (point.style && point.style.top) || '';
    if (!left || !top) {
      const styleAttr = point.getAttribute('style') || '';
      const l = styleAttr.match(/left:\s*([\d.]+%)/);
      const t = styleAttr.match(/top:\s*([\d.]+%)/);
      if (l) left = l[1];
      if (t) top = t[1];
    }
    if (!left || !top) {
      const row = getPlainRow(idx);
      if (row) {
        const cols = [...row.querySelectorAll(':scope > div')];
        if (!left && cols[1]) left = cols[1].textContent.trim();
        if (!top && cols[2]) top = cols[2].textContent.trim();
        if (!media.length && cols[0]) {
          cols[0].querySelectorAll('a[href]').forEach((a) => media.push(a.getAttribute('href')));
        }
      }
    }
    if (!media.length) return;

    let mediaCell;
    if (media.length === 1) {
      mediaCell = link(document, media[0]);
    } else {
      mediaCell = document.createElement('ul');
      media.forEach((href) => {
        const li = document.createElement('li');
        li.append(link(document, href));
        mediaCell.append(li);
      });
    }
    if (!left || !top) console.warn(`[hotspot] missing position for point ${idx + 1}`);
    cells.push([mediaCell, left, top]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'hotspot', cells });
  element.replaceWith(block);
}
