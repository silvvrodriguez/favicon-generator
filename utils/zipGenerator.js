/**
 * Create a ZIP file with all generated favicons
 * @param {Array} favicons - Array of favicon objects with blob and filename
 * @returns {Promise<void>}
 */
async function createFaviconZip(favicons) {
    const zip = new JSZip();
    
    // Add all favicon images to zip
    favicons.forEach(favicon => {
        zip.file(favicon.filename, favicon.blob);
    });
    
    // Add a README file
    const readmeContent = `# Favicons Generated
    
Generated on: ${new Date().toLocaleString()}

## How to use:

1. Copy all PNG files to your website's root directory or /images/ folder

2. Add this HTML to your <head> section:

${generateFaviconHTML(favicons)}

3. For PWA support, include the manifest.json file and add:
   <link rel="manifest" href="/manifest.json">

## Sizes included:
${favicons.map(f => `- ${f.filename}`).join('\n')}

---
Generated with Favicon Generator Multi-Format
`;
    
    zip.file('README.txt', readmeContent);
    
    // Generate the zip file
    const blob = await zip.generateAsync({ type: 'blob' });
    
    // Download the zip
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favicons.zip';
    a.click();
    
    URL.revokeObjectURL(url);
}