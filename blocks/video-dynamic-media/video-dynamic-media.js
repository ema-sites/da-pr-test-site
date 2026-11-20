/*
 * Video (Dynamic Media) block
 * Plays a Dynamic Media video referenced by a URL:
 *  - Dynamic Media viewer pages (scene7 s7viewers/*.html) and
 *    Dynamic Media with Open API players (.../adobe/assets/<id>/play) render in an iframe
 *  - direct video files (.mp4, .webm, .m3u8) render in a <video> element
 * An optional poster image turns it into click-to-play.
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const VIDEO_FILE = /\.(mp4|webm|ogg|mov|m3u8)$/i;

function findVideoUrl(block) {
  const link = [...block.querySelectorAll('a[href]')].find((a) => /^https?:/i.test(a.href));
  if (link) return link.href;
  const iframe = block.querySelector('iframe[src]');
  if (iframe) return iframe.src;
  const text = [...block.querySelectorAll(':scope > div > div')]
    .map((cell) => cell.textContent.trim())
    .find((t) => /^https?:\/\/\S+$/i.test(t));
  return text || null;
}

function getPlayerType(href) {
  try {
    const { pathname } = new URL(href);
    if (VIDEO_FILE.test(pathname)) return 'file';
  } catch (e) {
    return 'iframe';
  }
  return 'iframe';
}

function buildIframe(href, autoplay) {
  const url = new URL(href);
  if (autoplay && /\/play$/.test(url.pathname)) url.searchParams.set('autoplay', '1');
  const wrapper = document.createElement('div');
  wrapper.className = 'video-dynamic-media-frame';
  const iframe = document.createElement('iframe');
  iframe.src = url.href;
  iframe.title = 'Dynamic Media video player';
  iframe.loading = 'lazy';
  iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
  iframe.setAttribute('allowfullscreen', '');
  wrapper.append(iframe);
  return { wrapper, media: iframe, readyEvent: 'load' };
}

function buildVideo(href, autoplay, background) {
  const wrapper = document.createElement('div');
  wrapper.className = 'video-dynamic-media-frame';
  const video = document.createElement('video');
  video.setAttribute('playsinline', '');
  if (background) {
    video.muted = true;
    video.setAttribute('loop', '');
  } else {
    video.setAttribute('controls', '');
  }
  if (autoplay) video.setAttribute('autoplay', '');
  const source = document.createElement('source');
  source.src = href;
  const ext = new URL(href).pathname.split('.').pop().toLowerCase();
  source.type = ext === 'm3u8' ? 'application/x-mpegURL' : `video/${ext === 'mov' ? 'quicktime' : ext}`;
  video.append(source);
  wrapper.append(video);
  return { wrapper, media: video, readyEvent: 'canplay' };
}

function loadPlayer(block, href, autoplay) {
  if (block.dataset.embedLoaded === 'true' || block.querySelector('.video-dynamic-media-frame')) return;
  const background = block.classList.contains('background');
  const { wrapper, media, readyEvent } = getPlayerType(href) === 'file'
    ? buildVideo(href, autoplay, background)
    : buildIframe(href, autoplay);
  media.addEventListener(readyEvent, () => {
    block.dataset.embedLoaded = true;
  }, { once: true });
  block.append(wrapper);
}

export default function decorate(block) {
  const href = findVideoUrl(block);
  const placeholder = block.querySelector('picture');
  const caption = [...block.querySelectorAll('p, h1, h2, h3, h4, h5, h6')]
    .find((el) => !el.querySelector('a, picture') && el.textContent.trim());

  block.textContent = '';
  if (!href) {
    block.classList.add('video-dynamic-media-empty');
    return;
  }
  block.dataset.embedLoaded = false;
  const autoplay = block.classList.contains('autoplay') || block.classList.contains('background');

  let posterPicture = placeholder;
  if (placeholder) {
    const holder = document.createElement('div');
    holder.append(placeholder);
    holder.querySelectorAll('picture > img').forEach((img) => {
      const url = new URL(img.src, window.location.href);
      if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
      img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '1200' }]));
    });
    posterPicture = holder.querySelector('picture');
  }

  if (posterPicture && !autoplay) {
    block.classList.add('placeholder');
    const wrapper = document.createElement('div');
    wrapper.className = 'video-dynamic-media-placeholder';
    wrapper.append(posterPicture);
    wrapper.insertAdjacentHTML(
      'beforeend',
      '<div class="video-dynamic-media-placeholder-play"><button type="button" title="Play video" aria-label="Play video"></button></div>',
    );
    wrapper.addEventListener('click', () => {
      wrapper.remove();
      block.classList.remove('placeholder');
      loadPlayer(block, href, true);
    });
    block.append(wrapper);
  } else {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadPlayer(block, href, autoplay && !prefersReducedMotion.matches);
      }
    });
    observer.observe(block);
  }

  if (caption) {
    caption.classList.add('video-dynamic-media-caption');
    block.append(caption);
  }
}
