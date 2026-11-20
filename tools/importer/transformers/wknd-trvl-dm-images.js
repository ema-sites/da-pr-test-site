/* eslint-disable */
/* global WebImporter */

/**
 * Dynamic Media / Scene7 image transformer (afterTransform only).
 *
 * Rewrites DM <img> elements into anchors that survive markdown so the
 * scripts.js DM auto-block (v2) can rebuild them as <picture> at render time.
 *
 * Project type: da (.migration/project.json)
 *   - Unlinked: <a href="DM-URL" title="alt">DM-URL</a> (DA link-image)
 *   - Linked:   keep navigation href, title = DM-URL, text = alt or sentinel
 *   - Mixed-content anchors are skipped with a warning.
 */

const PROJECT_TYPE = 'da';
const EMPTY_ALT_SENTINEL = 'Image without alt text';

function detectDynamicMediaUrl(urlStr) {
  if (typeof urlStr !== 'string') return false;
  if (!/^(https?:\/\/|\/\/)/i.test(urlStr)) return false;
  let u;
  try { u = new URL(urlStr, 'https://x/'); } catch (e) { return false; }
  if (u.pathname.startsWith('/is/image/')) return 'scene7';
  if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname)
      && u.pathname.startsWith('/adobe/assets/urn:')) {
    return 'dm-openapi';
  }
  return false;
}

function isDynamicMediaImageUrl(urlStr) {
  const family = detectDynamicMediaUrl(urlStr);
  if (family !== 'dm-openapi') return family === 'scene7';
  const { pathname } = new URL(urlStr, 'https://x/');
  return /^\/adobe\/assets\/urn:[^/]+\/(original\/)?as\/[^/]+$/.test(pathname)
    && !/\.(mp4|m4v|mov|webm|m3u8|mpd)$/i.test(pathname);
}

function getImgSrc(img) {
  return img.getAttribute('src') || img.getAttribute('data-src') || '';
}

// The node that represents the image in the DOM (<picture> wrapper or <img>).
function imageNode(img) {
  const parent = img.parentElement;
  if (parent && parent.tagName === 'PICTURE') return parent;
  return img;
}

// True when the anchor contains only this image (no other text / images).
function isSoleImageOfAnchor(anchor, img) {
  if (anchor.querySelectorAll('img').length !== 1) return false;
  return anchor.textContent.trim() === '';
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;

  const document = element.ownerDocument;

  [...element.querySelectorAll('img')].forEach((img) => {
    const dmUrl = getImgSrc(img);
    if (!isDynamicMediaImageUrl(dmUrl)) return;

    const alt = (img.getAttribute('alt') || '').trim();
    const node = imageNode(img);
    const link = img.closest('a');

    if (link) {
      if (!isSoleImageOfAnchor(link, img)) {
        // eslint-disable-next-line no-console
        console.warn(`[dm-images] Skipping DM image inside mixed-content link: ${dmUrl}`);
        return;
      }
      link.setAttribute('title', dmUrl);
      link.textContent = alt || EMPTY_ALT_SENTINEL;
      return;
    }

    const a = document.createElement('a');
    a.setAttribute('href', dmUrl);
    if (PROJECT_TYPE === 'xwalk') {
      a.textContent = alt || EMPTY_ALT_SENTINEL;
    } else {
      if (alt) a.setAttribute('title', alt);
      a.textContent = dmUrl;
    }
    node.replaceWith(a);
  });
}
