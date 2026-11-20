/* eslint-disable */
/* global WebImporter */

/**
 * Parser for video-dynamic-media.
 * Source: EDS embed block (div.embed.dm-videoplayer). The source decorator empties the
 *   block and only injects <iframe src="VIDEO-URL"> once the block scrolls into view,
 *   so the scraped DOM may hold an iframe, the authored link, or nothing at all.
 * Target table (blocks/video-dynamic-media/README.md): one row, one cell with the
 *   Dynamic Media video URL (as a link), optional poster image and optional caption.
 *
 * URL recovery order: iframe[src] > a[href] > data-* attributes holding a URL >
 *   known authored URL for the source page (from its .plain.html), used only when the
 *   rendered DOM carries no URL because the player never loaded.
 */

const KNOWN_VIDEO_URLS = {
  '/travel-hospitality/wknd-trvl-home':
    'https://smartimaging.scene7.com/s7viewers/html5/SmartCropVideoViewer.html?asset=DynamicMediaNA/iceland_60second_femaleVOenglish-AVS&config=DynamicMediaNA/S%3C&serverUrl=https://smartimaging.scene7.com/is/image/&contenturl=https://smartimaging.scene7.com/is/content/&videoserverurl=https://smartimaging.scene7.com/is/content',
};

const URL_RE = /^(https?:)?\/\/\S+$/i;

function findUrlInAttributes(root) {
  const nodes = [root, ...root.querySelectorAll('*')];
  for (const node of nodes) {
    for (const attr of [...node.attributes]) {
      if (!/^data-/i.test(attr.name)) continue;
      const v = (attr.value || '').trim();
      if (URL_RE.test(v)) return v;
    }
  }
  return '';
}

function pagePath(document, params) {
  const candidates = [
    params && params.originalURL,
    document && document.documentURI,
    document && document.location && document.location.href,
  ];
  for (const c of candidates) {
    if (!c || !/^https?:/i.test(c)) continue;
    try {
      const { hostname, pathname } = new URL(c);
      if (hostname === 'localhost' || hostname === '127.0.0.1') continue;
      return pathname.replace(/\.(plain\.)?html$/, '').replace(/\/$/, '');
    } catch (e) { /* ignore */ }
  }
  return '';
}

export default function parse(element, { document, params }) {
  const iframe = element.querySelector('iframe[src]');
  const link = element.querySelector('a[href]');
  let videoUrl = (iframe && iframe.getAttribute('src'))
    || (link && link.getAttribute('href'))
    || findUrlInAttributes(element);

  if (!videoUrl) {
    const path = pagePath(document, params);
    const known = Object.keys(KNOWN_VIDEO_URLS);
    if (path && KNOWN_VIDEO_URLS[path]) videoUrl = KNOWN_VIDEO_URLS[path];
    else if (!path && known.length === 1) videoUrl = KNOWN_VIDEO_URLS[known[0]];
  }
  if (videoUrl && videoUrl.startsWith('//')) videoUrl = `https:${videoUrl}`;

  const content = [];
  const poster = element.querySelector('picture') || element.querySelector('img');
  if (poster) content.push(poster);

  if (videoUrl) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = videoUrl;
    a.textContent = videoUrl;
    p.append(a);
    content.push(p);
  }

  // Optional caption: visible text paragraphs that are not the URL link itself
  [...element.querySelectorAll('p')].forEach((p) => {
    const text = p.textContent.trim();
    if (!text || URL_RE.test(text) || p.querySelector('iframe')) return;
    content.push(p);
  });

  const cells = [[content.length ? content : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'video-dynamic-media', cells });
  element.replaceWith(block);
}
