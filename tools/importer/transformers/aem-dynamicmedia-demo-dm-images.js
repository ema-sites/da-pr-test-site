/* eslint-disable */
/* global WebImporter */

/**
 * Dynamic Media / Scene7 image transformer for aem-dynamicmedia-demo (DA project).
 *
 * afterTransform only: parsers need real <img> nodes before this runs.
 * Rewrites every DM <img> (Scene7 `/is/image/` or DM Open API
 * `delivery-p*-e*.adobeaemcloud.com/adobe/assets/urn:.../as/...`) into an anchor
 * that survives markdown, keeping the FULL source URL (query strings carry the
 * visual effect: crop, colorize, flip, invertcolors, text/image layers, preset,
 * Scene7 `$image`/`$badge`/`$text*` template params). Nothing is downloaded.
 *
 *  - Unlinked (DA): <a href="DM-URL" title="alt">DM-URL</a>  (title omitted when alt is empty);
 *    the content import turns it into a DA link-image.
 *  - Linked (image is the sole meaningful content of a navigation link):
 *    keep href, set title=DM-URL, link text = alt or sentinel.
 *  - Mixed-content links around a DM image are skipped with a warning.
 *
 * DM videos (`.../urn:.../play`, .mp4 etc.) are not images and are left untouched.
 */

const EMPTY_ALT_SENTINEL = 'Image without alt text';

function isDmImageUrl(url) {
  if (typeof url !== 'string') return false;
  const s = url.trim();
  if (!/^(https?:)?\/\//i.test(s)) return false;
  let u;
  try { u = new URL(s, 'https://x/'); } catch (e) { return false; }
  if (u.pathname.startsWith('/is/image/')) return true;
  return /^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname)
    && /^\/adobe\/assets\/urn:[^/]+\/(original\/)?as\/[^/]+$/.test(u.pathname)
    && !/\.(mp4|m4v|mov|webm|m3u8|mpd)$/i.test(u.pathname);
}

function normaliseUrl(src) {
  const s = src.trim();
  return s.startsWith('//') ? `https:${s}` : s;
}

/** Node to replace: the wrapping <picture> when present, otherwise the <img>. */
function imageNode(img) {
  const picture = img.closest('picture');
  return picture && picture.querySelectorAll('img').length === 1 ? picture : img;
}

/** True when the link holds nothing but this image (no other text or elements). */
function isSoleContentOfLink(link, node) {
  const clone = link.cloneNode(true);
  const path = [];
  for (let n = node; n && n !== link; n = n.parentNode) {
    path.unshift([...n.parentNode.childNodes].indexOf(n));
  }
  let target = clone;
  path.forEach((idx) => { target = target.childNodes[idx]; });
  if (target) target.remove();
  return !clone.textContent.trim() && !clone.querySelector('img, picture, video, iframe, svg');
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;
  const document = element.ownerDocument;

  [...element.querySelectorAll('img')].forEach((img) => {
    const rawSrc = img.getAttribute('src') || '';
    if (!isDmImageUrl(rawSrc)) return;
    const dmUrl = normaliseUrl(rawSrc);
    const alt = (img.getAttribute('alt') || '').trim();
    const node = imageNode(img);
    if (!node.parentNode) return;

    const link = node.parentElement && node.parentElement.closest('a');
    if (link) {
      if (!isSoleContentOfLink(link, node)) {
        console.warn(`[dm-images] skipped DM image inside mixed-content link: ${dmUrl}`);
        return;
      }
      link.setAttribute('title', dmUrl);
      link.textContent = alt || EMPTY_ALT_SENTINEL;
      return;
    }

    const a = document.createElement('a');
    a.setAttribute('href', dmUrl);
    if (alt) a.setAttribute('title', alt);
    a.textContent = dmUrl;
    node.replaceWith(a);
  });
}
