/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for the WKND Travel template(s).
 *
 * beforeTransform: insert <hr> section breaks (while parser targets still
 * exist) and mark styled sections with a temporary data-excat-section-id.
 * afterTransform: add Section Metadata blocks after each marker and drop the
 * temporary marker/first-section <hr>.
 */

const MARKER_ATTR = 'data-excat-section-id';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (let i = 0; i < selectors.length; i += 1) {
    const sel = selectors[i];
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector in this DOM implementation, try the next one
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const template = payload && payload.template;
  const sections = (template && template.sections) || [];
  if (sections.length < 2) return;

  const document = element.ownerDocument;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = findSectionElement(element, section);
      if (!sectionEl || !sectionEl.parentNode) continue;

      if (i > 0 || section.style) {
        const hr = document.createElement('hr');
        if (section.style) hr.setAttribute(MARKER_ATTR, section.id);
        if (i === 0) hr.setAttribute('data-excat-first-section', 'true');
        sectionEl.parentNode.insertBefore(hr, sectionEl);
      }
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`hr[${MARKER_ATTR}="${section.id}"]`);
      const metadata = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });

      // Section Metadata belongs at the end of the section: just before the
      // next section break, or at the end of the container.
      let anchor = null;
      if (marker) {
        let next = marker.nextElementSibling;
        while (next && next.tagName !== 'HR') next = next.nextElementSibling;
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
      if (hr.getAttribute('data-excat-first-section') === 'true') {
        hr.remove();
      } else {
        hr.removeAttribute(MARKER_ATTR);
      }
    });
  }
}
