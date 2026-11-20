/*
 * Hotspot
 * Row 1: background image (picture, image link or plain-text image URL).
 * Each following row: [media link(s), left position %, top position %].
 * Clicking a hotspot opens the linked media (e.g. a Dynamic Media video
 * /play URL or a 3D viewer) in an iframe inside a modal dialog.
 * All URLs are used exactly as authored.
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

const HTTP_URL = /^https?:\/\/\S+$/i;

function toPicture(cell) {
  const existing = cell.querySelector('picture');
  if (existing) return existing;
  const link = cell.querySelector('a[href]');
  const url = (link ? link.getAttribute('href') : cell.textContent).trim();
  if (!HTTP_URL.test(url)) return null;
  const picture = document.createElement('picture');
  const img = document.createElement('img');
  img.src = url;
  img.alt = link && link.title ? link.title : '';
  img.loading = 'lazy';
  picture.append(img);
  return picture;
}

/** Collects http(s) media URLs from links or plain-text lines in a cell. */
function getMediaLinks(cell) {
  const links = [...cell.querySelectorAll('a[href]')]
    .map((a) => ({
      href: a.getAttribute('href').trim(),
      label: a.textContent.trim() !== a.getAttribute('href').trim() ? a.textContent.trim() : '',
    }));
  if (!links.length) {
    cell.textContent.split(/\s+/).forEach((token) => links.push({ href: token, label: '' }));
  }
  return links.filter((l) => HTTP_URL.test(l.href));
}

/** Parses "38.5%" / "38.5" into a number clamped to 0-100, or null. */
function parsePercent(cell) {
  if (!cell) return null;
  const value = parseFloat(cell.textContent.trim().replace(',', '.'));
  if (Number.isNaN(value)) return null;
  return Math.min(100, Math.max(0, value));
}

function createDialog() {
  const dialog = document.createElement('dialog');
  dialog.className = 'hotspot-dialog';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'hotspot-dialog-close';
  close.setAttribute('aria-label', 'Close');
  const body = document.createElement('div');
  body.className = 'hotspot-dialog-body';
  dialog.append(close, body);

  close.addEventListener('click', () => dialog.close());
  // Click on the backdrop (outside the dialog box) closes it.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  // Clear iframes on close so video playback stops.
  dialog.addEventListener('close', () => body.replaceChildren());
  return dialog;
}

function openMedia(dialog, media, label) {
  const body = dialog.querySelector('.hotspot-dialog-body');
  body.replaceChildren(...media.map((m, idx) => {
    const frame = document.createElement('div');
    frame.className = 'hotspot-dialog-frame';
    const iframe = document.createElement('iframe');
    iframe.src = m.href;
    iframe.title = m.label || `${label}${media.length > 1 ? ` (${idx + 1})` : ''}`;
    iframe.allowFullscreen = true;
    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media; xr-spatial-tracking');
    frame.append(iframe);
    return frame;
  }));
  dialog.setAttribute('aria-label', label);
  dialog.showModal();
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  const stage = document.createElement('div');
  stage.className = 'hotspot-stage';

  // Row 1 is the background image.
  const [bgRow, ...pointRows] = rows;
  const bgCell = bgRow.querySelector(':scope > div');
  const picture = bgCell ? toPicture(bgCell) : null;
  if (picture) {
    const image = document.createElement('div');
    image.className = 'hotspot-image';
    image.append(picture);
    stage.append(image);
  }

  const dialog = createDialog();
  const points = pointRows
    .map((row) => {
      const [mediaCell, leftCell, topCell] = [...row.querySelectorAll(':scope > div')];
      const media = mediaCell ? getMediaLinks(mediaCell) : [];
      const left = parsePercent(leftCell);
      const top = parsePercent(topCell);
      if (!media.length || left === null || top === null) return null;
      return { media, left, top };
    })
    .filter(Boolean);

  points.forEach((point, idx) => {
    const label = point.media[0].label || `Open media ${idx + 1} of ${points.length}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hotspot-point';
    button.style.left = `${point.left}%`;
    button.style.top = `${point.top}%`;
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-haspopup', 'dialog');
    button.addEventListener('click', () => openMedia(dialog, point.media, label));
    stage.append(button);
  });

  block.replaceChildren(stage, dialog);

  block.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '2000' }]));
  });
}
