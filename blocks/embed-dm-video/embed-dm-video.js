/*
 * embed-dm-video: embeds a Dynamic Media / Scene7 viewer (e.g. SmartCropVideoViewer.html)
 * or a DM delivery /play URL in an iframe.
 * Single cell: the viewer URL (link or bare text), optionally preceded by a poster image.
 * The URL is used exactly as authored; its query string configures the viewer.
 */

function findUrl(block) {
  const links = [...block.querySelectorAll('a[href]')];
  const link = links.find((a) => /^https?:\/\//i.test(a.getAttribute('href')));
  if (link) return link.getAttribute('href');
  const match = block.textContent.match(/https?:\/\/\S+/i);
  return match ? match[0] : null;
}

function createIframe(url) {
  const wrapper = document.createElement('div');
  wrapper.className = 'embed-dm-video-frame';
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.title = 'Dynamic Media video player';
  iframe.setAttribute('allow', 'autoplay; fullscreen; encrypted-media; picture-in-picture');
  iframe.setAttribute('allowfullscreen', '');
  iframe.loading = 'lazy';
  wrapper.append(iframe);
  return wrapper;
}

export default function decorate(block) {
  const url = findUrl(block);
  const poster = block.querySelector('picture');
  block.replaceChildren();
  if (!url) return;

  if (poster) {
    const posterWrapper = document.createElement('div');
    posterWrapper.className = 'embed-dm-video-poster';
    posterWrapper.append(poster);
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'embed-dm-video-play';
    play.setAttribute('aria-label', 'Play video');
    posterWrapper.append(play);
    play.addEventListener('click', () => {
      posterWrapper.replaceWith(createIframe(url));
      block.classList.add('embed-dm-video-is-loaded');
    });
    block.append(posterWrapper);
    return;
  }

  const load = () => {
    if (block.classList.contains('embed-dm-video-is-loaded')) return;
    block.append(createIframe(url));
    block.classList.add('embed-dm-video-is-loaded');
  };

  if (!('IntersectionObserver' in window)) {
    load();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      load();
    }
  }, { rootMargin: '200px' });
  observer.observe(block);
}
