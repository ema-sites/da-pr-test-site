/*
 * cards-caption-overlay: image tiles with a short caption overlaid at the bottom.
 * One row per tile: [image] [caption text].
 * Images may be authored as <picture>/<img>, a link to an image URL, or a bare URL.
 * Dynamic Media Open API URLs are rendered as-is (query strings carry the transformation).
 */

function isUrl(text) {
  return /^https?:\/\/\S+$/i.test((text || '').trim());
}

function resolveImage(cell) {
  if (!cell) return null;
  const picture = cell.querySelector('picture');
  if (picture) return picture;
  const existingImg = cell.querySelector('img');
  let src = existingImg ? existingImg.getAttribute('src') : null;
  let alt = existingImg ? existingImg.getAttribute('alt') || '' : '';
  if (!src) {
    const link = cell.querySelector('a[href]');
    if (link && (isUrl(link.textContent) || !link.textContent.trim())) {
      src = link.getAttribute('href');
      alt = link.getAttribute('title') || '';
    } else if (!link && isUrl(cell.textContent)) {
      src = cell.textContent.trim();
    }
  }
  if (!src) return null;
  const pic = document.createElement('picture');
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.loading = 'lazy';
  pic.append(img);
  return pic;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const picture = resolveImage(cells[0]);
    const captionCell = picture ? cells[1] : cells[0];
    if (!picture && !captionCell?.textContent.trim()) return;

    const li = document.createElement('li');
    li.className = 'cards-caption-overlay-card';

    if (picture) {
      const imageDiv = document.createElement('div');
      imageDiv.className = 'cards-caption-overlay-card-image';
      imageDiv.append(picture);
      li.append(imageDiv);
    }

    if (captionCell && captionCell.textContent.trim()) {
      const caption = document.createElement('div');
      caption.className = 'cards-caption-overlay-card-caption';
      caption.append(...captionCell.childNodes);
      const img = li.querySelector('img');
      if (img && !img.alt) img.alt = caption.textContent.trim();
      li.append(caption);
    }

    ul.append(li);
  });
  block.replaceChildren(ul);
}
