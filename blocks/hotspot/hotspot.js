/*
 * Hotspot block
 * Row 1: background image (image, or a link / plain URL to an image).
 * Each following row is one hotspot: | content | left (x%) | top (y%) |
 *   content: a Dynamic Media video URL (.../play, .mp4), a viewer page URL
 *   (e.g. scene7 s7viewers/*.html, 3D/dimensional viewer), an image URL, or plain text.
 * Clicking a marker opens its content in a panel; only one panel is open at a time.
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

const IMAGE_EXT = /\.(avif|gif|jpe?g|png|webp|svg)$/i;
const VIDEO_FILE = /\.(mp4|webm|ogg|mov)$/i;
const POSITION = /^-?\d+(\.\d+)?\s*(%|px)?$/;

function parseUrl(text) {
  try {
    return new URL(text.trim(), window.location.href);
  } catch (e) {
    return null;
  }
}

function isImageUrl(url) {
  return IMAGE_EXT.test(url.pathname) || /\/is\/image\//.test(url.pathname);
}

/** Returns the cell's single URL (link href, or plain-text URL), else null. */
function cellUrl(cell) {
  const link = cell.querySelector('a[href]');
  if (link) return parseUrl(link.href);
  const text = cell.textContent.trim();
  return /^https?:\/\/\S+$/i.test(text) ? parseUrl(text) : null;
}

function toPosition(value) {
  const v = value.trim();
  if (!POSITION.test(v)) return null;
  return /(%|px)$/.test(v) ? v.replace(/\s+/g, '') : `${v}%`;
}

function buildBackground(cell) {
  if (!cell) return null;
  let picture = cell.querySelector('picture');
  if (!picture) {
    const img = cell.querySelector('img');
    const url = img ? null : cellUrl(cell);
    if (!img && !url) return null;
    picture = document.createElement('picture');
    const newImg = img || document.createElement('img');
    if (!img) {
      newImg.src = url.href;
      newImg.alt = '';
    }
    picture.append(newImg);
  }
  const img = picture.querySelector('img');
  if (img) {
    const url = new URL(img.src, window.location.href);
    if (url.origin === window.location.origin && !/\.svg$/i.test(url.pathname)) {
      picture = createOptimizedPicture(img.src, img.alt, true, [{ width: '2000' }]);
    }
  }
  const wrapper = document.createElement('div');
  wrapper.className = 'hotspot-image';
  wrapper.append(picture);
  return wrapper;
}

function buildMedia(contentCell) {
  const url = cellUrl(contentCell);
  if (!url) {
    const text = document.createElement('div');
    text.className = 'hotspot-text';
    text.append(...contentCell.childNodes);
    return { node: text, label: text.textContent.trim().slice(0, 60) };
  }
  if (isImageUrl(url)) {
    const img = document.createElement('img');
    img.src = url.href;
    img.alt = '';
    img.loading = 'lazy';
    return { node: img, label: 'image' };
  }
  if (VIDEO_FILE.test(url.pathname)) {
    const video = document.createElement('video');
    video.controls = true;
    video.setAttribute('playsinline', '');
    video.dataset.src = url.href;
    return { node: video, label: 'video' };
  }
  // Dynamic Media /play players and viewer pages (video, 3D, spin) are iframes
  const frame = document.createElement('div');
  frame.className = 'hotspot-frame';
  const iframe = document.createElement('iframe');
  iframe.dataset.src = url.href;
  iframe.title = /\/play$/.test(url.pathname) ? 'Dynamic Media video' : 'Dynamic Media viewer';
  iframe.allow = 'autoplay; fullscreen; encrypted-media';
  iframe.setAttribute('allowfullscreen', '');
  frame.append(iframe);
  return { node: frame, label: iframe.title.replace('Dynamic Media ', '') };
}

/** Lazily set src on first open so off-screen players don't load up front. */
function activateMedia(panel) {
  panel.querySelectorAll('[data-src]').forEach((el) => {
    el.src = el.dataset.src;
    el.removeAttribute('data-src');
  });
}

/** Stop playback when closing by reloading iframes / pausing videos. */
function deactivateMedia(panel) {
  panel.querySelectorAll('video').forEach((v) => v.pause());
  panel.querySelectorAll('iframe[src]').forEach((f) => {
    f.dataset.src = f.src;
    f.removeAttribute('src');
  });
}

function closeAll(block, except) {
  block.querySelectorAll('.hotspot-marker[aria-expanded="true"]').forEach((marker) => {
    if (marker === except) return;
    marker.setAttribute('aria-expanded', 'false');
    const panel = block.querySelector(`#${marker.getAttribute('aria-controls')}`);
    if (panel) {
      panel.hidden = true;
      deactivateMedia(panel);
    }
    marker.closest('.hotspot-point').classList.remove('hotspot-point-open');
  });
}

let hotspotId = 0;
export default function decorate(block) {
  hotspotId += 1;
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  // background: first row that holds an image or a lone image URL
  const bgRowIndex = rows.findIndex((row) => {
    const cells = [...row.children];
    return cells.length && (row.querySelector('picture, img')
      || (cells.length === 1 && cellUrl(cells[0]) && isImageUrl(cellUrl(cells[0]))));
  });
  const bgRow = bgRowIndex >= 0 ? rows[bgRowIndex] : null;
  const background = bgRow ? buildBackground(bgRow.children[0]) : null;

  const stage = document.createElement('div');
  stage.className = 'hotspot-stage';
  if (background) stage.append(background);

  let count = 0;
  rows.forEach((row) => {
    if (row === bgRow) return;
    const cells = [...row.children];
    // positions: cells whose text is a number / percentage; content: the rest
    const posCells = cells.filter((c) => toPosition(c.textContent) && !c.querySelector('a, img'));
    const contentCell = cells.find((c) => !posCells.includes(c) && (c.textContent.trim() || c.querySelector('img')));
    if (!contentCell || posCells.length < 2) return;

    count += 1;
    const left = toPosition(posCells[0].textContent);
    const top = toPosition(posCells[1].textContent);
    const panelId = `hotspot-${hotspotId}-panel-${count}`;
    const { node, label } = buildMedia(contentCell);

    const point = document.createElement('div');
    point.className = 'hotspot-point';
    point.style.left = left;
    point.style.top = top;

    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'hotspot-marker';
    marker.setAttribute('aria-expanded', 'false');
    marker.setAttribute('aria-controls', panelId);
    marker.setAttribute('aria-label', `Hotspot ${count}: open ${label}`);

    const panel = document.createElement('div');
    panel.className = 'hotspot-panel';
    panel.id = panelId;
    panel.hidden = true;
    panel.append(node);

    // flip the panel toward the image centre so it stays inside the stage
    if (parseFloat(left) > 50) point.classList.add('hotspot-point-right');
    if (parseFloat(top) > 50) point.classList.add('hotspot-point-bottom');

    marker.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = marker.getAttribute('aria-expanded') === 'true';
      closeAll(block, marker);
      marker.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
      point.classList.toggle('hotspot-point-open', !open);
      if (open) deactivateMedia(panel);
      else activateMedia(panel);
    });

    point.append(marker, panel);
    stage.append(point);
  });

  block.replaceChildren(stage);

  document.addEventListener('click', (e) => {
    if (!block.contains(e.target)) closeAll(block);
  });
  block.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openMarker = block.querySelector('.hotspot-marker[aria-expanded="true"]');
    closeAll(block);
    if (openMarker) openMarker.focus();
  });
}
