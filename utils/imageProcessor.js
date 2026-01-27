/**
 * Resize an image to specified dimensions
 * @param {HTMLImageElement} img - Source image
 * @param {number} width - Target width
 * @param {number} height - Target height
 * @returns {HTMLCanvasElement} Canvas with resized image
 */
function resizeImage(img, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    
    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Fill with white background (for transparent images)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    // Calculate dimensions to maintain aspect ratio
    const scale = Math.min(width / img.width, height / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    
    // Center the image
    const x = (width - scaledWidth) / 2;
    const y = (height - scaledHeight) / 2;
    
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    
    return canvas;
}

/**
 * Check if image has good resolution for target size
 * @param {HTMLImageElement} img - Source image
 * @param {number} targetSize - Target size
 * @returns {boolean} True if resolution is good
 */
function hasGoodResolution(img, targetSize) {
    return img.width >= targetSize && img.height >= targetSize;
}

/**
 * Get quality assessment for an image at target size
 * @param {HTMLImageElement} img - Source image
 * @param {number} targetSize - Target size
 * @returns {string} Quality level: 'excellent', 'good', 'fair', 'poor'
 */
function assessQuality(img, targetSize) {
    const minDimension = Math.min(img.width, img.height);
    const ratio = minDimension / targetSize;
    
    if (ratio >= 4) return 'excellent';
    if (ratio >= 2) return 'good';
    if (ratio >= 1) return 'fair';
    return 'poor';
}