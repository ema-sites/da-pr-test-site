/* eslint-disable */
/* global WebImporter */

/**
 * Parser for embed-dm-video (source: EDS `div.embed.dm-videoplayer`).
 *
 * Target table (blocks/embed-dm-video/README.md): single cell = viewer URL as a link
 * (optional poster image above it). The URL (incl. its query string) is kept verbatim.
 *
 * URL discovery order inside the source block:
 *   1. a[href] with an absolute http(s) URL (undecorated / authored markup)
 *   2. iframe[src] (player rendered as an iframe)
 *   3. a bare http(s) URL in the block's text
 *
 * Fallback (documented decision): the captured, decorated DOM of
 * /travel-hospitality/wknd-trvl-home contains an EMPTY `embed dm-videoplayer`
 * block because the Scene7 player had not rendered. The authored source
 * (wknd-trvl-home.plain.html) holds the SmartCropVideoViewer.html URL below.
 * The fallback is applied ONLY when the page being imported is that page
 * (checked via params.originalURL, then og:url / canonical). On any other page an
 * empty block is removed with a console warning instead of emitting a broken embed.
 */

const PAGE_FALLBACKS = {
  '/travel-hospitality/wknd-trvl-home':
    'https://smartimaging.scene7.com/s7viewers/html5/SmartCropVideoViewer.html?asset=DynamicMediaNA/iceland_60second_femaleVOenglish-AVS&config=DynamicMediaNA/S%3C&serverUrl=https://smartimaging.scene7.com/is/image/&contenturl=https://smartimaging.scene7.com/is/content/&videoserverurl=https://smartimaging.scene7.com/is/content',
};

function findUrl(element) {
  const link = [...element.querySelectorAll('a[href]')]
    .find((a) => /^https?:\/\//i.test(a.getAttribute('href').trim()));
  if (link) return link.getAttribute('href').trim();
  const iframe = [...element.querySelectorAll('iframe[src]')]
    .find((f) => /^https?:\/\//i.test(f.getAttribute('src').trim()));
  if (iframe) return iframe.getAttribute('src').trim();
  const match = (element.textContent || '').match(/https?:\/\/\S+/i);
  return match ? match[0] : '';
}

function pagePath(document, params) {
  const candidates = [
    params && params.originalURL,
    document.querySelector('meta[property="og:url"]') && document.querySelector('meta[property="og:url"]').getAttribute('content'),
    document.querySelector('link[rel="canonical"]') && document.querySelector('link[rel="canonical"]').getAttribute('href'),
  ];
  for (const c of candidates) {
    if (!c) continue;
    try {
      return new URL(c, 'https://x/').pathname.replace(/\.(plain\.)?html$/, '').replace(/\/$/, '');
    } catch (e) {
      // try the next candidate
    }
  }
  return '';
}

export default function parse(element, { document, params }) {
  let url = findUrl(element);
  if (!url) {
    const path = pagePath(document, params);
    url = PAGE_FALLBACKS[path] || '';
    if (url) {
      console.warn(`[embed-dm-video] empty block on ${path}; using the viewer URL from the authored source page`);
    } else {
      console.warn(`[embed-dm-video] no viewer URL found in block (page: ${path || 'unknown'}); block skipped`);
      element.remove();
      return;
    }
  }

  const content = [];
  const poster = element.querySelector('img[src]');
  if (poster) {
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
