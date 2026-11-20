import { createOptimizedPicture } from '../../scripts/aem.js';

const IMAGE_URL = /^https?:\/\/\S+$/i;

/**
 * Returns a <picture> when the cell is an image: an authored picture, a lone
 * image link, or a plain-text image URL. Link and text URLs are used exactly
 * as authored - Dynamic Media query parameters (overlays, personalized text,
 * colorize) are the content and must not be rewritten.
 */
function toPicture(cell) {
  const existing = cell.querySelector('picture');
  if (existing) return existing;
  const links = cell.querySelectorAll('a[href]');
  if (links.length > 1) return null;
  const link = links[0];
  const text = cell.textContent.trim();
  const url = link ? link.getAttribute('href').trim() : text;
  // A link only counts as an image when it is the whole cell (its text is the URL or empty).
  if (link && text && text !== link.textContent.trim()) return null;
  if (!IMAGE_URL.test(url)) return null;
  const picture = document.createElement('picture');
  const img = document.createElement('img');
  img.src = url;
  img.alt = '';
  img.loading = 'lazy';
  picture.append(img);
  return picture;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-promo-card';
    [...row.children].forEach((cell, idx) => {
      const picture = idx === 0 ? toPicture(cell) : null;
      if (picture) {
        cell.replaceChildren(picture);
        cell.className = 'cards-promo-card-image';
      } else if (cell.children.length === 1 && cell.querySelector(':scope > picture')) {
        cell.className = 'cards-promo-card-image';
      } else {
        if (!cell.textContent.trim() && !cell.querySelector('img')) return;
        cell.className = 'cards-promo-card-body';
        // Mark the CTA paragraph (a paragraph holding only a link) and the title (first paragraph).
        [...cell.querySelectorAll(':scope > p')].forEach((p, pIdx) => {
          const a = p.querySelector('a');
          if (a && p.textContent.trim() === a.textContent.trim()) {
            p.classList.add('cards-promo-card-cta');
            a.classList.add('cards-promo-card-button');
          } else if (pIdx === 0 && !cell.querySelector('h1, h2, h3, h4, h5, h6')) {
            p.classList.add('cards-promo-card-title');
          }
        });
      }
      li.append(cell);
    });
    if (li.children.length) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  block.replaceChildren(ul);
}
