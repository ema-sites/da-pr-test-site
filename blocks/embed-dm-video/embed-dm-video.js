/*
 * Embed DM Video
 * Embeds a Dynamic Media (Scene7) video viewer, e.g. SmartCropVideoViewer.html,
 * as a responsive 16:9 iframe. The viewer URL is used exactly as authored:
 * its query string (asset, config, serverUrl, ...) configures the player.
 */

function getEmbedUrl(block) {
  const link = block.querySelector('a[href]');
  const raw = (link ? link.getAttribute('href') : block.textContent).trim();
  try {
    const url = new URL(raw, window.location.href);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return { href: raw, hostname: url.hostname };
  } catch {
    return null;
  }
}

function loadEmbed(block, embedUrl, autoplay) {
  if (block.classList.contains('embed-dm-video-is-loaded')) return;
  const frameWrapper = document.createElement('div');
  frameWrapper.className = 'embed-dm-video-frame';
  const iframe = document.createElement('iframe');
  // Never append parameters: Scene7 viewers are configured entirely by the authored query string.
  iframe.src = embedUrl.href;
  if (!autoplay) iframe.loading = 'lazy';
  iframe.title = `Video from ${embedUrl.hostname}`;
  iframe.allowFullscreen = true;
  iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
  frameWrapper.append(iframe);
  block.replaceChildren(frameWrapper);
  block.classList.add('embed-dm-video-is-loaded');
}

export default function decorate(block) {
  const embedUrl = getEmbedUrl(block);
  if (!embedUrl) return; // nothing embeddable: leave the authored content as is

  const placeholder = block.querySelector('picture');
  block.textContent = '';

  if (placeholder) {
    const wrapper = document.createElement('div');
    wrapper.className = 'embed-dm-video-placeholder';
    const play = document.createElement('div');
    play.className = 'embed-dm-video-placeholder-play';
    const button = document.createElement('button');
    button.type = 'button';
    button.title = 'Play';
    button.setAttribute('aria-label', 'Play video');
    play.append(button);
    wrapper.append(placeholder, play);
    wrapper.addEventListener('click', () => loadEmbed(block, embedUrl, true));
    block.append(wrapper);
  } else {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadEmbed(block, embedUrl, false);
      }
    });
    observer.observe(block);
  }
}
