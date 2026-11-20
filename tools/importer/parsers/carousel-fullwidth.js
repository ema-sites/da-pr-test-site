/* eslint-disable */
/* global WebImporter */

/**
 * carousel-fullwidth parser.
 * Source: decorated EDS carousel (.carousel.summit-carousel) with
 * ul.carousel-slides > li.carousel-slide > .carousel-slide-image picture img
 * and an (empty on this page) .carousel-slide-content.
 * Target table (2 columns, one row per slide): [slide image, slide text].
 * The DM image src is kept verbatim (query parameters included); the img is
 * left unlinked so the Dynamic Media transformer converts it.
 */
export default function parse(element, { document }) {
  const cells = [];

  let slides = [...element.querySelectorAll('.carousel-slides > li.carousel-slide')];
  // Undecorated fallback: rows of the block table.
  if (!slides.length) slides = [...element.querySelectorAll(':scope > div')];

  slides.forEach((slide) => {
    const srcImg = slide.querySelector('.carousel-slide-image img') || slide.querySelector('img');
    if (!srcImg || !srcImg.getAttribute('src')) return;
    const img = document.createElement('img');
    img.setAttribute('src', srcImg.getAttribute('src'));
    img.setAttribute('alt', srcImg.getAttribute('alt') || '');

    const content = slide.querySelector('.carousel-slide-content');
    const text = [];
    if (content && content.textContent.trim()) {
      text.push(...[...content.childNodes].filter((n) => n.nodeType === 1 || n.textContent.trim()));
    }
    cells.push([img, text.length ? text : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-fullwidth', cells });
  element.replaceWith(block);
}
