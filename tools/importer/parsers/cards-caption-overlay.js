/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-caption-overlay (source: decorated EDS `div.cards` without `.tours`).
 *
 * Target table (blocks/cards-caption-overlay/README.md): one row per tile,
 *   cell 1 = image (DM Open API URL with transformation params, kept verbatim),
 *   cell 2 = short caption text.
 *
 * Source (decorated): ul > li > div.cards-card-image picture img + div.cards-card-body (caption text)
 * Fallback (undecorated authored markup): :scope > div rows with two cells.
 * Instances on this template: crop tiles (4), color transformation tiles (4), composite tiles (2).
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

function captionNodes(cell) {
  if (!cell) return [];
  const nodes = [...cell.childNodes].filter((n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim()));
  if (nodes.length && nodes.every((n) => n.nodeType === 3)) {
    return [cell.textContent.trim()];
  }
  return nodes;
}

export default function parse(element, { document }) {
  const cells = [];

  const items = [...element.querySelectorAll(':scope > ul > li')];
  if (items.length) {
    items.forEach((li) => {
      const img = cloneImage(document, li.querySelector('.cards-card-image img') || li.querySelector('img'));
      const caption = captionNodes(li.querySelector('.cards-card-body'));
      if (!img && !caption.length) return;
      cells.push([img || '', caption.length ? caption : '']);
    });
  } else {
    [...element.querySelectorAll(':scope > div')].forEach((row) => {
      const cols = [...row.querySelectorAll(':scope > div')];
      const img = cloneImage(document, cols[0] && cols[0].querySelector('img'));
      const caption = captionNodes(cols[1]);
      if (!img && !caption.length) return;
      cells.push([img || '', caption.length ? caption : '']);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-caption-overlay', cells });
  element.replaceWith(block);
}
