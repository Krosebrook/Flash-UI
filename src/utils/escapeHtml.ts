/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param str - The string to escape
 * @returns The escaped string safe for HTML insertion
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

/**
 * Unescapes HTML entities back to their original characters
 * @param str - The escaped string
 * @returns The unescaped string
 */
export function unescapeHtml(str: string): string {
  const htmlUnescapes: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };

  return str.replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => htmlUnescapes[entity]);
}
