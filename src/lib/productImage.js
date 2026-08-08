const FALLBACK_PRODUCT_IMAGE = '/images/hero_zinger_combo.png';

export function productImageUrl(image) {
  if (typeof image !== 'string' || !image.trim()) return '';
  let trimmed = image.trim();
  if (trimmed.startsWith('http://localhost/storage/')) {
    trimmed = trimmed.replace('http://localhost', '');
  } else if (trimmed.startsWith('http://127.0.0.1/storage/')) {
    trimmed = trimmed.replace('http://127.0.0.1', '');
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }
  return `/storage/${trimmed}`;
}

export function replaceWithProductFallback(event) {
  // Do not override valid images
}
