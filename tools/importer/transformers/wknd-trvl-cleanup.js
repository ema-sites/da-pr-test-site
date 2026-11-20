/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for the WKND Travel (aem-dynamicmedia-demo) EDS site.
 *
 * Source is itself an Edge Delivery site, so the header/footer blocks are
 * rendered into the page and the carousel decorator adds UI chrome
 * (prev/next buttons, slide indicators) that is not authorable.
 * Selectors are taken from migration-work/cleaned.html.
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Site chrome rendered by the source EDS header/footer blocks.
    WebImporter.DOMUtils.remove(element, [
      'header.header-wrapper',
      'div.header.block',
      'nav#nav',
      'footer.footer-wrapper',
      'div.footer.block',
    ]);

    // Carousel decorator UI (buttons + "Show Slide N of M" indicators);
    // removed before parsing so it cannot leak into block cells.
    WebImporter.DOMUtils.remove(element, [
      'div.carousel .carousel-navigation-buttons',
      'div.carousel nav:has(ol.carousel-slide-indicators)',
      'div.carousel ol.carousel-slide-indicators',
    ]);
  }

  if (hookName === 'afterTransform') {
    // Non-authorable leftovers. Do NOT remove HTML comments here.
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'script',
      'style',
      'noscript',
      'link',
      'meta',
    ]);

    // Strip tracking / runtime attributes.
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (
          name.startsWith('on')
          || name.startsWith('data-analytics')
          || name.startsWith('data-track')
          || name === 'data-block-status'
          || name === 'data-section-status'
        ) {
          el.removeAttribute(attr.name);
        }
      });
    });
  }
}
