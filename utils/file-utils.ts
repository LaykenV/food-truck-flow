/**
 * Creates a local object URL for file preview
 * @param file The file to create a preview URL for
 * @returns The object URL for the file
 */
export function createFilePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revokes a previously created object URL to prevent memory leaks
 * @param url The object URL to revoke
 */
export function revokeFilePreview(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Handles cleanup of multiple preview URLs
 * @param urls Array of URLs to revoke
 */
export function revokeAllPreviews(urls: string[]): void {
  urls.forEach(url => {
    // Only revoke if the URL is an object URL (starts with blob:)
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
}

/**
 * Checks if a URL is a blob URL (local preview)
 * @param url The URL to check
 * @returns True if the URL is a blob URL
 */
export function isBlobUrl(url: string): boolean {
  return typeof url === 'string' && url.startsWith('blob:');
}

/**
 * Converts a base64 string to a Blob object
 * @param base64 The base64 string
 * @param contentType The content type of the resulting Blob (e.g., 'image/png')
 * @returns A Blob object
 */
export function base64ToBlob(base64: string, contentType: string = 'image/png'): Blob {
  // Check if running in a browser environment where atob is available
  if (typeof atob === 'undefined') {
    console.error("base64ToBlob can only be run in a browser environment.");
    // Return an empty blob or throw an error, depending on desired handling
    return new Blob([]); 
  }

  try {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  } catch (error) {
    console.error("Error converting base64 to Blob:", error);
    // Handle error, e.g., return an empty blob
    return new Blob([]);
  }
}