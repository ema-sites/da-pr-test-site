/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-tour (source: decorated EDS `div.cards.tours`).
 *
 * Target table (blocks/cards-tour/README.md): one row per card,
 *   cell 1 = card image (Scene7 templated URL kept verbatim, incl. `$image`/`$badge`/`$text*`),
 *   cell 2 = title paragraph (may contain <br>), CTA paragraph (single link), description.
 *
 * Source (decorated): ul > li > div.cards-card-dynamic-image img + div.cards-card-body > p...
 * Fallback (undecorated authored markup): :scope > div rows with two cells.
 */

function cloneImage(document, img) {
  if (!img) return null;
  const src = img.getAttribute('src');
  if (!src) return null;
  const out = document.createElement('img');
  out.setAttribute('src', src);
  out.setAttribute('alt', img.getAttribute('alt') || '');
  return out;
}

function buildBody(document, body) {
  const out = [];
  if (!body) return out;
  [...body.children].forEach((child) => {
    const link = child.matches('p.button-container') ? child.querySelector('a[href]') : null;
    if (link) {
      // Normalise the CTA paragraph to a plain <p><a></a></p>
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', link.getAttribute('href'));
      if (link.getAttribute('title')) a.setAttribute('title', link.getAttribute('title'));
      a.textContent = link.textContent.trim();
      p.append(a);
      out.push(p);
    } else if (child.textContent.trim() || child.querySelector('img, picture')) {
      out.push(child);
    }
  });
  return out;
}

export default function parse(element, { document }) {
  const cells = [];

  const items = [...element.querySelectorAll(':scope > ul > li')];
  if (items.length) {
    items.forEach((li) => {
      const img = cloneImage(document,
        li.querySelector('.cards-card-dynamic-image img, .cards-card-image img') || li.querySelector('img'));
      const body = buildBody(document, li.querySelector('.cards-card-body'));
      if (!img && !body.length) return;
      cells.push([img || '', body.length ? body : '']);
    });
  } else {
    [...element.querySelectorAll(':scope > div')].forEach((row) => {
      const cols = [...row.querySelectorAll(':scope > div')];
      const img = cloneImage(document, cols[0] && cols[0].querySelector('img'));
      const body = cols[1] ? [...cols[1].children] : [];
      if (!img && !body.length) return;
      cells.push([img || '', body.length ? body : '']);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-tour', cells });
  element.replaceWith(block);
}
