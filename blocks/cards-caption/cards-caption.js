import { createOptimizedPicture } from '../../scripts/aem.js';

const IMAGE_URL = /^https?:\/\/\S+$/i;

/**
 * Returns a <picture> when the cell is an image: an authored picture, a lone
 * image link, or a plain-text image URL. Link and text URLs are used exactly
 * as authored - the Dynamic Media query parameters (crop, flip, colorize,
 * preset) are what each card demonstrates and must not be rewritten.
 */
function toPicture(cell) {
  const existing = cell.querySelector('picture');
  if (existing) return existing;
  const links = cell.querySelectorAll('a[href]');
  if (links.length > 1) return null;
  const link = links[0];
  const text = cell.textContent.trim();
  const url = link ? link.getAttribute('href').trim() : text;
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
    li.className = 'cards-caption-card';
    [...row.children].forEach((cell, idx) => {
      const picture = idx === 0 ? toPicture(cell) : null;
      if (picture) {
        cell.replaceChildren(picture);
        cell.className = 'cards-caption-card-image';
      } else if (cell.children.length === 1 && cell.querySelector(':scope > picture')) {
        cell.className = 'cards-caption-card-image';
      } else {
        if (!cell.textContent.trim()) return;
        cell.className = 'cards-caption-card-caption';
      }
      li.append(cell);
    });
    // Use the caption as alt text when the image has none.
    const img = li.querySelector('.cards-caption-card-image img');
    const caption = li.querySelector('.cards-caption-card-caption');
    if (img && !img.alt && caption) img.alt = caption.textContent.trim();
    if (li.children.length) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  block.replaceChildren(ul);
}
