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
    let slides = [...element.querySelectorAll("li.carousel-slide")];
    if (!slides.length) slides = [...element.querySelectorAll(":scope > div")];
    slides.forEach((slide) => {
      const imageWrap = slide.querySelector(".carousel-slide-image") || slide.querySelector(":scope > div:first-child");
      const img = (imageWrap || slide).querySelector("img");
      const imageCell = [];
      if (img) {
        const picture = img.closest("picture");
        imageCell.push(picture || img);
      }
      if (!imageCell.length) return;
      const contentWrap = slide.querySelector(".carousel-slide-content") || slide.querySelector(":scope > div:nth-child(2)");
      const textCell = [];
      if (contentWrap) {
        [...contentWrap.children].forEach((child) => {
          if (child.textContent.trim() || child.querySelector("img, picture")) textCell.push(child);
        });
        if (!textCell.length && contentWrap.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = contentWrap.textContent.trim();
          textCell.push(p);
        }
      }
      cells.push([imageCell, textCell.length ? textCell : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-fullwidth", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-tour.js
  function parse2(element, { document }) {
    const cells = [];
    let items = [...element.querySelectorAll(":scope > ul > li")];
    if (!items.length) items = [...element.querySelectorAll("li")];
    items.forEach((item) => {
      const imageWrap = item.querySelector(".cards-card-dynamic-image, .cards-card-image");
      const img = (imageWrap || item).querySelector("img");
      const imageCell = [];
      if (img) imageCell.push(img.closest("picture") || img);
      const body = item.querySelector(".cards-card-body");
      const bodyCell = [];
      if (body) {
        [...body.children].forEach((child) => {
          if (!child.textContent.trim() && !child.querySelector("img")) return;
          const link = child.matches("p.button-container") ? child.querySelector("a") : null;
          if (link) {
            const p = document.createElement("p");
            const a = document.createElement("a");
            a.href = link.getAttribute("href");
            a.textContent = link.textContent.trim();
            p.append(a);
            bodyCell.push(p);
          } else {
            bodyCell.push(child);
          }
        });
      }
      if (!imageCell.length && !bodyCell.length) return;
      cells.push([imageCell.length ? imageCell : "", bodyCell.length ? bodyCell : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-tour", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hotspot.js
  function readStyleProp(el, prop) {
    const fromStyle = el.style && el.style[prop];
    if (fromStyle) return fromStyle.trim();
    const style = el.getAttribute("style") || "";
    const m = style.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, "i"));
    return m ? m[1].trim() : "";
  }
  function buildContentCell(document, content) {
    if (/^https?:\/\/\S+$/i.test(content)) {
      const a = document.createElement("a");
      a.href = content;
      a.textContent = content;
      return a;
    }
    const p = document.createElement("p");
    p.textContent = content;
    return p;
  }
  function parse3(element, { document }) {
    const cells = [];
    const bgRow = [...element.querySelectorAll(":scope > div:not(.hotspot)")].find((row) => row.querySelector("img"));
    if (bgRow) {
      const img = bgRow.querySelector("img");
      cells.push([img.closest("picture") || img]);
    }
    const decorated = [...element.querySelectorAll(":scope > div.hotspot")];
    if (decorated.length) {
      decorated.forEach((spot) => {
        let content = (spot.getAttribute("data") || "").trim();
        if (!content) {
          const frame = spot.querySelector("iframe[src]");
          const img = spot.querySelector("img[src]");
          if (frame) content = frame.getAttribute("src");
          else if (img) content = img.getAttribute("src");
          else content = spot.textContent.trim();
        }
        if (!content) return;
        const left = readStyleProp(spot, "left");
        const top = readStyleProp(spot, "top");
        cells.push([buildContentCell(document, content), left, top]);
      });
    } else {
      [...element.querySelectorAll(":scope > div")].forEach((row) => {
        if (row === bgRow) return;
        const cols = [...row.children];
        if (cols.length < 3) return;
        const link = cols[0].querySelector("a[href]");
        const content = link ? link.getAttribute("href") : cols[0].textContent.trim();
        if (!content) return;
        cells.push([
          buildContentCell(document, content),
          cols[1].textContent.trim(),
          cols[2].textContent.trim()
        ]);
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hotspot", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video-dynamic-media.js
  var KNOWN_VIDEO_URLS = {
    "/travel-hospitality/wknd-trvl-home": "https://smartimaging.scene7.com/s7viewers/html5/SmartCropVideoViewer.html?asset=DynamicMediaNA/iceland_60second_femaleVOenglish-AVS&config=DynamicMediaNA/S%3C&serverUrl=https://smartimaging.scene7.com/is/image/&contenturl=https://smartimaging.scene7.com/is/content/&videoserverurl=https://smartimaging.scene7.com/is/content"
  };
  var URL_RE = /^(https?:)?\/\/\S+$/i;
  function findUrlInAttributes(root) {
    const nodes = [root, ...root.querySelectorAll("*")];
    for (const node of nodes) {
      for (const attr of [...node.attributes]) {
        if (!/^data-/i.test(attr.name)) continue;
        const v = (attr.value || "").trim();
        if (URL_RE.test(v)) return v;
      }
    }
    return "";
  }
  function pagePath(document, params) {
    const candidates = [
      params && params.originalURL,
      document && document.documentURI,
      document && document.location && document.location.href
    ];
    for (const c of candidates) {
      if (!c || !/^https?:/i.test(c)) continue;
      try {
        const { hostname, pathname } = new URL(c);
        if (hostname === "localhost" || hostname === "127.0.0.1") continue;
        return pathname.replace(/\.(plain\.)?html$/, "").replace(/\/$/, "");
      } catch (e) {
      }
    }
    return "";
  }
  function parse4(element, { document, params }) {
    const iframe = element.querySelector("iframe[src]");
    const link = element.querySelector("a[href]");
    let videoUrl = iframe && iframe.getAttribute("src") || link && link.getAttribute("href") || findUrlInAttributes(element);
    if (!videoUrl) {
      const path = pagePath(document, params);
      const known = Object.keys(KNOWN_VIDEO_URLS);
      if (path && KNOWN_VIDEO_URLS[path]) videoUrl = KNOWN_VIDEO_URLS[path];
      else if (!path && known.length === 1) videoUrl = KNOWN_VIDEO_URLS[known[0]];
    }
    if (videoUrl && videoUrl.startsWith("//")) videoUrl = `https:${videoUrl}`;
    const content = [];
    const poster = element.querySelector("picture") || element.querySelector("img");
    if (poster) content.push(poster);
    if (videoUrl) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = videoUrl;
      a.textContent = videoUrl;
      p.append(a);
      content.push(p);
    }
    [...element.querySelectorAll("p")].forEach((p) => {
      const text = p.textContent.trim();
      if (!text || URL_RE.test(text) || p.querySelector("iframe")) return;
      content.push(p);
    });
    const cells = [[content.length ? content : ""]];
    const block = WebImporter.Blocks.createBlock(document, { name: "video-dynamic-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-caption.js
  function parse5(element, { document }) {
    const cells = [];
    let items = [...element.querySelectorAll(":scope > ul > li")];
    if (!items.length) items = [...element.querySelectorAll("li")];
    items.forEach((item) => {
      const imageWrap = item.querySelector(".cards-card-image");
      const img = (imageWrap || item).querySelector("img");
      const imageCell = [];
      if (img) imageCell.push(img.closest("picture") || img);
      const body = item.querySelector(".cards-card-body");
      const captionCell = [];
      if (body && body.textContent.trim()) {
        const blockChildren = [...body.children].filter((c) => /^(P|H[1-6]|UL|OL)$/.test(c.tagName));
        if (blockChildren.length) {
          captionCell.push(...blockChildren);
        } else {
          const p = document.createElement("p");
          p.append(...body.childNodes);
          captionCell.push(p);
        }
      }
      if (!imageCell.length && !captionCell.length) return;
      cells.push([imageCell.length ? imageCell : "", captionCell.length ? captionCell : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-caption", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-trvl-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        "header.header-wrapper",
        "div.header.block",
        "nav#nav",
        "footer.footer-wrapper",
        "div.footer.block"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "div.carousel .carousel-navigation-buttons",
        "div.carousel nav:has(ol.carousel-slide-indicators)",
        "div.carousel ol.carousel-slide-indicators"
      ]);
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "script",
        "style",
        "noscript",
        "link",
        "meta"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          const name = attr.name.toLowerCase();
          if (name.startsWith("on") || name.startsWith("data-analytics") || name.startsWith("data-track") || name === "data-block-status" || name === "data-section-status") {
            el.removeAttribute(attr.name);
          }
        });
      });
    }
  }

  // tools/importer/transformers/wknd-trvl-sections.js
  var MARKER_ATTR = "data-excat-section-id";
  function findSectionElement(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (let i = 0; i < selectors.length; i += 1) {
      const sel = selectors[i];
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
    const template = payload && payload.template;
    const sections = template && template.sections || [];
    if (sections.length < 2) return;
    const document = element.ownerDocument;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const sectionEl = findSectionElement(element, section);
        if (!sectionEl || !sectionEl.parentNode) continue;
        if (i > 0 || section.style) {
          const hr = document.createElement("hr");
          if (section.style) hr.setAttribute(MARKER_ATTR, section.id);
          if (i === 0) hr.setAttribute("data-excat-first-section", "true");
          sectionEl.parentNode.insertBefore(hr, sectionEl);
        }
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`hr[${MARKER_ATTR}="${section.id}"]`);
        const metadata = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        let anchor = null;
        if (marker) {
          let next = marker.nextElementSibling;
          while (next && next.tagName !== "HR") next = next.nextElementSibling;
          anchor = next;
          if (anchor) {
            anchor.parentNode.insertBefore(metadata, anchor);
          } else {
            marker.parentNode.appendChild(metadata);
          }
        } else {
          const sectionEl = findSectionElement(element, section);
          if (sectionEl && sectionEl.parentNode) {
            sectionEl.parentNode.insertBefore(metadata, sectionEl.nextSibling);
          }
        }
      }
      element.querySelectorAll(`hr[${MARKER_ATTR}]`).forEach((hr) => {
        if (hr.getAttribute("data-excat-first-section") === "true") {
          hr.remove();
        } else {
          hr.removeAttribute(MARKER_ATTR);
        }
      });
    }
  }

  // tools/importer/transformers/wknd-trvl-dm-images.js
  var PROJECT_TYPE = "da";
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
  function isDynamicMediaImageUrl(urlStr) {
    const family = detectDynamicMediaUrl(urlStr);
    if (family !== "dm-openapi") return family === "scene7";
    const { pathname } = new URL(urlStr, "https://x/");
    return /^\/adobe\/assets\/urn:[^/]+\/(original\/)?as\/[^/]+$/.test(pathname) && !/\.(mp4|m4v|mov|webm|m3u8|mpd)$/i.test(pathname);
  }
  function getImgSrc(img) {
    return img.getAttribute("src") || img.getAttribute("data-src") || "";
  }
  function imageNode(img) {
    const parent = img.parentElement;
    if (parent && parent.tagName === "PICTURE") return parent;
    return img;
  }
  function isSoleImageOfAnchor(anchor, img) {
    if (anchor.querySelectorAll("img").length !== 1) return false;
    return anchor.textContent.trim() === "";
  }
  function transform3(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const document = element.ownerDocument;
    [...element.querySelectorAll("img")].forEach((img) => {
      const dmUrl = getImgSrc(img);
      if (!isDynamicMediaImageUrl(dmUrl)) return;
      const alt = (img.getAttribute("alt") || "").trim();
      const node = imageNode(img);
      const link = img.closest("a");
      if (link) {
        if (!isSoleImageOfAnchor(link, img)) {
          console.warn(`[dm-images] Skipping DM image inside mixed-content link: ${dmUrl}`);
          return;
        }
        link.setAttribute("title", dmUrl);
        link.textContent = alt || EMPTY_ALT_SENTINEL;
        return;
      }
      const a = document.createElement("a");
      a.setAttribute("href", dmUrl);
      if (PROJECT_TYPE === "xwalk") {
        a.textContent = alt || EMPTY_ALT_SENTINEL;
      } else {
        if (alt) a.setAttribute("title", alt);
        a.textContent = dmUrl;
      }
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
  var parsers = {
    "carousel-fullwidth": parse,
    "cards-tour": parse2,
    hotspot: parse3,
    "video-dynamic-media": parse4,
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
