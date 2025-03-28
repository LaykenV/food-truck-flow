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
  return url && url.startsWith('blob:');
} 