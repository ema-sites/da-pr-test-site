/*
 * carousel-hero: full-width rotating image carousel.
 * One row per slide: [image] [optional text content].
 * Images may be authored as <picture>/<img>, a link to an image URL, or a bare URL.
 * Dynamic Media / Scene7 URLs are rendered as-is (query strings carry the effect).
 */

const AUTOPLAY_MS = 5000;
let carouselId = 0;

function isUrl(text) {
  return /^https?:\/\/\S+$/i.test((text || '').trim());
}

/** Return a <picture> for the cell's image, keeping the authored URL untouched. */
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

function showSlide(block, index, focus = false) {
  const slides = block.querySelectorAll('.carousel-hero-slide');
  if (!slides.length) return;
  const realIndex = (index + slides.length) % slides.length;
  block.dataset.activeSlide = realIndex;
  slides.forEach((slide, i) => {
    const active = i === realIndex;
    slide.setAttribute('aria-hidden', !active);
    slide.classList.toggle('active', active);
    slide.querySelectorAll('a').forEach((a) => {
      if (active) a.removeAttribute('tabindex');
      else a.setAttribute('tabindex', '-1');
    });
  });
  block.querySelectorAll('.carousel-hero-indicator button').forEach((btn, i) => {
    if (i === realIndex) btn.setAttribute('aria-current', 'true');
    else btn.removeAttribute('aria-current');
  });
  const container = block.querySelector('.carousel-hero-slides');
  container.scrollTo({
    left: slides[realIndex].offsetLeft,
    behavior: focus ? 'smooth' : 'auto',
  });
}

function bindEvents(block) {
  const current = () => parseInt(block.dataset.activeSlide || '0', 10);
  block.querySelector('.carousel-hero-prev')?.addEventListener('click', () => showSlide(block, current() - 1, true));
  block.querySelector('.carousel-hero-next')?.addEventListener('click', () => showSlide(block, current() + 1, true));
  block.querySelectorAll('.carousel-hero-indicator button').forEach((btn) => {
    btn.addEventListener('click', () => showSlide(block, parseInt(btn.dataset.targetSlide, 10), true));
  });

  let timer;
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stop();
    timer = setInterval(() => showSlide(block, current() + 1, true), AUTOPLAY_MS);
  };
  block.addEventListener('mouseenter', stop);
  block.addEventListener('mouseleave', start);
  block.addEventListener('focusin', stop);
  block.addEventListener('focusout', start);
  start();
}

export default function decorate(block) {
  carouselId += 1;
  const id = `carousel-hero-${carouselId}`;
  block.id = id;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const rows = [...block.children];
  const slidesWrapper = document.createElement('ul');
  slidesWrapper.className = 'carousel-hero-slides';

  rows.forEach((row) => {
    const cells = [...row.children];
    const picture = resolveImage(cells[0]);
    if (!picture) return;
    const li = document.createElement('li');
    li.className = 'carousel-hero-slide';
    li.id = `${id}-slide-${slidesWrapper.children.length}`;

    const imageDiv = document.createElement('div');
    imageDiv.className = 'carousel-hero-slide-image';
    imageDiv.append(picture);
    li.append(imageDiv);

    const textCell = cells[1];
    if (textCell && textCell.textContent.trim()) {
      const content = document.createElement('div');
      content.className = 'carousel-hero-slide-content';
      content.append(...textCell.childNodes);
      li.append(content);
      const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading?.id) li.setAttribute('aria-labelledby', heading.id);
    }
    slidesWrapper.append(li);
  });

  // first slide is likely LCP
  const firstImg = slidesWrapper.querySelector('img');
  if (firstImg) {
    firstImg.loading = 'eager';
    firstImg.setAttribute('fetchpriority', 'high');
  }

  block.replaceChildren();
  const container = document.createElement('div');
  container.className = 'carousel-hero-slides-container';
  container.append(slidesWrapper);
  block.append(container);

  const slideCount = slidesWrapper.children.length;
  if (slideCount > 1) {
    const nav = document.createElement('div');
    nav.className = 'carousel-hero-navigation';
    nav.innerHTML = `
      <button type="button" class="carousel-hero-prev" aria-label="Previous slide"></button>
      <button type="button" class="carousel-hero-next" aria-label="Next slide"></button>`;
    container.append(nav);

    const indicators = document.createElement('ol');
    indicators.className = 'carousel-hero-indicators';
    for (let i = 0; i < slideCount; i += 1) {
      const li = document.createElement('li');
      li.className = 'carousel-hero-indicator';
      li.innerHTML = `<button type="button" data-target-slide="${i}" aria-label="Show slide ${i + 1} of ${slideCount}"></button>`;
      indicators.append(li);
    }
    const indicatorNav = document.createElement('nav');
    indicatorNav.setAttribute('aria-label', 'Carousel slide controls');
    indicatorNav.append(indicators);
    block.append(indicatorNav);
  }

  showSlide(block, 0);
  if (slideCount > 1) bindEvents(block);
}
