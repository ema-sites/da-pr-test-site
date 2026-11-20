/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for aem-dynamicmedia-demo (WKND Travel) pages.
 *
 * The source is itself a decorated EDS page: header/footer blocks, .section
 * wrappers, and block runtime chrome. Only non-authorable chrome is removed.
 */
export default function transform(hookName, element, payload) {
  const doc = element.ownerDocument || element;

  if (hookName === 'beforeTransform') {
    // Site chrome: header (incl. nav) and footer blocks.
    element.querySelectorAll('header, footer, .header-wrapper, .footer-wrapper').forEach((el) => el.remove());

    // Non-content nodes.
    element.querySelectorAll('script, style, noscript, link[rel="stylesheet"]').forEach((el) => el.remove());

    // The brand logo (section rc2) is wrapped in a source "dynamic logo" block.
    // Import it as plain default-content image: replace the block wrapper with
    // a paragraph holding the image, keeping .dynamic-wrapper so the section
    // selector still resolves.
    element.querySelectorAll('.dynamic-wrapper > .dynamic.logo').forEach((block) => {
      const imgs = [...block.querySelectorAll('img')];
      if (!imgs.length) {
        block.remove();
        return;
      }
      const frag = doc.createDocumentFragment();
      imgs.forEach((img) => {
        img.classList.remove('dynamic-image');
        if (!img.classList.length) img.removeAttribute('class');
        const p = doc.createElement('p');
        p.append(img);
        frag.append(p);
      });
      block.replaceWith(frag);
    });
  }

  if (hookName === 'afterTransform') {
    // Safety net for chrome that survived.
    element.querySelectorAll('header, footer, nav#nav, .header-wrapper, .footer-wrapper').forEach((el) => el.remove());
    element.querySelectorAll('script, style, noscript, link').forEach((el) => el.remove());

    // EDS runtime / tracking attributes from the decorated source DOM.
    element.querySelectorAll('[data-block-name], [data-block-status], [data-section-status], [data-aue-resource], [data-aue-type]').forEach((el) => {
      ['data-block-name', 'data-block-status', 'data-section-status', 'data-aue-resource', 'data-aue-type'].forEach((a) => el.removeAttribute(a));
    });
  }
}
