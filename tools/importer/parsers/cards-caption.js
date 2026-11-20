/* eslint-disable */
/* global WebImporter */

/**
 * cards-caption parser (.cards blocks other than .cards.tours).
 * Source: ul > li with .cards-card-image picture img (DM URL carrying
 * crop/flip/colorize/layers/preset params) and .cards-card-body caption text.
 * Target table (2 columns, one row per card): [image, caption].
 * The DM URL is kept verbatim and the img is left unlinked so the Dynamic
 * Media transformer converts it into a DA link-image.
 */
export default function parse(element, { document }) {
  const cells = [];

  element.querySelectorAll(':scope > ul > li').forEach((li) => {
    const srcImg = li.querySelector('.cards-card-image img');
    let imageCell = '';
    if (srcImg && srcImg.getAttribute('src')) {
      const img = document.createElement('img');
      img.setAttribute('src', srcImg.getAttribute('src'));
      img.setAttribute('alt', srcImg.getAttribute('alt') || '');
      imageCell = img;
    }

    const body = li.querySelector('.cards-card-body');
    let captionCell = '';
    if (body && body.textContent.trim()) {
      const blocks = [...body.children].filter((c) => /^(P|H[1-6]|UL|OL)$/.test(c.tagName));
      if (blocks.length) {
        captionCell = blocks;
      } else {
        captionCell = document.createElement('p');
        captionCell.textContent = body.textContent.replace(/\s+/g, ' ').trim();
      }
    }

    if (!imageCell && !captionCell) return;
    cells.push([imageCell, captionCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-caption', cells });
  element.replaceWith(block);
}
