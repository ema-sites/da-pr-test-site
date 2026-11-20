/* eslint-disable */
/* global WebImporter */

/**
 * Dynamic Media / Scene7 image transformer (DA project).
 *
 * afterTransform only: rewrites DM <img> to anchors that survive markdown.
 * - Unlinked (DA): <a href="DM-URL" title="alt">DM-URL</a> (DA link-image).
 * - Linked: keep navigation href, DM URL goes to title, content = alt or sentinel.
 * - Mixed-content anchors are skipped with a warning.
 * The DM URL (including all query modifiers such as crop, colorize, layers,
 * $image, $font) is taken verbatim from the src attribute.
 */
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

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;
  const doc = element.ownerDocument || element;

  [...element.querySelectorAll('img')].forEach((img) => {
    let src = img.getAttribute('src') || '';
    if (!detectDynamicMediaUrl(src)) return;
    if (src.startsWith('//')) src = `https:${src}`;
    const alt = (img.getAttribute('alt') || '').trim();
    const picture = img.closest('picture');
    const node = picture || img;

    const link = node.closest('a');
    if (link) {
      const others = [...link.querySelectorAll('img')].filter((i) => i !== img);
      if (others.length || link.textContent.trim()) {
        console.warn(`[dm-images] skipping mixed-content anchor for ${src}`);
        return;
      }
      link.setAttribute('title', src);
      link.textContent = alt || EMPTY_ALT_SENTINEL;
      return;
    }

    const a = doc.createElement('a');
    a.setAttribute('href', src);
    if (alt) a.setAttribute('title', alt);
    a.textContent = src;
    node.replaceWith(a);
  });
}
