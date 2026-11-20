/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for aem-dynamicmedia-demo (template: travel-hospitality).
 *
 * Uses payload.template.sections. Each section's selector list is tried in
 * order. beforeTransform inserts <hr> section breaks (while parser targets
 * still exist); afterTransform adds Section Metadata for styled sections.
 * On this template every section has `style: null`, so only breaks are added,
 * but styled sections are supported for future template edits.
 */

const MARKER = 'data-excat-section-id';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector, try the next one
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;
  const document = element.ownerDocument;

  if (hookName === 'beforeTransform') {
    // Resolve every section element before mutating, so positional
    // (:nth-of-type) selectors are evaluated against the untouched DOM.
    const resolved = sections.map((section) => findSectionElement(element, section));

    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = resolved[i];
      if (!el) continue;

      if (i === 0) {
        // A styled first section needs a temporary marker (removed in afterTransform).
        if (section.style) {
          const hr = document.createElement('hr');
          hr.setAttribute(MARKER, section.id);
          el.before(hr);
        }
        continue;
      }

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(MARKER, section.id);
      el.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);

      if (section.style) {
        const metadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });

        // Section Metadata goes at the end of the section: before the next
        // section break, or after the surviving section element.
        let anchor = null;
        if (marker) {
          let next = marker.nextElementSibling;
          let last = marker;
          while (next && next.tagName !== 'HR') {
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
