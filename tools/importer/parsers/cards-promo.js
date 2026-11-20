/* eslint-disable */
/* global WebImporter */

/**
 * cards-promo parser (.cards.tours).
 * Source: ul > li with .cards-card-dynamic-image img (Scene7 template URL with
 * $image, $font, $texttop, layer and op_colorize params) and .cards-card-body
 * (title p, p.button-container > a.button, description p).
 * Target table (2 columns, one row per card): [image, body].
 * Body keeps the order expected by blocks/cards-promo: title paragraph,
 * CTA paragraph holding one link, description paragraph.
 * The DM URL is kept verbatim and the img is left unlinked so the Dynamic
 * Media transformer converts it into a DA link-image.
 */
export default function parse(element, { document }) {
  const cells = [];

  element.querySelectorAll(':scope > ul > li').forEach((li) => {
    const srcImg = li.querySelector('.cards-card-dynamic-image img, .cards-card-image img');
    let imageCell = '';
    if (srcImg && srcImg.getAttribute('src')) {
      const img = document.createElement('img');
      img.setAttribute('src', srcImg.getAttribute('src'));
      img.setAttribute('alt', srcImg.getAttribute('alt') || '');
      imageCell = img;
    }

    const body = li.querySelector('.cards-card-body');
    const bodyContent = [];
    if (body) {
      [...body.children].forEach((child) => {
        if (!child.textContent.trim() && !child.querySelector('img')) return;
        child.removeAttribute('class');
        child.querySelectorAll('a').forEach((a) => a.removeAttribute('class'));
        bodyContent.push(child);
      });
    }

    if (!imageCell && !bodyContent.length) return;
    cells.push([imageCell, bodyContent.length ? bodyContent : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
