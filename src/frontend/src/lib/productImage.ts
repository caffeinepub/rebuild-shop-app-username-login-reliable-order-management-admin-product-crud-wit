import { Product } from '../backend';

/**
 * Resolves the image source for a product.
 * Prefers imageData (data URL) when present, falls back to legacy /assets/ filename.
 */
export function getProductImageSrc(product: Product): string | null {
  // Prefer imageData if present
  if (product.imageData) {
    return product.imageData;
  }
  
  // Legacy fallback: if no imageData, return null (no legacy assets in this version)
  return null;
}
