/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-caption.
 * Source: already-decorated EDS cards (div.cards.block:not(.tours) > ul > li), each li
 *   holding div.cards-card-image (DM Open API <img>, URL carries crop/layer params that
 *   ARE the content and must be kept) and div.cards-card-body (bare caption text).
 * Target table (blocks/cards-caption/README.md): one row per card,
 *   cell 1 = image, cell 2 = short caption text.
 */
export default function parse(element, { document }) {
  const cells = [];

  let items = [...element.querySelectorAll(':scope > ul > li')];
  if (!items.length) items = [...element.querySelectorAll('li')];

  items.forEach((item) => {
    const imageWrap = item.querySelector('.cards-card-image');
    const img = (imageWrap || item).querySelector('img');
    const imageCell = [];
    if (img) imageCell.push(img.closest('picture') || img);

    const body = item.querySelector('.cards-card-body');
    const captionCell = [];
    if (body && body.textContent.trim()) {
      const blockChildren = [...body.children].filter((c) => /^(P|H[1-6]|UL|OL)$/.test(c.tagName));
      if (blockChildren.length) {
        captionCell.push(...blockChildren);
      } else {
        // Bare text (possibly with inline markup): wrap in a paragraph
        const p = document.createElement('p');
        p.append(...body.childNodes);
        captionCell.push(p);
      }
    }

    if (!imageCell.length && !captionCell.length) return;
    cells.push([imageCell.length ? imageCell : '', captionCell.length ? captionCell : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-caption', cells });
  element.replaceWith(block);
}
