/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hotspot.
 * Source: already-decorated EDS hotspot block. Row 1 (div > div > picture) is the
 *   background image; each hotspot was rewritten by the source decorator into
 *   div.hotspot[style="left:..;top:.."][data="<content URL>"] > div.hotspot-content
 *   (iframe / img / text).
 * Target table (blocks/hotspot/README.md):
 *   row 1: background image
 *   one row per hotspot: | content URL or text | left (x%) | top (y%) |
 * Undecorated rows (div > div x3) are also supported.
 */

function readStyleProp(el, prop) {
  const fromStyle = el.style && el.style[prop];
  if (fromStyle) return fromStyle.trim();
  const style = el.getAttribute('style') || '';
  const m = style.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, 'i'));
  return m ? m[1].trim() : '';
}

function buildContentCell(document, content) {
  if (/^https?:\/\/\S+$/i.test(content)) {
    const a = document.createElement('a');
    a.href = content;
    a.textContent = content;
    return a;
  }
  const p = document.createElement('p');
  p.textContent = content;
  return p;
}

export default function parse(element, { document }) {
  const cells = [];

  // Background image: first non-hotspot row containing an image
  const bgRow = [...element.querySelectorAll(':scope > div:not(.hotspot)')]
    .find((row) => row.querySelector('img'));
  if (bgRow) {
    const img = bgRow.querySelector('img');
    cells.push([img.closest('picture') || img]);
  }

  const decorated = [...element.querySelectorAll(':scope > div.hotspot')];
  if (decorated.length) {
    decorated.forEach((spot) => {
      let content = (spot.getAttribute('data') || '').trim();
      if (!content) {
        const frame = spot.querySelector('iframe[src]');
        const img = spot.querySelector('img[src]');
        if (frame) content = frame.getAttribute('src');
        else if (img) content = img.getAttribute('src');
        else content = spot.textContent.trim();
      }
      if (!content) return;
      const left = readStyleProp(spot, 'left');
      const top = readStyleProp(spot, 'top');
      cells.push([buildContentCell(document, content), left, top]);
    });
  } else {
    // Undecorated authored rows: | content | left | top |
    [...element.querySelectorAll(':scope > div')].forEach((row) => {
      if (row === bgRow) return;
      const cols = [...row.children];
      if (cols.length < 3) return;
      const link = cols[0].querySelector('a[href]');
      const content = link ? link.getAttribute('href') : cols[0].textContent.trim();
      if (!content) return;
      cells.push([
        buildContentCell(document, content),
        cols[1].textContent.trim(),
        cols[2].textContent.trim(),
      ]);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hotspot', cells });
  element.replaceWith(block);
}
