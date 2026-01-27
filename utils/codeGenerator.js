/**
 * Generate HTML code snippet for favicons
 * @param {Array} favicons - Array of favicon objects
 * @returns {string} HTML code
 */
function generateFaviconHTML(favicons) {
    let html = '<!-- Favicon Links -->\n';
    
    // Sort by size for organized output
    const sortedFavicons = [...favicons].sort((a, b) => a.size - b.size);
    
    sortedFavicons.forEach(favicon => {
        const { size, filename } = favicon;
        
        // Standard favicon link
        if (size === 16 || size === 32 || size === 48) {
            html += `<link rel="icon" type="image/png" sizes="${size}x${size}" href="/${filename}">\n`;
        }
        
        // Apple touch icon
        if (size === 180) {
            html += `<link rel="apple-touch-icon" sizes="${size}x${size}" href="/${filename}">\n`;
        }
        
        // Android/Chrome icons
        if (size === 192 || size === 512) {
            html += `<link rel="icon" type="image/png" sizes="${size}x${size}" href="/${filename}">\n`;
        }
        
        // Other sizes
        if (![16, 32, 48, 180, 192, 512].includes(size)) {
            html += `<link rel="icon" type="image/png" sizes="${size}x${size}" href="/${filename}">\n`;
        }
    });
    
    // Add manifest suggestion if PWA sizes are present
    const hasPWASizes = favicons.some(f => f.size === 192 || f.size === 512);
    if (hasPWASizes) {
        html += '\n<!-- For PWA support -->\n';
        html += '<link rel="manifest" href="/manifest.json">\n';
        html += '<meta name="theme-color" content="#6366F1">';
    }
    
    return html;
}

/**
 * Generate manifest.json content for PWA
 * @param {Array} favicons - Array of favicon objects
 * @returns {string} JSON string
 */
function generateManifestJSON(favicons) {
    const icons = favicons
        .filter(f => f.size >= 192)
        .map(f => ({
            src: `/${f.filename}`,
            sizes: `${f.size}x${f.size}`,
            type: 'image/png'
        }));
    
    const manifest = {
        name: 'Your App Name',
        short_name: 'App',
        icons: icons,
        theme_color: '#6366F1',
        background_color: '#0F172A',
        display: 'standalone'
    };
    
    return JSON.stringify(manifest, null, 2);
}