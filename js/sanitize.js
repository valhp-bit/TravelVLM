/**
 * TravelVLM v3.0 — Sanitization Utility (Global Safe)
 * Centralized XSS protection: uses DOMPurify if available, falls back to escapeHtml.
 * All pages should use sanitize() instead of direct DOMPurify.sanitize() calls.
 */

/**
 * Escapes HTML special characters to prevent XSS.
 * @param {string} str - Input string to escape.
 * @returns {string} - Escaped HTML-safe string.
 */
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"'`]/g, function (s) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '`': '&#96;'
    }[s];
  });
}

/**
 * Sanitizes user input for safe HTML rendering.
 * Prioritizes local DOMPurify if available, falls back to escapeHtml.
 * @param {string} str - Input string to sanitize.
 * @param {Object} config - Optional DOMPurify config (if DOMPurify present).
 * @returns {string} - Sanitized HTML-safe string.
 */
function sanitize(str, config = {}) {
  if (!str) return '';
  
  // Try using DOMPurify if present
  try {
    if (window.DOMPurify && typeof DOMPurify.sanitize === 'function') {
      const defaultConfig = {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'title', 'target'],
        KEEP_CONTENT: true,
        ...config
      };
      return DOMPurify.sanitize(str, defaultConfig);
    }
  } catch (e) {
    console.warn('DOMPurify error, falling back to escapeHtml:', e);
  }
  
  // Fallback: escape all HTML
  return escapeHtml(str);
}

/**
 * Creates a safe text node (preferred over innerHTML for user content).
 * @param {string} text - Text content.
 * @returns {Text} - Safe text node.
 */
function createSafeTextNode(text) {
  return document.createTextNode(text || '');
}

/**
 * Safely sets element's text content (prevents XSS).
 * @param {Element} element - Target element.
 * @param {string} text - Text to set.
 */
function setSafeText(element, text) {
  if (!element) return;
  element.textContent = text || '';
}

/**
 * Safely sets element's HTML (sanitized).
 * @param {Element} element - Target element.
 * @param {string} html - HTML to set (will be sanitized).
 */
function setSafeHTML(element, html) {
  if (!element) return;
  const safe = sanitize(html);
  element.innerHTML = safe;
}

// Expose to window for global use
if (typeof window !== 'undefined') {
  window.escapeHtml = escapeHtml;
  window.sanitize = sanitize;
  window.createSafeTextNode = createSafeTextNode;
  window.setSafeText = setSafeText;
  window.setSafeHTML = setSafeHTML;
}
