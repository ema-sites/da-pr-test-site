/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for aem-dynamicmedia-demo (template: travel-hospitality).
 *
 * The source is itself an EDS site, so the captured DOM is decorated EDS markup:
 *   header.header-wrapper / footer.footer-wrapper  -> chrome, removed
 *   main > div.section > div.*-wrapper              -> kept (section + block selectors)
 *
 * Dynamic Media images on the source are authored in three shapes:
 *   1. decorated <img src="DM-URL"> (rendered DOM)
 *   2. <a href="DM-URL">DM-URL</a> (carousel slides in the authored doc)
 *   3. bare URL text in a cell (`dynamic logo` block, `cards tours` images)
 * beforeTransform normalises 2 and 3 into <img src="DM-URL"> so parsers and
 * the DM transformer see one shape. Full URLs (query strings carry crop,
 * colorize, flip, text layers, preset) are kept verbatim.
 *
 * Section rc2 (`div.dynamic-wrapper > div.dynamic.logo`) is not a block in the
 * target: the logo becomes a plain inline image in default content.
 */

function isDmImageUrl(url) {
  if (typeof url !== 'string') return false;
  const s = url.trim();
  if (!/^(https?:)?\/\//i.test(s)) return false;
  let u;
  try { u = new URL(s, 'https://x/'); } catch (e) { return false; }
  if (u.pathname.startsWith('/is/image/')) return true;
  if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname)
    && /^\/adobe\/assets\/urn:[^/]+\/(original\/)?as\/[^/]+$/.test(u.pathname)
    && !/\.(mp4|m4v|mov|webm|m3u8|mpd)$/i.test(u.pathname)) return true;
  return false;
}

function makeImg(document, src, alt) {
  const img = document.createElement('img');
  img.setAttribute('src', src.trim());
  img.setAttribute('alt', alt || '');
  return img;
}

/** Convert DM carrier links and bare DM URL text inside main into <img>. */
function normaliseDmCarriers(main, document) {
  // <a href="DM-URL">DM-URL</a> (link text is the URL itself, i.e. a carrier, not a navigation link)
  main.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (!isDmImageUrl(href)) return;
    if (a.querySelector('img, picture')) return;
    const text = (a.textContent || '').trim();
    if (text && text !== href.trim() && !isDmImageUrl(text)) return; // real text link, leave it
    a.replaceWith(makeImg(document, href, ''));
  });

  // Elements whose only content is a bare DM URL text node
  main.querySelectorAll('div, p, span').forEach((el) => {
    if (el.children.length) return;
    const text = (el.textContent || '').trim();
    if (!text || /\s/.test(text) || !isDmImageUrl(text)) return;
    el.textContent = '';
    el.append(makeImg(document, text, ''));
  });
}

/** rc2: unwrap the `dynamic logo` block into a default-content <p><img></p>. */
function unwrapDynamicLogo(main, document) {
  main.querySelectorAll('div.dynamic-wrapper > div.dynamic').forEach((block) => {
    const imgs = [...block.querySelectorAll('img')].filter((img) => img.getAttribute('src'));
    if (!imgs.length) return;
    const frag = document.createDocumentFragment();
    imgs.forEach((src) => {
      const img = makeImg(document, src.getAttribute('src'), src.getAttribute('alt') || '');
      const p = document.createElement('p');
      p.append(img);
      frag.append(p);
    });
    block.replaceWith(frag);
  });
}

export default function transform(hookName, element, payload) {
  const document = element.ownerDocument;

  if (hookName === 'beforeTransform') {
    // Site chrome (header/nav/footer) and non-content elements
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      '.header-wrapper',
      '.footer-wrapper',
      'body > nav',
      'script',
      'style',
      'noscript',
      'link',
    ]);

    const main = element.querySelector('main') || element;
    normaliseDmCarriers(main, document);
    unwrapDynamicLogo(main, document);
  }

  if (hookName === 'afterTransform') {
    // Leftover interactive chrome from decorated blocks (carousel arrows, slide indicators)
    WebImporter.DOMUtils.remove(element, [
      '.carousel-navigation-buttons',
      '.carousel-slide-indicators',
      'button',
      'nav',
      'script',
      'style',
      'noscript',
      'link',
    ]);

    // Decoration / tracking attributes added by the source EDS runtime
    const attrs = [
      'data-block-status',
      'data-section-status',
      'data-block-name',
      'data-aue-resource',
      'data-aue-type',
      'data-aue-prop',
      'data-aue-label',
      'onclick',
    ];
    element.querySelectorAll('*').forEach((el) => {
      attrs.forEach((a) => el.removeAttribute(a));
      [...el.attributes].forEach((attr) => {
        if (/^data-(analytics|track|gtm)/i.test(attr.name)) el.removeAttribute(attr.name);
      });
    });
  }
}
