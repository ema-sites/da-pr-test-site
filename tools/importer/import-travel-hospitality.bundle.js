/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-travel-hospitality.js
  var import_travel_hospitality_exports = {};
  __export(import_travel_hospitality_exports, {
    default: () => import_travel_hospitality_default
  });

  // tools/importer/parsers/carousel-fullwidth.js
  function parse(element, { document }) {
    const cells = [];
    let slides = [...element.querySelectorAll(".carousel-slides > li.carousel-slide")];
    if (!slides.length) slides = [...element.querySelectorAll(":scope > div")];
    slides.forEach((slide) => {
      const srcImg = slide.querySelector(".carousel-slide-image img") || slide.querySelector("img");
      if (!srcImg || !srcImg.getAttribute("src")) return;
      const img = document.createElement("img");
      img.setAttribute("src", srcImg.getAttribute("src"));
      img.setAttribute("alt", srcImg.getAttribute("alt") || "");
      const content = slide.querySelector(".carousel-slide-content");
      const text = [];
      if (content && content.textContent.trim()) {
        text.push(...[...content.childNodes].filter((n) => n.nodeType === 1 || n.textContent.trim()));
      }
      cells.push([img, text.length ? text : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-fullwidth", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  function parse2(element, { document }) {
    const cells = [];
    element.querySelectorAll(":scope > ul > li").forEach((li) => {
      const srcImg = li.querySelector(".cards-card-dynamic-image img, .cards-card-image img");
      let imageCell = "";
      if (srcImg && srcImg.getAttribute("src")) {
        const img = document.createElement("img");
        img.setAttribute("src", srcImg.getAttribute("src"));
        img.setAttribute("alt", srcImg.getAttribute("alt") || "");
        imageCell = img;
      }
      const body = li.querySelector(".cards-card-body");
      const bodyContent = [];
      if (body) {
        [...body.children].forEach((child) => {
          if (!child.textContent.trim() && !child.querySelector("img")) return;
          child.removeAttribute("class");
          child.querySelectorAll("a").forEach((a) => a.removeAttribute("class"));
          bodyContent.push(child);
        });
      }
      if (!imageCell && !bodyContent.length) return;
      cells.push([imageCell, bodyContent.length ? bodyContent : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hotspot.js
  function plainHtmlCandidates(document, params) {
    const urls = [];
    const add = (base) => {
      try {
        const u = new URL(base);
        if (!/\.plain\.html$/.test(u.pathname)) {
          u.pathname = `${u.pathname.replace(/\/$/, "/index").replace(/\.html$/, "")}.plain.html`;
        }
        u.hash = "";
        if (!urls.includes(u.href)) urls.push(u.href);
      } catch (e) {
      }
    };
    try {
      if (document.location && /^https?:/.test(document.location.href)) add(document.location.href);
    } catch (e) {
    }
    if (params && params.originalURL) add(params.originalURL);
    return urls;
  }
  function fetchPlainBlock(document, params, selector) {
    const candidates = plainHtmlCandidates(document, params);
    for (let i = 0; i < candidates.length; i += 1) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", candidates[i], false);
        xhr.send(null);
        if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
          const doc = new DOMParser().parseFromString(xhr.responseText, "text/html");
          const found = doc.querySelector(selector);
          if (found) return found;
        }
      } catch (e) {
        console.warn(`[hotspot] could not load ${candidates[i]}: ${e.message}`);
      }
    }
    return null;
  }
  function dmVideoLabel(href) {
    const m = href.match(/\/adobe\/assets\/urn:[^:/]+:[^:/]+:([^/?#]+)\/play(?:[?#]|$)/);
    return m ? `Video: ${decodeURIComponent(m[1])}` : null;
  }
  function link(document, href) {
    const a = document.createElement("a");
    a.setAttribute("href", href);
    a.textContent = dmVideoLabel(href) || href;
    return a;
  }
  function parse3(element, { document, params }) {
    const cells = [];
    const bgImg = [...element.querySelectorAll(":scope > div:not(.hotspot) img")][0];
    let plainBlock = null;
    if (bgImg && bgImg.getAttribute("src")) {
      const img = document.createElement("img");
      img.setAttribute("src", bgImg.getAttribute("src"));
      img.setAttribute("alt", bgImg.getAttribute("alt") || "");
      cells.push([img]);
    } else {
      plainBlock = fetchPlainBlock(document, params, ".hotspot");
      const a = plainBlock && plainBlock.querySelector(":scope > div:first-child a[href]");
      if (a) cells.push([link(document, a.getAttribute("href"))]);
      else cells.push([""]);
    }
    const points = [...element.querySelectorAll(":scope > div.hotspot")];
    let plainRows = null;
    const getPlainRow = (idx) => {
      if (!plainRows) {
        if (!plainBlock) plainBlock = fetchPlainBlock(document, params, ".hotspot");
        plainRows = plainBlock ? [...plainBlock.querySelectorAll(":scope > div")].slice(1) : [];
      }
      return plainRows[idx];
    };
    points.forEach((point, idx) => {
      const frames = [...point.querySelectorAll("iframe[src]")].map((f) => f.getAttribute("src"));
      const media = frames.length ? frames : point.getAttribute("data") ? [point.getAttribute("data").trim()] : [];
      let left = point.style && point.style.left || "";
      let top = point.style && point.style.top || "";
      if (!left || !top) {
        const styleAttr = point.getAttribute("style") || "";
        const l = styleAttr.match(/left:\s*([\d.]+%)/);
        const t = styleAttr.match(/top:\s*([\d.]+%)/);
        if (l) left = l[1];
        if (t) top = t[1];
      }
      if (!left || !top) {
        const row = getPlainRow(idx);
        if (row) {
          const cols = [...row.querySelectorAll(":scope > div")];
          if (!left && cols[1]) left = cols[1].textContent.trim();
          if (!top && cols[2]) top = cols[2].textContent.trim();
          if (!media.length && cols[0]) {
            cols[0].querySelectorAll("a[href]").forEach((a) => media.push(a.getAttribute("href")));
          }
        }
      }
      if (!media.length) return;
      let mediaCell;
      if (media.length === 1) {
        mediaCell = link(document, media[0]);
      } else {
        mediaCell = document.createElement("ul");
        media.forEach((href) => {
          const li = document.createElement("li");
          li.append(link(document, href));
          mediaCell.append(li);
        });
      }
      if (!left || !top) console.warn(`[hotspot] missing position for point ${idx + 1}`);
      cells.push([mediaCell, left, top]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "hotspot", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed-dm-video.js
  function plainHtmlCandidates2(document, params) {
    const urls = [];
    const add = (base) => {
      try {
        const u = new URL(base);
        if (!/\.plain\.html$/.test(u.pathname)) {
          u.pathname = `${u.pathname.replace(/\/$/, "/index").replace(/\.html$/, "")}.plain.html`;
        }
        u.hash = "";
        if (!urls.includes(u.href)) urls.push(u.href);
      } catch (e) {
      }
    };
    try {
      if (document.location && /^https?:/.test(document.location.href)) add(document.location.href);
    } catch (e) {
    }
    if (params && params.originalURL) add(params.originalURL);
    return urls;
  }
  function urlFromPlainHtml(document, params) {
    const candidates = plainHtmlCandidates2(document, params);
    for (let i = 0; i < candidates.length; i += 1) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", candidates[i], false);
        xhr.send(null);
        if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
          const doc = new DOMParser().parseFromString(xhr.responseText, "text/html");
          const a = doc.querySelector(".embed.dm-videoplayer a[href]");
          if (a) return a.getAttribute("href").trim();
        }
      } catch (e) {
        console.warn(`[embed-dm-video] could not load ${candidates[i]}: ${e.message}`);
      }
    }
    return "";
  }
  function parse4(element, { document, params }) {
    let url = "";
    const iframe = element.querySelector("iframe[src]");
    const anchor = element.querySelector("a[href]");
    if (iframe) url = iframe.getAttribute("src").trim();
    else if (anchor) url = anchor.getAttribute("href").trim();
    if (!url) url = urlFromPlainHtml(document, params);
    if (!url) {
      console.warn("[embed-dm-video] no viewer URL found; block removed");
      element.remove();
      return;
    }
    const content = [];
    const poster = element.querySelector("picture img, img");
    if (poster && poster.getAttribute("src")) {
      const img = document.createElement("img");
      img.setAttribute("src", poster.getAttribute("src"));
      img.setAttribute("alt", poster.getAttribute("alt") || "");
      content.push(img);
    }
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.textContent = url;
    content.push(a);
    const cells = [[content]];
    const block = WebImporter.Blocks.createBlock(document, { name: "embed-dm-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-caption.js
  function parse5(element, { document }) {
    const cells = [];
    element.querySelectorAll(":scope > ul > li").forEach((li) => {
      const srcImg = li.querySelector(".cards-card-image img");
      let imageCell = "";
      if (srcImg && srcImg.getAttribute("src")) {
        const img = document.createElement("img");
        img.setAttribute("src", srcImg.getAttribute("src"));
        img.setAttribute("alt", srcImg.getAttribute("alt") || "");
        imageCell = img;
      }
      const body = li.querySelector(".cards-card-body");
      let captionCell = "";
      if (body && body.textContent.trim()) {
        const blocks = [...body.children].filter((c) => /^(P|H[1-6]|UL|OL)$/.test(c.tagName));
        if (blocks.length) {
          captionCell = blocks;
        } else {
          captionCell = document.createElement("p");
          captionCell.textContent = body.textContent.replace(/\s+/g, " ").trim();
        }
      }
      if (!imageCell && !captionCell) return;
      cells.push([imageCell, captionCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-caption", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/dm-demo-cleanup.js
  function transform(hookName, element, payload) {
    const doc = element.ownerDocument || element;
    if (hookName === "beforeTransform") {
      element.querySelectorAll("header, footer, .header-wrapper, .footer-wrapper").forEach((el) => el.remove());
      element.querySelectorAll('script, style, noscript, link[rel="stylesheet"]').forEach((el) => el.remove());
      element.querySelectorAll(".dynamic-wrapper > .dynamic.logo").forEach((block) => {
        const imgs = [...block.querySelectorAll("img")];
        if (!imgs.length) {
          block.remove();
          return;
        }
        const frag = doc.createDocumentFragment();
        imgs.forEach((img) => {
          img.classList.remove("dynamic-image");
          if (!img.classList.length) img.removeAttribute("class");
          const p = doc.createElement("p");
          p.append(img);
          frag.append(p);
        });
        block.replaceWith(frag);
      });
    }
    if (hookName === "afterTransform") {
      element.querySelectorAll("header, footer, nav#nav, .header-wrapper, .footer-wrapper").forEach((el) => el.remove());
      element.querySelectorAll("script, style, noscript, link").forEach((el) => el.remove());
      element.querySelectorAll("[data-block-name], [data-block-status], [data-section-status], [data-aue-resource], [data-aue-type]").forEach((el) => {
        ["data-block-name", "data-block-status", "data-section-status", "data-aue-resource", "data-aue-type"].forEach((a) => el.removeAttribute(a));
      });
    }
  }

  // tools/importer/transformers/dm-demo-sections.js
  var MARKER = "data-excat-section-id";
  var FIRST_MARKER = "data-excat-section-first";
  function findSectionElement(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;
    const doc = element.ownerDocument || element;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSectionElement(element, section);
        if (!el) continue;
        if (i > 0) {
          const hr = doc.createElement("hr");
          if (section.style) hr.setAttribute(MARKER, section.id);
          el.before(hr);
        } else if (section.style) {
          const hr = doc.createElement("hr");
          hr.setAttribute(MARKER, section.id);
          hr.setAttribute(FIRST_MARKER, "true");
          el.before(hr);
        }
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        if (section.style) {
          const metadata = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          const el = findSectionElement(element, section);
          if (el && el.parentNode) {
            el.after(metadata);
          } else if (marker) {
            marker.after(metadata);
          }
        }
        if (marker) {
          if (marker.hasAttribute(FIRST_MARKER)) {
            marker.remove();
          } else {
            marker.removeAttribute(MARKER);
          }
        }
      }
    }
  }

  // tools/importer/transformers/dm-demo-dm-images.js
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function detectDynamicMediaUrl(urlStr) {
    if (typeof urlStr !== "string") return false;
    if (!/^(https?:\/\/|\/\/)/i.test(urlStr)) return false;
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) return "scene7";
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  function transform3(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument || element;
    [...element.querySelectorAll("img")].forEach((img) => {
      let src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      if (src.startsWith("//")) src = `https:${src}`;
      const alt = (img.getAttribute("alt") || "").trim();
      const picture = img.closest("picture");
      const node = picture || img;
      const link2 = node.closest("a");
      if (link2) {
        const others = [...link2.querySelectorAll("img")].filter((i) => i !== img);
        if (others.length || link2.textContent.trim()) {
          console.warn(`[dm-images] skipping mixed-content anchor for ${src}`);
          return;
        }
        link2.setAttribute("title", src);
        link2.textContent = alt || EMPTY_ALT_SENTINEL;
        return;
      }
      const a = doc.createElement("a");
      a.setAttribute("href", src);
      if (alt) a.setAttribute("title", alt);
      a.textContent = src;
      node.replaceWith(a);
    });
  }

  // tools/importer/import-travel-hospitality.js
  var PAGE_TEMPLATE = {
    "name": "travel-hospitality",
    "urls": [
      "https://aem-dynamicmedia-demo--dm--hlxsites.aem.page/travel-hospitality/wknd-trvl-home"
    ],
    "representativeUrl": "https://aem-dynamicmedia-demo--dm--hlxsites.aem.page/travel-hospitality/wknd-trvl-home",
    "description": "WKND Travel Dynamic Media demo home page: carousel, promo cards, hotspot map, DM video, image transformation examples",
    "blocks": [
      {
        "name": "carousel-fullwidth",
        "instances": [
          ".carousel.summit-carousel",
          ".carousel-wrapper > .carousel"
        ]
      },
      {
        "name": "cards-promo",
        "instances": [
          ".cards.tours"
        ]
      },
      {
        "name": "hotspot",
        "instances": [
          ".hotspot.block",
          ".hotspot-wrapper > .hotspot"
        ]
      },
      {
        "name": "embed-dm-video",
        "instances": [
          ".embed.dm-videoplayer",
          ".embed-wrapper > .embed"
        ]
      },
      {
        "name": "cards-caption",
        "instances": [
          ".cards.block:not(.tours)",
          ".cards-wrapper > .cards:not(.tours)"
        ]
      }
    ],
    "urlPattern": "/travel-hospitality/*",
    "sections": [
      {
        "id": "rc1",
        "name": "Image carousel",
        "selector": [
          ".section.carousel-container > .carousel-wrapper",
          "body > main > div.section.carousel-container.dynamic-container > div.carousel-wrapper"
        ],
        "style": null,
        "blocks": [
          "carousel-fullwidth"
        ],
        "defaultContent": []
      },
      {
        "id": "rc2",
        "name": "Brand logo image",
        "selector": [
          ".section.carousel-container > .dynamic-wrapper",
          "body > main > div.section.carousel-container.dynamic-container > div.dynamic-wrapper"
        ],
        "style": "centered",
        "blocks": [],
        "defaultContent": [
          ".section.carousel-container > .dynamic-wrapper"
        ]
      },
      {
        "id": "rc3",
        "name": "Intro",
        "selector": [
          ".section.carousel-container > .default-content-wrapper",
          "body > main > div.section.carousel-container.dynamic-container > div.default-content-wrapper"
        ],
        "style": "centered",
        "blocks": [],
        "defaultContent": [
          ".section.carousel-container > .default-content-wrapper"
        ]
      },
      {
        "id": "rc4",
        "name": "Tour reservation intro",
        "selector": [
          ".section.highlight > div.default-content-wrapper:nth-of-type(1)",
          "body > main > div.section.highlight.cards-container.hotspot-container.embed-container > div.default-content-wrapper:nth-of-type(1)"
        ],
        "style": "centered",
        "blocks": [],
        "defaultContent": [
          ".section.highlight > div.default-content-wrapper:nth-of-type(1)"
        ]
      },
      {
        "id": "rc5",
        "name": "Tour and product cards",
        "selector": [
          ".section.highlight > div.cards-wrapper:nth-of-type(2)",
          "body > main > div.section.highlight.cards-container.hotspot-container.embed-container > div.cards-wrapper:nth-of-type(2)"
        ],
        "style": null,
        "blocks": [
          "cards-promo"
        ],
        "defaultContent": []
      },
      {
        "id": "rc6",
        "name": "Interactive map intro",
        "selector": [
          ".section.highlight > div.default-content-wrapper:nth-of-type(3)",
          "body > main > div.section.highlight.cards-container.hotspot-container.embed-container > div.default-content-wrapper:nth-of-type(3)"
        ],
        "style": "centered",
        "blocks": [],
        "defaultContent": [
          ".section.highlight > div.default-content-wrapper:nth-of-type(3)"
        ]
      },
      {
        "id": "rc7",
        "name": "Interactive hotspot map",
        "selector": [
          ".section.highlight > .hotspot-wrapper",
          "body > main > div.section.highlight.cards-container.hotspot-container.embed-container > div.hotspot-wrapper"
        ],
        "style": null,
        "blocks": [
          "hotspot"
        ],
        "defaultContent": []
      },
      {
        "id": "rc8",
        "name": "Video intro",
        "selector": [
          ".section.highlight > div.default-content-wrapper:nth-of-type(5)",
          "body > main > div.section.highlight.cards-container.hotspot-container.embed-container > div.default-content-wrapper:nth-of-type(5)"
        ],
        "style": "centered",
        "blocks": [],
        "defaultContent": [
          ".section.highlight > div.default-content-wrapper:nth-of-type(5)"
        ]
      },
      {
        "id": "rc9",
        "name": "Dynamic Media video player",
        "selector": [
          ".section.highlight > .embed-wrapper",
          "body > main > div.section.highlight.cards-container.hotspot-container.embed-container > div.embed-wrapper"
        ],
        "style": null,
        "blocks": [
          "embed-dm-video"
        ],
        "defaultContent": []
      },
      {
        "id": "rc10",
        "name": "Image transformations intro",
        "selector": [
          ".section.highlight > div.default-content-wrapper:nth-of-type(7)",
          "body > main > div.section.highlight.cards-container.hotspot-container.embed-container > div.default-content-wrapper:nth-of-type(7)"
        ],
        "style": "centered",
        "blocks": [],
        "defaultContent": [
          ".section.highlight > div.default-content-wrapper:nth-of-type(7)"
        ]
      },
      {
        "id": "rc11",
        "name": "Crop examples",
        "selector": [
          ".section.highlight > div.cards-wrapper:nth-of-type(8)",
          "body > main > div.section.highlight.cards-container.hotspot-container.embed-container > div.cards-wrapper:nth-of-type(8)"
        ],
        "style": null,
        "blocks": [
          "cards-caption"
        ],
        "defaultContent": []
      },
      {
        "id": "rc12",
        "name": "Smart crop examples",
        "selector": [
          ".section.highlight > div.default-content-wrapper:nth-of-type(9)",
          "body > main > div.section.highlight.cards-container.hotspot-container.embed-container > div.default-content-wrapper:nth-of-type(9)"
        ],
        "style": "centered",
        "blocks": [],
        "defaultContent": [
          ".section.highlight > div.default-content-wrapper:nth-of-type(9)"
        ]
      },
      {
        "id": "rc13",
        "name": "Color transformation examples",
        "selector": [
          ".section.highlight > div.cards-wrapper:nth-of-type(10)",
          "body > main > div.section.highlight.cards-container.hotspot-container.embed-container > div.cards-wrapper:nth-of-type(10)"
        ],
        "style": null,
        "blocks": [
          "cards-caption"
        ],
        "defaultContent": []
      },
      {
        "id": "rc14",
        "name": "Resizing, border and composite intro",
        "selector": [
          ".section.highlight > div.default-content-wrapper:nth-of-type(11)",
          "body > main > div.section.highlight.cards-container.hotspot-container.embed-container > div.default-content-wrapper:nth-of-type(11)"
        ],
        "style": "centered",
        "blocks": [],
        "defaultContent": [
          ".section.highlight > div.default-content-wrapper:nth-of-type(11)"
        ]
      },
      {
        "id": "rc15",
        "name": "Composite imaging examples",
        "selector": [
          ".section.highlight > div.cards-wrapper:nth-of-type(12)",
          "body > main > div.section.highlight.cards-container.hotspot-container.embed-container > div.cards-wrapper:nth-of-type(12)"
        ],
        "style": null,
        "blocks": [
          "cards-caption"
        ],
        "defaultContent": []
      }
    ]
  };
  var parsers = {
    "carousel-fullwidth": parse,
    "cards-promo": parse2,
    hotspot: parse3,
    "embed-dm-video": parse4,
    "cards-caption": parse5
  };
  var sectionTransformers = [transform2];
  var fragmentTransformers = [];
  var lateTransformers = [...sectionTransformers, ...fragmentTransformers];
  var correctionTransformers = [];
  var transformers = [transform, transform3, ...lateTransformers, ...correctionTransformers];
  var earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
  var CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));
  function executeTransformers(hookName, element, payload, list = transformers) {
    var _a, _b;
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: ((_b = (_a = payload.params) == null ? void 0 : _a.targets) == null ? void 0 : _b.template) || PAGE_TEMPLATE });
    list.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template, url) {
    const pageBlocks = [];
    const pageKey = (u) => {
      try {
        const { origin, pathname } = new URL(u);
        return `${origin}${pathname.replace(/\/$/, "")}`;
      } catch (e) {
        return u;
      }
    };
    const key = pageKey(url);
    const claim = (blockDef, selector) => {
      let matches = [];
      try {
        matches = document.querySelectorAll(selector);
      } catch (e) {
        return;
      }
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
  function markPageTargets(payload) {
    const { document, params } = payload;
    executeTransformers("beforeTransform", document.body, payload, earlyTransformers);
    const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
      element.setAttribute("data-excat-block", String(i));
      return { name, selector };
    });
    const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
      const target = (section.selector || []).map((s) => {
        try {
          return document.querySelector(s);
        } catch (e) {
          return null;
        }
      }).find(Boolean);
      if (!target) return section;
      target.setAttribute("data-excat-section", String(i));
      return __spreadProps(__spreadValues({}, section), { selector: [`[data-excat-section="${i}"]`] });
    });
    params.targets = { blocks, template: __spreadProps(__spreadValues({}, PAGE_TEMPLATE), { sections }) };
  }
  var import_travel_hospitality_default = {
    preprocess: (payload) => {
      if (CATALOG) markPageTargets(payload);
    },
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      params.fragments = [];
      if (!params.targets) markPageTargets(payload);
      const pageBlocks = params.targets.blocks.map((block, i) => __spreadProps(__spreadValues({}, block), { element: document.querySelector(`[data-excat-block="${i}"]`) })).filter((block) => block.element);
      executeTransformers("beforeTransform", main, __spreadProps(__spreadValues({}, payload), { pageBlocks }), lateTransformers);
      pageBlocks.forEach((block) => {
        if (!main.contains(block.element)) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      params.fragments.forEach(({ element }) => {
        executeTransformers("afterTransform", element, payload, earlyTransformers);
        WebImporter.rules.transformBackgroundImages(element, document);
        WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }, ...params.fragments];
    }
  };
  return __toCommonJS(import_travel_hospitality_exports);
})();
