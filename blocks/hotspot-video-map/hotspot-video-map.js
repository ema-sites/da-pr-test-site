/*
 * hotspot-video-map: background image with positioned hotspots that open media in a modal.
 * Row 1: background image (<picture>/<img>, link to an image URL, or bare URL).
 * Each following row: [media URL] [left %] [top %] [optional label].
 * Media URLs (DM delivery /play videos, Scene7 viewers) are loaded in an iframe exactly
 * as authored; image URLs keep their Dynamic Media query strings.
 */

function isUrl(text) {
  return /^https?:\/\/\S+$/i.test((text || '').trim());
}

function findUrl(cell) {
  if (!cell) return null;
  const link = [...cell.querySelectorAll('a[href]')]
    .find((a) => /^https?:\/\//i.test(a.getAttribute('href')));
  if (link) return link.getAttribute('href');
  const match = cell.textContent.match(/https?:\/\/\S+/i);
  return match ? match[0] : null;
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

/** Parse "38.5%" / "38.5" into a clamped percentage, or null. */
function parsePercent(cell) {
  if (!cell) return null;
  const value = parseFloat(cell.textContent.trim().replace(',', '.'));
  if (Number.isNaN(value)) return null;
  return Math.min(100, Math.max(0, value));
}

function getModal(block) {
  let dialog = block.querySelector('.hotspot-video-map-modal');
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.className = 'hotspot-video-map-modal';
  dialog.innerHTML = `
    <button type="button" class="hotspot-video-map-modal-close" aria-label="Close"></button>
    <div class="hotspot-video-map-modal-content"></div>`;
  const close = () => dialog.close();
  dialog.querySelector('.hotspot-video-map-modal-close').addEventListener('click', close);
  // click on the backdrop closes the dialog
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close();
  });
  // stop media playback when the dialog closes
  dialog.addEventListener('close', () => {
    dialog.querySelector('.hotspot-video-map-modal-content').replaceChildren();
    document.body.classList.remove('hotspot-video-map-modal-open');
  });
  block.append(dialog);
  return dialog;
}

function openMedia(block, url, label) {
  const dialog = getModal(block);
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.title = label;
  iframe.setAttribute('allow', 'autoplay; fullscreen; encrypted-media; picture-in-picture');
  iframe.setAttribute('allowfullscreen', '');
  dialog.querySelector('.hotspot-video-map-modal-content').replaceChildren(iframe);
  document.body.classList.add('hotspot-video-map-modal-open');
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

export default function decorate(block) {
  const rows = [...block.children];
  const stage = document.createElement('div');
  stage.className = 'hotspot-video-map-stage';

  // background = first row without position cells whose first cell resolves to an image
  let rest = rows;
  const bgIndex = rows.findIndex((row) => parsePercent(row.children[1]) === null
    && parsePercent(row.children[2]) === null
    && resolveImage(row.children[0]));
  if (bgIndex !== -1) {
    const picture = resolveImage(rows[bgIndex].children[0]);
    const bg = document.createElement('div');
    bg.className = 'hotspot-video-map-background';
    bg.append(picture);
    stage.append(bg);
    rest = rows.filter((_, i) => i !== bgIndex);
  }

  const list = document.createElement('ul');
  list.className = 'hotspot-video-map-points';
  rest.forEach((row) => {
    const cells = [...row.children];
    const url = findUrl(cells[0]);
    const left = parsePercent(cells[1]);
    const top = parsePercent(cells[2]);
    if (!url || left === null || top === null) return;

    const index = list.children.length + 1;
    const authoredLabel = cells[3]?.textContent.trim();
    const label = authoredLabel || `Open media ${index}`;

    const li = document.createElement('li');
    li.className = 'hotspot-video-map-point';
    li.style.left = `${left}%`;
    li.style.top = `${top}%`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hotspot-video-map-trigger';
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-haspopup', 'dialog');
    button.dataset.mediaUrl = url;
    button.addEventListener('click', () => openMedia(block, url, label));
    li.append(button);
    list.append(li);
  });
  stage.append(list);

  block.replaceChildren(stage);
}
