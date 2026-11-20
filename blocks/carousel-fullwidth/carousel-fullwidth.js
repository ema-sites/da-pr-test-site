import { createOptimizedPicture } from '../../scripts/aem.js';

const IMAGE_EXT = /\.(avif|gif|jpe?g|png|webp|svg)$/i;

/**
 * Authors sometimes paste an image URL (link or plain text) instead of an image.
 * Turn such a cell into a <picture> so the slide always has an image.
 */
function ensurePicture(cell) {
  if (!cell || cell.querySelector('picture, img')) return;
  const link = cell.querySelector('a');
  const href = (link ? link.href : cell.textContent).trim();
  if (!/^https?:\/\//i.test(href)) return;
  let url;
  try {
    url = new URL(href);
  } catch (e) {
    return;
  }
  const looksLikeImage = IMAGE_EXT.test(url.pathname) || /\/is\/image\//.test(url.pathname);
  if (!looksLikeImage) return;
  const picture = document.createElement('picture');
  const img = document.createElement('img');
  img.src = href;
  img.alt = '';
  img.loading = 'lazy';
  picture.append(img);
  cell.replaceChildren(picture);
}

function optimizeImages(block) {
  block.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '2000' }]));
  });
}

function updateActiveSlide(block, slide) {
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  block.querySelectorAll('.carousel-fullwidth-slide').forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) link.setAttribute('tabindex', '-1');
      else link.removeAttribute('tabindex');
    });
  });

  block.querySelectorAll('.carousel-fullwidth-slide-indicator').forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    if (idx !== slideIndex) {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    } else {
      button.setAttribute('disabled', true);
      button.setAttribute('aria-current', true);
    }
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-fullwidth-slide');
  if (!slides.length) return;
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-fullwidth-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const indicators = block.querySelector('.carousel-fullwidth-slide-indicators');
  if (!indicators) return;

  indicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const indicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(indicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide || 0, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide || 0, 10) + 1);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(block, entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-fullwidth-slide').forEach((slide) => observer.observe(slide));
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.id = `carousel-fullwidth-${carouselId}-slide-${slideIndex}`;
  slide.classList.add('carousel-fullwidth-slide');

  const cells = [...row.querySelectorAll(':scope > div')];
  // image cell: first cell holding a picture (or an image URL), else the first cell
  cells.forEach(ensurePicture);
  const imageCell = cells.find((c) => c.querySelector('picture')) || cells[0];

  cells.forEach((cell) => {
    if (cell === imageCell) {
      cell.classList.add('carousel-fullwidth-slide-image');
      slide.append(cell);
    } else if (cell.textContent.trim() || cell.querySelector('img, a')) {
      cell.classList.add('carousel-fullwidth-slide-content');
      slide.append(cell);
    }
  });

  if (!slide.querySelector('.carousel-fullwidth-slide-content')) {
    slide.classList.add('carousel-fullwidth-slide-image-only');
  }

  const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading && heading.id) slide.setAttribute('aria-labelledby', heading.id);

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.id = `carousel-fullwidth-${carouselId}`;
  const rows = [...block.querySelectorAll(':scope > div')]
    .filter((row) => row.textContent.trim() || row.querySelector('img, picture, a'));
  const isSingleSlide = rows.length < 2;

  // this project's aem.js has no fetchPlaceholders; labels are static (localize here if needed)
  const placeholders = {};

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carouselLabel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-fullwidth-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-fullwidth-slides');

  let indicators;
  let indicatorsNav;
  if (!isSingleSlide) {
    indicatorsNav = document.createElement('nav');
    indicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    indicators = document.createElement('ol');
    indicators.classList.add('carousel-fullwidth-slide-indicators');
    indicatorsNav.append(indicators);

    const navButtons = document.createElement('div');
    navButtons.classList.add('carousel-fullwidth-navigation-buttons');
    navButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;
    container.append(navButtons);
  }

  rows.forEach((row, idx) => {
    slidesWrapper.append(createSlide(row, idx, carouselId));
    if (indicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-fullwidth-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
      indicators.append(indicator);
    }
  });

  container.append(slidesWrapper);
  block.replaceChildren(container);
  if (indicatorsNav) block.append(indicatorsNav);

  optimizeImages(block);

  if (!isSingleSlide) bindEvents(block);
}
