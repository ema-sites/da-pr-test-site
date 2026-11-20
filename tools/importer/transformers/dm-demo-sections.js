/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for aem-dynamicmedia-demo (WKND Travel) pages.
 *
 * beforeTransform: insert <hr> section breaks before every non-first section
 * (marking styled sections), while parser targets still exist.
 * afterTransform: add Section Metadata blocks for styled sections.
 */
const MARKER = 'data-excat-section-id';
const FIRST_MARKER = 'data-excat-section-first';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector, try next
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = payload && payload.template && payload.template.sections;
  if (!sections || sections.length < 2) return;
  const doc = element.ownerDocument || element;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionElement(element, section);
      if (!el) continue;
      if (i > 0) {
        const hr = doc.createElement('hr');
        if (section.style) hr.setAttribute(MARKER, section.id);
        el.before(hr);
      } else if (section.style) {
        const hr = doc.createElement('hr');
        hr.setAttribute(MARKER, section.id);
        hr.setAttribute(FIRST_MARKER, 'true');
        el.before(hr);
      }
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      if (section.style) {
        const metadata = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
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
