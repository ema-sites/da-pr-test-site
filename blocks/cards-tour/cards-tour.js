/*
 * cards-tour: tour/product cards.
 * One row per card: [image] [title paragraph, CTA link, description].
 * Images may be authored as <picture>/<img>, a link to an image URL, or a bare URL.
 * Scene7 templated URLs are rendered as-is (query strings carry the personalisation).
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
    if (!cells.length || (!row.textContent.trim() && !row.querySelector('picture, img'))) return;
    const li = document.createElement('li');
    li.className = 'cards-tour-card';

    // image is normally the first cell; tolerate a missing image or missing body
    const imageCell = resolveImage(cells[0]);
    const bodyCell = imageCell ? cells[1] : cells[0];

    if (imageCell) {
      const imageDiv = document.createElement('div');
      imageDiv.className = 'cards-tour-card-image';
      imageDiv.append(imageCell);
      li.append(imageDiv);
    }

    if (bodyCell) {
      const body = document.createElement('div');
      body.className = 'cards-tour-card-body';
      body.append(...bodyCell.childNodes);
      // first paragraph/heading is the card title
      const first = body.querySelector(':scope > p, :scope > h2, :scope > h3, :scope > h4');
      if (first && !first.querySelector('a')) first.classList.add('cards-tour-card-title');
      body.querySelectorAll(':scope > p').forEach((p) => {
        const links = p.querySelectorAll('a');
        if (links.length === 1 && p.textContent.trim() === links[0].textContent.trim()) {
          p.classList.add('cards-tour-card-cta');
          links[0].classList.add('button');
        }
      });
      li.append(body);
    }

    ul.append(li);
  });
  block.replaceChildren(ul);
}
