/* eslint-disable */
/* global WebImporter */

import carouselHeroParser from './parsers/carousel-hero.js';
import cardsTourParser from './parsers/cards-tour.js';
import hotspotVideoMapParser from './parsers/hotspot-video-map.js';
import embedDmVideoParser from './parsers/embed-dm-video.js';
import cardsCaptionOverlayParser from './parsers/cards-caption-overlay.js';
import cleanupTransformer from './transformers/aem-dynamicmedia-demo-cleanup.js';
import dmImagesTransformer from './transformers/aem-dynamicmedia-demo-dm-images.js';
import sectionsTransformer from './transformers/aem-dynamicmedia-demo-sections.js';

const PAGE_TEMPLATE = {
  "name": "travel-hospitality",
  "urls": [
    "https://aem-dynamicmedia-demo--dm--hlxsites.aem.page/travel-hospitality/wknd-trvl-home"
  ],
  "representativeUrl": "https://aem-dynamicmedia-demo--dm--hlxsites.aem.page/travel-hospitality/wknd-trvl-home",
  "description": "WKND Trvl travel & hospitality landing page showcasing Dynamic Media (carousel, tour cards, hotspot map, video, Open API image transformations)",
  "blocks": [
    {
      "name": "carousel-hero",
      "instances": [
        "div.carousel.summit-carousel",
        ".carousel-wrapper > div.carousel"
      ]
    },
    {
      "name": "cards-tour",
      "instances": [
        "div.cards.tours"
      ]
    },
    {
      "name": "hotspot-video-map",
      "instances": [
        ".hotspot-wrapper > div.hotspot"
      ]
    },
    {
      "name": "embed-dm-video",
      "instances": [
        "div.embed.dm-videoplayer",
        ".embed-wrapper > div.embed"
      ]
    },
    {
      "name": "cards-caption-overlay",
      "instances": [
        ".cards-wrapper > div.cards:not(.tours)"
      ]
    }
  ],
  "urlPattern": "/travel-hospitality/*",
  "sections": [
    {
      "id": "rc1",
      "name": "Hero image carousel",
      "selector": [
        "main > div.section.carousel-container > div.carousel-wrapper"
      ],
      "style": null,
      "blocks": [
        "carousel-hero"
      ],
      "defaultContent": []
    },
    {
      "id": "rc2",
      "name": "Brand logo image",
      "selector": [
        "main > div.section.carousel-container > div.dynamic-wrapper"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "main > div.section.carousel-container > div.dynamic-wrapper div.dynamic"
      ]
    },
    {
      "id": "rc3",
      "name": "Intro",
      "selector": [
        "main > div.section.carousel-container > div.default-content-wrapper"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "main > div.section.carousel-container > div.default-content-wrapper > h1",
        "main > div.section.carousel-container > div.default-content-wrapper > p"
      ]
    },
    {
      "id": "rc4",
      "name": "Tour reservation intro",
      "selector": [
        "main > div.section.highlight > div.default-content-wrapper:nth-of-type(1)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "main > div.section.highlight > div.default-content-wrapper:nth-of-type(1) > h2",
        "main > div.section.highlight > div.default-content-wrapper:nth-of-type(1) > p"
      ]
    },
    {
      "id": "rc5",
      "name": "Tour cards",
      "selector": [
        "main > div.section.highlight > div.cards-wrapper:nth-of-type(2)"
      ],
      "style": null,
      "blocks": [
        "cards-tour"
      ],
      "defaultContent": []
    },
    {
      "id": "rc6",
      "name": "Interactive map intro",
      "selector": [
        "main > div.section.highlight > div.default-content-wrapper:nth-of-type(3)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "main > div.section.highlight > div.default-content-wrapper:nth-of-type(3) > h2",
        "main > div.section.highlight > div.default-content-wrapper:nth-of-type(3) > p"
      ]
    },
    {
      "id": "rc7",
      "name": "Interactive hotspot map",
      "selector": [
        "main > div.section.highlight > div.hotspot-wrapper"
      ],
      "style": null,
      "blocks": [
        "hotspot-video-map"
      ],
      "defaultContent": []
    },
    {
      "id": "rc8",
      "name": "Video intro",
      "selector": [
        "main > div.section.highlight > div.default-content-wrapper:nth-of-type(5)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "main > div.section.highlight > div.default-content-wrapper:nth-of-type(5) > h2",
        "main > div.section.highlight > div.default-content-wrapper:nth-of-type(5) > p"
      ]
    },
    {
      "id": "rc9",
      "name": "Dynamic Media video",
      "selector": [
        "main > div.section.highlight > div.embed-wrapper"
      ],
      "style": null,
      "blocks": [
        "embed-dm-video"
      ],
      "defaultContent": []
    },
    {
      "id": "rc10",
      "name": "Open API intro",
      "selector": [
        "main > div.section.highlight > div.default-content-wrapper:nth-of-type(7)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "main > div.section.highlight > div.default-content-wrapper:nth-of-type(7) > h2",
        "main > div.section.highlight > div.default-content-wrapper:nth-of-type(7) > h3",
        "main > div.section.highlight > div.default-content-wrapper:nth-of-type(7) > p"
      ]
    },
    {
      "id": "rc11",
      "name": "Crop tiles",
      "selector": [
        "main > div.section.highlight > div.cards-wrapper:nth-of-type(8)"
      ],
      "style": null,
      "blocks": [
        "cards-caption-overlay"
      ],
      "defaultContent": []
    },
    {
      "id": "rc12",
      "name": "Smart crop",
      "selector": [
        "main > div.section.highlight > div.default-content-wrapper:nth-of-type(9)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "main > div.section.highlight > div.default-content-wrapper:nth-of-type(9) > h3",
        "main > div.section.highlight > div.default-content-wrapper:nth-of-type(9) > p"
      ]
    },
    {
      "id": "rc13",
      "name": "Color transformation tiles",
      "selector": [
        "main > div.section.highlight > div.cards-wrapper:nth-of-type(10)"
      ],
      "style": null,
      "blocks": [
        "cards-caption-overlay"
      ],
      "defaultContent": []
    },
    {
      "id": "rc14",
      "name": "Resizing and border",
      "selector": [
        "main > div.section.highlight > div.default-content-wrapper:nth-of-type(11)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "main > div.section.highlight > div.default-content-wrapper:nth-of-type(11) > h3",
        "main > div.section.highlight > div.default-content-wrapper:nth-of-type(11) > h4",
        "main > div.section.highlight > div.default-content-wrapper:nth-of-type(11) > p"
      ]
    },
    {
      "id": "rc15",
      "name": "Composite imaging tiles",
      "selector": [
        "main > div.section.highlight > div.cards-wrapper:nth-of-type(12)"
      ],
      "style": null,
      "blocks": [
        "cards-caption-overlay"
      ],
      "defaultContent": []
    }
  ]
};

const parsers = {
  'carousel-hero': carouselHeroParser,
  'cards-tour': cardsTourParser,
  'hotspot-video-map': hotspotVideoMapParser,
  'embed-dm-video': embedDmVideoParser,
  'cards-caption-overlay': cardsCaptionOverlayParser,
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
