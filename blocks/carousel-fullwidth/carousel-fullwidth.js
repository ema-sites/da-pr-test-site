import { createOptimizedPicture } from '../../scripts/aem.js';

const LABELS = {
  roleDescription: 'Carousel',
  slideControls: 'Carousel Slide Controls',
  previousSlide: 'Previous Slide',
  nextSlide: 'Next Slide',
  showSlide: 'Show Slide',
  of: 'of',
};

const IMAGE_URL = /^https?:\/\/\S+$/i;

/**
 * Returns a <picture> for an image cell authored as a picture, an image link,
 * or a plain-text image URL. Link and text URLs are used exactly as authored
 * (Dynamic Media query parameters carry crops, overlays and text).
 */
function toPicture(cell, eager) {
  const existing = cell.querySelector('picture');
  if (existing) return existing;
  const link = cell.querySelector('a[href]');
  const url = link ? link.getAttribute('href').trim() : cell.textContent.trim();
  if (!IMAGE_URL.test(url)) return null;
  const picture = document.createElement('picture');
  const img = document.createElement('img');
  img.src = url;
  img.alt = link && link.title ? link.title : '';
  img.loading = eager ? 'eager' : 'lazy';
  picture.append(img);
  return picture;
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

  block.querySelectorAll('.carousel-fullwidth-slide-indicator button').forEach((button, idx) => {
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
  let realSlideIndex = Number.isNaN(slideIndex) ? 0 : slideIndex;
  if (realSlideIndex < 0) realSlideIndex = slides.length - 1;
  if (realSlideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-fullwidth-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  block.querySelectorAll('.carousel-fullwidth-slide-indicator button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const indicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(indicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(block, entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-fullwidth-slide').forEach((slide) => slideObserver.observe(slide));
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.id = `carousel-fullwidth-${carouselId}-slide-${slideIndex}`;
  slide.classList.add('carousel-fullwidth-slide');

  const [imageCell, ...contentCells] = [...row.querySelectorAll(':scope > div')];
  if (imageCell) {
    const picture = toPicture(imageCell, slideIndex === 0);
    if (picture) {
      const image = document.createElement('div');
      image.className = 'carousel-fullwidth-slide-image';
      image.append(picture);
      slide.append(image);
    } else {
      // Not an image: treat the first cell as slide content.
      contentCells.unshift(imageCell);
    }
  }

  contentCells.forEach((cell) => {
    // Image-only slides leave the content cell empty; drop it so no overlay box renders.
    if (!cell.textContent.trim() && !cell.querySelector('picture, img')) return;
    cell.classList.add('carousel-fullwidth-slide-content');
    slide.append(cell);
  });

  const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading && heading.id) slide.setAttribute('aria-labelledby', heading.id);

  return slide;
}

let carouselId = 0;
export default function decorate(block) {
  carouselId += 1;
  const id = carouselId;
  block.id = `carousel-fullwidth-${id}`;
  const rows = [...block.querySelectorAll(':scope > div')];
  const isSingleSlide = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', LABELS.roleDescription);

  const container = document.createElement('div');
  container.classList.add('carousel-fullwidth-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-fullwidth-slides');

  let slideIndicators;
  let indicatorsNav;
  if (!isSingleSlide) {
    indicatorsNav = document.createElement('nav');
    indicatorsNav.setAttribute('aria-label', LABELS.slideControls);
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-fullwidth-slide-indicators');
    indicatorsNav.append(slideIndicators);

    const navButtons = document.createElement('div');
    navButtons.classList.add('carousel-fullwidth-navigation-buttons');
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'slide-prev';
    prev.setAttribute('aria-label', LABELS.previousSlide);
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'slide-next';
    next.setAttribute('aria-label', LABELS.nextSlide);
    navButtons.append(prev, next);
    container.append(navButtons);
  }

  rows.forEach((row, idx) => {
    slidesWrapper.append(createSlide(row, idx, id));
    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-fullwidth-slide-indicator');
      indicator.dataset.targetSlide = idx;
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `${LABELS.showSlide} ${idx + 1} ${LABELS.of} ${rows.length}`);
      indicator.append(button);
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.replaceChildren(container);
  if (indicatorsNav) block.append(indicatorsNav);
  block.dataset.activeSlide = 0;

  optimizeImages(block);

  if (!isSingleSlide) bindEvents(block);
}
