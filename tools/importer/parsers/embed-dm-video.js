/* eslint-disable */
/* global WebImporter */

/**
 * embed-dm-video parser (.embed.dm-videoplayer).
 * In the decorated source DOM this block is empty: the source block JS clears
 * it and never renders an iframe. Lookup order for the Scene7 viewer URL:
 *   1. iframe[src] or a[href] inside the block
 *   2. synchronous same-origin request for the page's .plain.html, reading
 *      .embed.dm-videoplayer a[href] from the raw block table
 * Target table (1 column): [optional poster picture, viewer link].
 * If no URL is found, the block is removed instead of emitting an empty table.
 * The URL is kept verbatim (its query string configures the viewer).
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

function urlFromPlainHtml(document, params) {
  const candidates = plainHtmlCandidates(document, params);
  for (let i = 0; i < candidates.length; i += 1) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', candidates[i], false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
        const doc = new DOMParser().parseFromString(xhr.responseText, 'text/html');
        const a = doc.querySelector('.embed.dm-videoplayer a[href]');
        if (a) return a.getAttribute('href').trim();
      }
    } catch (e) {
      console.warn(`[embed-dm-video] could not load ${candidates[i]}: ${e.message}`);
    }
  }
  return '';
}

export default function parse(element, { document, params }) {
  let url = '';
  const iframe = element.querySelector('iframe[src]');
  const anchor = element.querySelector('a[href]');
  if (iframe) url = iframe.getAttribute('src').trim();
  else if (anchor) url = anchor.getAttribute('href').trim();
  if (!url) url = urlFromPlainHtml(document, params);

  if (!url) {
    console.warn('[embed-dm-video] no viewer URL found; block removed');
    element.remove();
    return;
  }

  const content = [];
  const poster = element.querySelector('picture img, img');
  if (poster && poster.getAttribute('src')) {
    const img = document.createElement('img');
    img.setAttribute('src', poster.getAttribute('src'));
    img.setAttribute('alt', poster.getAttribute('alt') || '');
    content.push(img);
  }
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.textContent = url;
  content.push(a);

  const cells = [[content]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-dm-video', cells });
  element.replaceWith(block);
}
