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

  // tools/importer/parsers/carousel-hero.js
  function cloneImage(document, img) {
    if (!img) return null;
    const src = img.getAttribute("src");
    if (!src) return null;
    const out = document.createElement("img");
    out.setAttribute("src", src);
    out.setAttribute("alt", img.getAttribute("alt") || "");
    return out;
  }
  function contentNodes(cell) {
    if (!cell) return [];
    return [...cell.childNodes].filter((n) => n.nodeType === 1 || n.nodeType === 3 && n.textContent.trim());
  }
  function parse(element, { document }) {
    const cells = [];
    const slides = [...element.querySelectorAll("li.carousel-slide")];
    if (slides.length) {
      slides.forEach((slide) => {
        const img = cloneImage(document, slide.querySelector(".carousel-slide-image img") || slide.querySelector("img"));
        if (!img) return;
        const content = contentNodes(slide.querySelector(".carousel-slide-content"));
        cells.push([img, content.length ? content : ""]);
      });
    } else {
      [...element.querySelectorAll(":scope > div")].forEach((row) => {
        const cols = [...row.querySelectorAll(":scope > div")];
        const img = cloneImage(document, (cols[0] || row).querySelector("img"));
        if (!img) return;
        const content = contentNodes(cols[1]);
        cells.push([img, content.length ? content : ""]);
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-tour.js
  function cloneImage2(document, img) {
    if (!img) return null;
    const src = img.getAttribute("src");
    if (!src) return null;
    const out = document.createElement("img");
    out.setAttribute("src", src);
    out.setAttribute("alt", img.getAttribute("alt") || "");
    return out;
  }
  function buildBody(document, body) {
    const out = [];
    if (!body) return out;
    [...body.children].forEach((child) => {
      const link = child.matches("p.button-container") ? child.querySelector("a[href]") : null;
      if (link) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", link.getAttribute("href"));
        if (link.getAttribute("title")) a.setAttribute("title", link.getAttribute("title"));
        a.textContent = link.textContent.trim();
        p.append(a);
        out.push(p);
      } else if (child.textContent.trim() || child.querySelector("img, picture")) {
        out.push(child);
      }
    });
    return out;
  }
  function parse2(element, { document }) {
    const cells = [];
    const items = [...element.querySelectorAll(":scope > ul > li")];
    if (items.length) {
      items.forEach((li) => {
        const img = cloneImage2(
          document,
          li.querySelector(".cards-card-dynamic-image img, .cards-card-image img") || li.querySelector("img")
        );
        const body = buildBody(document, li.querySelector(".cards-card-body"));
        if (!img && !body.length) return;
        cells.push([img || "", body.length ? body : ""]);
      });
    } else {
      [...element.querySelectorAll(":scope > div")].forEach((row) => {
        const cols = [...row.querySelectorAll(":scope > div")];
        const img = cloneImage2(document, cols[0] && cols[0].querySelector("img"));
        const body = cols[1] ? [...cols[1].children] : [];
        if (!img && !body.length) return;
        cells.push([img || "", body.length ? body : ""]);
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-tour", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hotspot-video-map.js
  var KNOWN_POSITIONS = {
    "https://delivery-p166604-e1781313.adobeaemcloud.com/adobe/assets/urn:avid:aem:travel-hospitality-wknd-trvl-home-video3.mp4/play": ["38.5%", "39%"],
    "https://delivery-p166604-e1781313.adobeaemcloud.com/adobe/assets/urn:avid:aem:travel-hospitality-wknd-trvl-home-video1.mp4/play": ["56%", "19.5%"],
    "https://delivery-p166604-e1781313.adobeaemcloud.com/adobe/assets/urn:avid:aem:travel-hospitality-wknd-trvl-home-video5.mp4/play": ["69%", "20%"],
    "https://delivery-p166604-e1781313.adobeaemcloud.com/adobe/assets/urn:avid:aem:travel-hospitality-wknd-trvl-home-video4.mp4/play": ["71%", "29%"],
    "https://delivery-p166604-e1781313.adobeaemcloud.com/adobe/assets/urn:avid:aem:travel-hospitality-wknd-trvl-home-video2.mp4/play": ["58.2%", "65%"],
    "https://techsupport.scene7.com/s7viewers/html5/DimensionalViewer.html?asset=ajhcom/mountainbike-1&config=ajhcom/Dimensional&serverUrl=https://techsupport.scene7.com/is/image/&contenturl=https://techsupport.scene7.com/is/content/": ["28.4%", "75.3%"]
  };
  function cloneImage3(document, img) {
    if (!img) return null;
    const src = img.getAttribute("src");
    if (!src) return null;
    const out = document.createElement("img");
    out.setAttribute("src", src);
    out.setAttribute("alt", img.getAttribute("alt") || "");
    return out;
  }
  function makeLink(document, url) {
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.textContent = url;
    return a;
  }
  function isUrl(s) {
    return /^(https?:)?\/\//i.test((s || "").trim());
  }
  function styleValue(el, prop) {
    if (el.style && el.style[prop]) return el.style[prop].trim();
    const style = el.getAttribute("style") || "";
    const m = style.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, "i"));
    return m ? m[1].trim() : "";
  }
  function hotspotMediaUrl(hotspot) {
    const iframe = hotspot.querySelector("iframe[src]");
    if (iframe) return iframe.getAttribute("src").trim();
    const data = hotspot.getAttribute("data");
    if (isUrl(data)) return data.trim();
    const link = hotspot.querySelector("a[href]");
    if (link) return link.getAttribute("href").trim();
    const img = hotspot.querySelector("img[src]");
    if (img) return img.getAttribute("src").trim();
    const text = hotspot.textContent.trim();
    return isUrl(text) ? text : "";
  }
  function parse3(element, { document }) {
    const cells = [];
    const hotspots = [...element.querySelectorAll(":scope > div.hotspot")];
    if (hotspots.length) {
      const bgRow = [...element.querySelectorAll(":scope > div:not(.hotspot)")].find((d) => d.querySelector("img"));
      const bg = bgRow ? cloneImage3(document, bgRow.querySelector("img")) : null;
      if (bg) cells.push([bg]);
      hotspots.forEach((hotspot) => {
        const url = hotspotMediaUrl(hotspot);
        if (!url) {
          console.warn("[hotspot-video-map] hotspot without media URL skipped");
          return;
        }
        let left = styleValue(hotspot, "left");
        let top = styleValue(hotspot, "top");
        if ((!left || !top) && KNOWN_POSITIONS[url]) {
          [left, top] = [left || KNOWN_POSITIONS[url][0], top || KNOWN_POSITIONS[url][1]];
        }
        if (!left || !top) console.warn(`[hotspot-video-map] no position found for ${url}`);
        cells.push([makeLink(document, url), left || "", top || ""]);
      });
    } else {
      [...element.querySelectorAll(":scope > div")].forEach((row) => {
        const cols = [...row.querySelectorAll(":scope > div")];
        if (cols.length < 3) {
          const img = cloneImage3(document, row.querySelector("img"));
          if (img) cells.push([img]);
          return;
        }
        const link = cols[0].querySelector("a[href]");
        const url = link ? link.getAttribute("href").trim() : cols[0].textContent.trim();
        if (!url) return;
        cells.push([makeLink(document, url), cols[1].textContent.trim(), cols[2].textContent.trim()]);
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hotspot-video-map", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed-dm-video.js
  var PAGE_FALLBACKS = {
    "/travel-hospitality/wknd-trvl-home": "https://smartimaging.scene7.com/s7viewers/html5/SmartCropVideoViewer.html?asset=DynamicMediaNA/iceland_60second_femaleVOenglish-AVS&config=DynamicMediaNA/S%3C&serverUrl=https://smartimaging.scene7.com/is/image/&contenturl=https://smartimaging.scene7.com/is/content/&videoserverurl=https://smartimaging.scene7.com/is/content"
  };
  function findUrl(element) {
    const link = [...element.querySelectorAll("a[href]")].find((a) => /^https?:\/\//i.test(a.getAttribute("href").trim()));
    if (link) return link.getAttribute("href").trim();
    const iframe = [...element.querySelectorAll("iframe[src]")].find((f) => /^https?:\/\//i.test(f.getAttribute("src").trim()));
    if (iframe) return iframe.getAttribute("src").trim();
    const match = (element.textContent || "").match(/https?:\/\/\S+/i);
    return match ? match[0] : "";
  }
  function pagePath(document, params) {
    const candidates = [
      params && params.originalURL,
      document.querySelector('meta[property="og:url"]') && document.querySelector('meta[property="og:url"]').getAttribute("content"),
      document.querySelector('link[rel="canonical"]') && document.querySelector('link[rel="canonical"]').getAttribute("href")
    ];
    for (const c of candidates) {
      if (!c) continue;
      try {
        return new URL(c, "https://x/").pathname.replace(/\.(plain\.)?html$/, "").replace(/\/$/, "");
      } catch (e) {
      }
    }
    return "";
  }
  function parse4(element, { document, params }) {
    let url = findUrl(element);
    if (!url) {
      const path = pagePath(document, params);
      url = PAGE_FALLBACKS[path] || "";
      if (url) {
        console.warn(`[embed-dm-video] empty block on ${path}; using the viewer URL from the authored source page`);
      } else {
        console.warn(`[embed-dm-video] no viewer URL found in block (page: ${path || "unknown"}); block skipped`);
        element.remove();
        return;
      }
    }
    const content = [];
    const poster = element.querySelector("img[src]");
    if (poster) {
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

  // tools/importer/parsers/cards-caption-overlay.js
  function cloneImage4(document, img) {
    if (!img) return null;
    const src = img.getAttribute("src");
    if (!src) return null;
    const out = document.createElement("img");
    out.setAttribute("src", src);
    out.setAttribute("alt", img.getAttribute("alt") || "");
    return out;
  }
  function captionNodes(cell) {
    if (!cell) return [];
    const nodes = [...cell.childNodes].filter((n) => n.nodeType === 1 || n.nodeType === 3 && n.textContent.trim());
    if (nodes.length && nodes.every((n) => n.nodeType === 3)) {
      return [cell.textContent.trim()];
    }
    return nodes;
  }
  function parse5(element, { document }) {
    const cells = [];
    const items = [...element.querySelectorAll(":scope > ul > li")];
    if (items.length) {
      items.forEach((li) => {
        const img = cloneImage4(document, li.querySelector(".cards-card-image img") || li.querySelector("img"));
        const caption = captionNodes(li.querySelector(".cards-card-body"));
        if (!img && !caption.length) return;
        cells.push([img || "", caption.length ? caption : ""]);
      });
    } else {
      [...element.querySelectorAll(":scope > div")].forEach((row) => {
        const cols = [...row.querySelectorAll(":scope > div")];
        const img = cloneImage4(document, cols[0] && cols[0].querySelector("img"));
        const caption = captionNodes(cols[1]);
        if (!img && !caption.length) return;
        cells.push([img || "", caption.length ? caption : ""]);
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-caption-overlay", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/aem-dynamicmedia-demo-cleanup.js
  function isDmImageUrl(url) {
    if (typeof url !== "string") return false;
    const s = url.trim();
    if (!/^(https?:)?\/\//i.test(s)) return false;
    let u;
    try {
      u = new URL(s, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) return true;
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && /^\/adobe\/assets\/urn:[^/]+\/(original\/)?as\/[^/]+$/.test(u.pathname) && !/\.(mp4|m4v|mov|webm|m3u8|mpd)$/i.test(u.pathname)) return true;
    return false;
  }
  function makeImg(document, src, alt) {
    const img = document.createElement("img");
    img.setAttribute("src", src.trim());
    img.setAttribute("alt", alt || "");
    return img;
  }
  function normaliseDmCarriers(main, document) {
    main.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (!isDmImageUrl(href)) return;
      if (a.querySelector("img, picture")) return;
      const text = (a.textContent || "").trim();
      if (text && text !== href.trim() && !isDmImageUrl(text)) return;
      a.replaceWith(makeImg(document, href, ""));
    });
    main.querySelectorAll("div, p, span").forEach((el) => {
      if (el.children.length) return;
      const text = (el.textContent || "").trim();
      if (!text || /\s/.test(text) || !isDmImageUrl(text)) return;
      el.textContent = "";
      el.append(makeImg(document, text, ""));
    });
  }
  function unwrapDynamicLogo(main, document) {
    main.querySelectorAll("div.dynamic-wrapper > div.dynamic").forEach((block) => {
      const imgs = [...block.querySelectorAll("img")].filter((img) => img.getAttribute("src"));
      if (!imgs.length) return;
      const frag = document.createDocumentFragment();
      imgs.forEach((src) => {
        const img = makeImg(document, src.getAttribute("src"), src.getAttribute("alt") || "");
        const p = document.createElement("p");
        p.append(img);
        frag.append(p);
      });
      block.replaceWith(frag);
    });
  }
  function transform(hookName, element, payload) {
    const document = element.ownerDocument;
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        ".header-wrapper",
        ".footer-wrapper",
        "body > nav",
        "script",
        "style",
        "noscript",
        "link"
      ]);
      const main = element.querySelector("main") || element;
      normaliseDmCarriers(main, document);
      unwrapDynamicLogo(main, document);
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        ".carousel-navigation-buttons",
        ".carousel-slide-indicators",
        "button",
        "nav",
        "script",
        "style",
        "noscript",
        "link"
      ]);
      const attrs = [
        "data-block-status",
        "data-section-status",
        "data-block-name",
        "data-aue-resource",
        "data-aue-type",
        "data-aue-prop",
        "data-aue-label",
        "onclick"
      ];
      element.querySelectorAll("*").forEach((el) => {
        attrs.forEach((a) => el.removeAttribute(a));
        [...el.attributes].forEach((attr) => {
          if (/^data-(analytics|track|gtm)/i.test(attr.name)) el.removeAttribute(attr.name);
        });
      });
    }
  }

  // tools/importer/transformers/aem-dynamicmedia-demo-dm-images.js
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function isDmImageUrl2(url) {
    if (typeof url !== "string") return false;
    const s = url.trim();
    if (!/^(https?:)?\/\//i.test(s)) return false;
    let u;
    try {
      u = new URL(s, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) return true;
    return /^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && /^\/adobe\/assets\/urn:[^/]+\/(original\/)?as\/[^/]+$/.test(u.pathname) && !/\.(mp4|m4v|mov|webm|m3u8|mpd)$/i.test(u.pathname);
  }
  function normaliseUrl(src) {
    const s = src.trim();
    return s.startsWith("//") ? `https:${s}` : s;
  }
  function imageNode(img) {
    const picture = img.closest("picture");
    return picture && picture.querySelectorAll("img").length === 1 ? picture : img;
  }
  function isSoleContentOfLink(link, node) {
    const clone = link.cloneNode(true);
    const path = [];
    for (let n = node; n && n !== link; n = n.parentNode) {
      path.unshift([...n.parentNode.childNodes].indexOf(n));
    }
    let target = clone;
    path.forEach((idx) => {
      target = target.childNodes[idx];
    });
    if (target) target.remove();
    return !clone.textContent.trim() && !clone.querySelector("img, picture, video, iframe, svg");
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const document = element.ownerDocument;
    [...element.querySelectorAll("img")].forEach((img) => {
      const rawSrc = img.getAttribute("src") || "";
      if (!isDmImageUrl2(rawSrc)) return;
      const dmUrl = normaliseUrl(rawSrc);
      const alt = (img.getAttribute("alt") || "").trim();
      const node = imageNode(img);
      if (!node.parentNode) return;
      const link = node.parentElement && node.parentElement.closest("a");
      if (link) {
        if (!isSoleContentOfLink(link, node)) {
          console.warn(`[dm-images] skipped DM image inside mixed-content link: ${dmUrl}`);
          return;
        }
        link.setAttribute("title", dmUrl);
        link.textContent = alt || EMPTY_ALT_SENTINEL;
        return;
      }
      const a = document.createElement("a");
      a.setAttribute("href", dmUrl);
      if (alt) a.setAttribute("title", alt);
      a.textContent = dmUrl;
      node.replaceWith(a);
    });
  }

  // tools/importer/transformers/aem-dynamicmedia-demo-sections.js
  var MARKER = "data-excat-section-id";
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
  function transform3(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const document = element.ownerDocument;
    if (hookName === "beforeTransform") {
      const resolved = sections.map((section) => findSectionElement(element, section));
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = resolved[i];
        if (!el) continue;
        if (i === 0) {
          if (section.style) {
            const hr2 = document.createElement("hr");
            hr2.setAttribute(MARKER, section.id);
            el.before(hr2);
          }
          continue;
        }
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(MARKER, section.id);
        el.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        if (section.style) {
          const metadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          let anchor = null;
          if (marker) {
            let next = marker.nextElementSibling;
            let last = marker;
            while (next && next.tagName !== "HR") {
              last = next;
              next = next.nextElementSibling;
            }
            anchor = last;
          } else {
            anchor = findSectionElement(element, section);
          }
          if (anchor && anchor !== marker) anchor.after(metadata);
          else if (marker) marker.after(metadata);
        }
        if (marker) {
          if (i === 0) marker.remove();
          else marker.removeAttribute(MARKER);
        }
      }
    }
  }

  // tools/importer/import-travel-hospitality.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "carousel-hero": parse,
    "cards-tour": parse2,
    "hotspot-video-map": parse3,
    "embed-dm-video": parse4,
    "cards-caption-overlay": parse5
  };
  var sectionTransformers = [transform3];
  var fragmentTransformers = [];
  var lateTransformers = [...sectionTransformers, ...fragmentTransformers];
  var correctionTransformers = [];
  var transformers = [transform, transform2, ...lateTransformers, ...correctionTransformers];
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
