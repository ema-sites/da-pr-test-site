import { createOptimizedPicture } from '../../scripts/aem.js';

const IMAGE_EXT = /\.(avif|gif|jpe?g|png|webp|svg)$/i;

/** Dynamic Media composite URLs (e.g. /is/image/...) carry no file extension. */
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
  if (!cell || cell.querySelector('picture, img')) return false;
  const link = cell.querySelector('a');
  const href = (link ? link.href : cell.textContent).trim();
  if (!/^https?:\/\/\S+$/i.test(href) || !isImageUrl(href)) return false;
  const picture = document.createElement('picture');
  const img = document.createElement('img');
  img.src = href;
  img.alt = '';
  img.loading = 'lazy';
  picture.append(img);
  cell.replaceChildren(picture);
  return true;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('img, picture')) return;
    const li = document.createElement('li');
    li.className = 'cards-tour-card';
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((cell) => {
      ensurePicture(cell);
      const onlyImage = cell.querySelector('picture, img') && !cell.textContent.trim();
      if (onlyImage) {
        cell.className = 'cards-tour-card-image';
        return;
      }
      if (!cell.textContent.trim()) {
        cell.remove();
        return;
      }
      cell.className = 'cards-tour-card-body';
      const paragraphs = [...cell.querySelectorAll(':scope > p')];
      // title: first paragraph that is not a lone link
      const isLink = (p) => p.children.length === 1 && p.querySelector(':scope > a, :scope > strong > a, :scope > em > a')
        && p.textContent.trim() === p.querySelector('a').textContent.trim();
      const title = paragraphs.find((p) => !isLink(p));
      if (title) title.classList.add('cards-tour-card-title');
      paragraphs.filter(isLink).forEach((p) => {
        p.classList.add('cards-tour-card-cta');
        p.querySelector('a').classList.add('button');
      });
      paragraphs
        .filter((p) => p !== title && !isLink(p))
        .forEach((p) => p.classList.add('cards-tour-card-description'));
    });
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  block.replaceChildren(ul);
}
