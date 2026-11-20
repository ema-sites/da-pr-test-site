import { createOptimizedPicture } from '../../scripts/aem.js';

const IMAGE_EXT = /\.(avif|gif|jpe?g|png|webp|svg)$/i;

function isImageUrl(href) {
  try {
    const { pathname } = new URL(href);
    if (/\/play$/.test(pathname)) return false;
    return IMAGE_EXT.test(pathname) || /\/is\/image\//.test(pathname) || /\/adobe\/assets\//.test(pathname);
  } catch (e) {
    return false;
  }
}

/** Turn a cell holding only an image URL (link or plain text) into a <picture>. */
function ensurePicture(cell) {
  if (!cell || cell.querySelector('picture, img')) return;
  const link = cell.querySelector('a');
  const href = (link ? link.href : cell.textContent).trim();
  if (!/^https?:\/\/\S+$/i.test(href) || !isImageUrl(href)) return;
  const picture = document.createElement('picture');
  const img = document.createElement('img');
  img.src = href;
  img.alt = '';
  img.loading = 'lazy';
  picture.append(img);
  cell.replaceChildren(picture);
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('img, picture')) return;
    const li = document.createElement('li');
    li.className = 'cards-caption-card';
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((cell) => {
      ensurePicture(cell);
      if (cell.querySelector('picture, img') && !cell.textContent.trim()) {
        cell.className = 'cards-caption-card-image';
      } else if (cell.textContent.trim()) {
        cell.className = 'cards-caption-card-caption';
      } else {
        cell.remove();
      }
    });

    const image = li.querySelector('.cards-caption-card-image img');
    const caption = li.querySelector('.cards-caption-card-caption');
    if (image && caption && !image.alt) image.alt = caption.textContent.trim();
    if (!caption) li.classList.add('cards-caption-card-no-caption');
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  block.replaceChildren(ul);
}
