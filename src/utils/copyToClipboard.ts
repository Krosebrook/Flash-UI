/**
 * Result of a clipboard copy operation
 */
export interface CopyResult {
  success: boolean;
  error?: string;
}

/**
 * Copies text to the clipboard using the modern Clipboard API
 * Falls back to execCommand for older browsers
 * @param text - The text to copy to clipboard
 * @returns Promise resolving to the copy result
 */
export async function copyToClipboard(text: string): Promise<CopyResult> {
  // Try modern Clipboard API first
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (err) {
      // Fall through to fallback
    }
  }

  // Fallback for older browsers
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Prevent scrolling to bottom of page
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (successful) {
      return { success: true };
    }
    return { success: false, error: 'execCommand copy failed' };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    };
  }
}
