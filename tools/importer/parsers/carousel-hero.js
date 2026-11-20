/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-hero (source: decorated EDS `div.carousel.summit-carousel`).
 *
 * Target table (blocks/carousel-hero/README.md): one row per slide,
 *   cell 1 = slide image, cell 2 = optional text (heading / description / CTA).
 *
 * Source (decorated): ul.carousel-slides > li.carousel-slide
 *   > div.carousel-slide-image picture img  +  div.carousel-slide-content
 * Fallback (undecorated authored markup): :scope > div rows with two cells.
 *
 * Images are re-emitted as <img> with the full, unmodified DM URL (query string kept);
 * the DM transformer turns them into DA link-images after parsing.
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

function contentNodes(cell) {
  if (!cell) return [];
  return [...cell.childNodes].filter((n) => (n.nodeType === 1) || (n.nodeType === 3 && n.textContent.trim()));
}

export default function parse(element, { document }) {
  const cells = [];

  const slides = [...element.querySelectorAll('li.carousel-slide')];
  if (slides.length) {
    slides.forEach((slide) => {
      const img = cloneImage(document, slide.querySelector('.carousel-slide-image img') || slide.querySelector('img'));
      if (!img) return;
      const content = contentNodes(slide.querySelector('.carousel-slide-content'));
      cells.push([img, content.length ? content : '']);
    });
  } else {
    // Undecorated block: each direct child div is a slide row
    [...element.querySelectorAll(':scope > div')].forEach((row) => {
      const cols = [...row.querySelectorAll(':scope > div')];
      const img = cloneImage(document, (cols[0] || row).querySelector('img'));
      if (!img) return;
      const content = contentNodes(cols[1]);
      cells.push([img, content.length ? content : '']);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
