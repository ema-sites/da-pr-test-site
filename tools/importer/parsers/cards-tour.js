/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-tour.
 * Source: already-decorated EDS cards (div.cards.tours.block > ul > li), each li holding
 *   div.cards-card-dynamic-image (Scene7 composite <img>) and div.cards-card-body.
 * Target table (blocks/cards-tour/README.md): one row per card,
 *   cell 1 = image, cell 2 = body (title paragraph, CTA link paragraph, description paragraph).
 */
export default function parse(element, { document }) {
  const cells = [];

  let items = [...element.querySelectorAll(':scope > ul > li')];
  if (!items.length) items = [...element.querySelectorAll('li')];

  items.forEach((item) => {
    const imageWrap = item.querySelector('.cards-card-dynamic-image, .cards-card-image');
    const img = (imageWrap || item).querySelector('img');
    const imageCell = [];
    if (img) imageCell.push(img.closest('picture') || img);

    const body = item.querySelector('.cards-card-body');
    const bodyCell = [];
    if (body) {
      [...body.children].forEach((child) => {
        if (!child.textContent.trim() && !child.querySelector('img')) return;
        const link = child.matches('p.button-container') ? child.querySelector('a') : null;
        if (link) {
          // Plain CTA paragraph: <p><a href>Text</a></p>
          const p = document.createElement('p');
          const a = document.createElement('a');
          a.href = link.getAttribute('href');
          a.textContent = link.textContent.trim();
          p.append(a);
          bodyCell.push(p);
        } else {
          bodyCell.push(child);
        }
      });
    }

    if (!imageCell.length && !bodyCell.length) return;
    cells.push([imageCell.length ? imageCell : '', bodyCell.length ? bodyCell : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-tour', cells });
  element.replaceWith(block);
}
