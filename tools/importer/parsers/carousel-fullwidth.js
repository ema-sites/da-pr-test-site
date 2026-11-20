/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-fullwidth.
 * Source: already-decorated EDS carousel (div.carousel.block > ul.carousel-slides > li.carousel-slide).
 * Target table (blocks/carousel-fullwidth/README.md): one row per slide,
 *   cell 1 = image (alone), cell 2 = optional text (heading, description, CTA).
 */
export default function parse(element, { document }) {
  const cells = [];

  let slides = [...element.querySelectorAll('li.carousel-slide')];
  // Fallback for undecorated markup: block > div rows
  if (!slides.length) slides = [...element.querySelectorAll(':scope > div')];

  slides.forEach((slide) => {
    const imageWrap = slide.querySelector('.carousel-slide-image') || slide.querySelector(':scope > div:first-child');
    const img = (imageWrap || slide).querySelector('img');
    const imageCell = [];
    if (img) {
      const picture = img.closest('picture');
      imageCell.push(picture || img);
    }
    if (!imageCell.length) return;

    const contentWrap = slide.querySelector('.carousel-slide-content')
      || slide.querySelector(':scope > div:nth-child(2)');
    const textCell = [];
    if (contentWrap) {
      [...contentWrap.children].forEach((child) => {
        if (child.textContent.trim() || child.querySelector('img, picture')) textCell.push(child);
      });
      if (!textCell.length && contentWrap.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = contentWrap.textContent.trim();
        textCell.push(p);
      }
    }

    cells.push([imageCell, textCell.length ? textCell : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-fullwidth', cells });
  element.replaceWith(block);
}
