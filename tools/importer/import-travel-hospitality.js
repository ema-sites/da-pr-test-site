/* eslint-disable */
/* global WebImporter */

import carouselFullwidthParser from './parsers/carousel-fullwidth.js';
import cardsTourParser from './parsers/cards-tour.js';
import hotspotParser from './parsers/hotspot.js';
import videoDynamicMediaParser from './parsers/video-dynamic-media.js';
import cardsCaptionParser from './parsers/cards-caption.js';
import cleanupTransformer from './transformers/wknd-trvl-cleanup.js';
import sectionsTransformer from './transformers/wknd-trvl-sections.js';
import dmImagesTransformer from './transformers/wknd-trvl-dm-images.js';

const PAGE_TEMPLATE = {
  "name": "travel-hospitality",
  "urls": [
    "https://aem-dynamicmedia-demo--dm--hlxsites.aem.page/travel-hospitality/wknd-trvl-home"
  ],
  "representativeUrl": "https://aem-dynamicmedia-demo--dm--hlxsites.aem.page/travel-hospitality/wknd-trvl-home",
  "description": "Travel & hospitality landing page showcasing Dynamic Media: hero carousel, tour cards, interactive hotspot map, video player and image-transformation demo cards",
  "blocks": [
    {
      "name": "carousel-fullwidth",
      "instances": [
        "div.carousel.block"
      ]
    },
    {
      "name": "cards-tour",
      "instances": [
        "div.cards.tours"
      ]
    },
    {
      "name": "hotspot",
      "instances": [
        "div.hotspot.block"
      ]
    },
    {
      "name": "video-dynamic-media",
      "instances": [
        "div.embed.dm-videoplayer",
        "div.embed-wrapper > div.embed:not(.embed-youtube):not(.embed-vimeo)"
      ]
    },
    {
      "name": "cards-caption",
      "instances": [
        "div.cards.block:not(.tours)"
      ]
    }
  ],
  "urlPattern": "/travel-hospitality/*",
  "sections": [
    {
      "id": "section-1",
      "name": "Hero carousel and intro",
      "selector": [
        "main > div.section.carousel-container",
        "main > div.section:nth-of-type(1)"
      ],
      "style": "centered",
      "blocks": [
        "carousel-fullwidth"
      ],
      "defaultContent": [
        "div.dynamic-wrapper",
        "div.carousel-container > div.default-content-wrapper"
      ]
    },
    {
      "id": "section-2",
      "name": "Dynamic Media showcase",
      "selector": [
        "main > div.section.highlight",
        "main > div.section.cards-container.hotspot-container"
      ],
      "style": "centered",
      "blocks": [
        "cards-tour",
        "hotspot",
        "video-dynamic-media",
        "cards-caption"
      ],
      "defaultContent": [
        "div.highlight > div.default-content-wrapper"
      ]
    }
  ]
};

const parsers = {
  'carousel-fullwidth': carouselFullwidthParser,
  'cards-tour': cardsTourParser,
  hotspot: hotspotParser,
  'video-dynamic-media': videoDynamicMediaParser,
  'cards-caption': cardsCaptionParser,
};
// Late transformers change the DOM (section <hr> markers, shared fragments), so their beforeTransform
// runs after block discovery.
const sectionTransformers = [sectionsTransformer];
const fragmentTransformers = [];
const lateTransformers = [...sectionTransformers, ...fragmentTransformers];
// Page corrections ({sitename}-page-corrections.js, when it exists) run last.
const correctionTransformers = [];
const transformers = [cleanupTransformer, dmImagesTransformer, ...lateTransformers, ...correctionTransformers];
const earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
// Catalog selectors (pageInstances, pageCleanup) count the <script> and <hr> elements the importer
// removes before transform, so a catalog template finds its targets in preprocess.
const CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));

function executeTransformers(hookName, element, payload, list = transformers) {
  const enhancedPayload = { ...payload, template: payload.params?.targets?.template || PAGE_TEMPLATE };
  list.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template, url) {
  const pageBlocks = [];
  const pageKey = (u) => {
    try { const { origin, pathname } = new URL(u); return `${origin}${pathname.replace(/\/$/, '')}`; }
    catch { return u; }
  };
  const key = pageKey(url);
  const claim = (blockDef, selector) => {
    let matches = [];
    try { matches = document.querySelectorAll(selector); } catch { return; }
    matches.forEach((element) => {
      if (pageBlocks.some((b) => b.element === element || b.element.contains(element) || element.contains(b.element))) return;
      pageBlocks.push({ name: blockDef.name, selector, element });
    });
  };
  template.blocks.forEach((blockDef) => {
    const entry = Object.entries(blockDef.pageInstances || {}).find(([u]) => pageKey(u) === key);
    (entry ? entry[1] : []).forEach((selector) => claim(blockDef, selector));
  });
  template.blocks.forEach((blockDef) => (blockDef.instances || []).forEach((selector) => claim(blockDef, selector)));
  return pageBlocks;
}

// Runs the early transformers, then marks each block and section target with an attribute: the
// importer re-creates the body before transform, so only attributes survive, not element references.
function markPageTargets(payload) {
  const { document, params } = payload;
  executeTransformers('beforeTransform', document.body, payload, earlyTransformers);
  const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
    element.setAttribute('data-excat-block', String(i));
    return { name, selector };
  });
  const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
    const target = (section.selector || []).map((s) => { try { return document.querySelector(s); } catch { return null; } }).find(Boolean);
    if (!target) return section;
    target.setAttribute('data-excat-section', String(i));
    return { ...section, selector: [`[data-excat-section="${i}"]`] };
  });
  params.targets = { blocks, template: { ...PAGE_TEMPLATE, sections } };
}

export default {
  preprocess: (payload) => {
    if (CATALOG) markPageTargets(payload);
  },
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    params.fragments = [];

    if (!params.targets) markPageTargets(payload);
    const pageBlocks = params.targets.blocks
      .map((block, i) => ({ ...block, element: document.querySelector(`[data-excat-block="${i}"]`) }))
      .filter((block) => block.element);
    executeTransformers('beforeTransform', main, { ...payload, pageBlocks }, lateTransformers);

    pageBlocks.forEach((block) => {
      if (!main.contains(block.element)) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // A fragment's nodes left `main` before afterTransform: finalize it the same way, without the
    // page-only section breaks and metadata.
    params.fragments.forEach(({ element }) => {
      executeTransformers('afterTransform', element, payload, earlyTransformers);
      WebImporter.rules.transformBackgroundImages(element, document);
      WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
    });

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }, ...params.fragments];
  },
};
