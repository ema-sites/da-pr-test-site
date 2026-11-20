/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hotspot-video-map (source: decorated EDS `div.hotspot` block).
 *
 * Target table (blocks/hotspot-video-map/README.md):
 *   row 1  = background image (single cell)
 *   row 2+ = one per hotspot: media URL (link) | left % | top %
 *
 * Source (decorated, rendered by the source site's hotspot.js):
 *   div.hotspot.block
 *     > div (first row)            -> picture img (background)
 *     > div.hotspot[style="left: 38.5%; top: 39%"][data="<media URL>"]
 *         > div.hotspot-content ... iframe[src=<media URL>]   (video / viewer)
 *                               ... img[src]                  (image hotspot)
 * Fallback (undecorated authored markup): :scope > div rows with 1 or 3 cells.
 *
 * Positions come from the hotspot element's inline style (left/top). If the
 * captured DOM had its inline styles stripped, KNOWN_POSITIONS (copied from the
 * source page's authored table, wknd-trvl-home.plain.html) is used, keyed by the
 * media URL, so it only applies to the hotspots of this specific page.
 */

const KNOWN_POSITIONS = {
  'https://delivery-p166604-e1781313.adobeaemcloud.com/adobe/assets/urn:avid:aem:travel-hospitality-wknd-trvl-home-video3.mp4/play': ['38.5%', '39%'],
  'https://delivery-p166604-e1781313.adobeaemcloud.com/adobe/assets/urn:avid:aem:travel-hospitality-wknd-trvl-home-video1.mp4/play': ['56%', '19.5%'],
  'https://delivery-p166604-e1781313.adobeaemcloud.com/adobe/assets/urn:avid:aem:travel-hospitality-wknd-trvl-home-video5.mp4/play': ['69%', '20%'],
  'https://delivery-p166604-e1781313.adobeaemcloud.com/adobe/assets/urn:avid:aem:travel-hospitality-wknd-trvl-home-video4.mp4/play': ['71%', '29%'],
  'https://delivery-p166604-e1781313.adobeaemcloud.com/adobe/assets/urn:avid:aem:travel-hospitality-wknd-trvl-home-video2.mp4/play': ['58.2%', '65%'],
  'https://techsupport.scene7.com/s7viewers/html5/DimensionalViewer.html?asset=ajhcom/mountainbike-1&config=ajhcom/Dimensional&serverUrl=https://techsupport.scene7.com/is/image/&contenturl=https://techsupport.scene7.com/is/content/': ['28.4%', '75.3%'],
};

function cloneImage(document, img) {
  if (!img) return null;
  const src = img.getAttribute('src');
  if (!src) return null;
  const out = document.createElement('img');
  out.setAttribute('src', src);
  out.setAttribute('alt', img.getAttribute('alt') || '');
  return out;
}

function makeLink(document, url) {
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.textContent = url;
  return a;
}

function isUrl(s) {
  return /^(https?:)?\/\//i.test((s || '').trim());
}

/** Read a CSS length (e.g. "38.5%") for `prop` from the inline style attribute. */
function styleValue(el, prop) {
  if (el.style && el.style[prop]) return el.style[prop].trim();
  const style = el.getAttribute('style') || '';
  const m = style.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, 'i'));
  return m ? m[1].trim() : '';
}

function hotspotMediaUrl(hotspot) {
  const iframe = hotspot.querySelector('iframe[src]');
  if (iframe) return iframe.getAttribute('src').trim();
  const data = hotspot.getAttribute('data');
  if (isUrl(data)) return data.trim();
  const link = hotspot.querySelector('a[href]');
  if (link) return link.getAttribute('href').trim();
  const img = hotspot.querySelector('img[src]');
  if (img) return img.getAttribute('src').trim();
  const text = hotspot.textContent.trim();
  return isUrl(text) ? text : '';
}

export default function parse(element, { document }) {
  const cells = [];
  const hotspots = [...element.querySelectorAll(':scope > div.hotspot')];

  if (hotspots.length) {
    // Background image row: first direct child that is not a hotspot
    const bgRow = [...element.querySelectorAll(':scope > div:not(.hotspot)')].find((d) => d.querySelector('img'));
    const bg = bgRow ? cloneImage(document, bgRow.querySelector('img')) : null;
    if (bg) cells.push([bg]);

    hotspots.forEach((hotspot) => {
      const url = hotspotMediaUrl(hotspot);
      if (!url) {
        console.warn('[hotspot-video-map] hotspot without media URL skipped');
        return;
      }
      let left = styleValue(hotspot, 'left');
      let top = styleValue(hotspot, 'top');
      if ((!left || !top) && KNOWN_POSITIONS[url]) {
        [left, top] = [left || KNOWN_POSITIONS[url][0], top || KNOWN_POSITIONS[url][1]];
      }
      if (!left || !top) console.warn(`[hotspot-video-map] no position found for ${url}`);
      cells.push([makeLink(document, url), left || '', top || '']);
    });
  } else {
    // Undecorated block: row 1 image, then url | left | top rows
    [...element.querySelectorAll(':scope > div')].forEach((row) => {
      const cols = [...row.querySelectorAll(':scope > div')];
      if (cols.length < 3) {
        const img = cloneImage(document, row.querySelector('img'));
        if (img) cells.push([img]);
        return;
      }
      const link = cols[0].querySelector('a[href]');
      const url = link ? link.getAttribute('href').trim() : cols[0].textContent.trim();
      if (!url) return;
      cells.push([makeLink(document, url), cols[1].textContent.trim(), cols[2].textContent.trim()]);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hotspot-video-map', cells });
  element.replaceWith(block);
}
