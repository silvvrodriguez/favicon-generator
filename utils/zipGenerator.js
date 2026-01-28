/**
 * @param {Array<{size:number, filename:string, blob:Blob}>} favicons
 * @returns {Promise<void>}
 */
async function createFaviconZip(favicons) {
    const zip = new JSZip();


    const iconsFolder = zip.folder('favicons');
    favicons.forEach(({ filename, blob }) => {
        iconsFolder.file(filename, blob);
    });


    const hasPWA = favicons.some(f => f.size === 192 || f.size === 512);
    if (hasPWA && typeof generateManifestJSON === 'function') {
        zip.file('manifest.json', generateManifestJSON(favicons, {
            name: 'My App',
            shortName: 'App',
            themeColor: '#06B6D4',
            backgroundColor: '#0A1929'
        }));
    }


    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

    const htmlSnippet = typeof generateFaviconHTML === 'function'
        ? generateFaviconHTML(favicons, { basePath: '/favicons/', themeColor: '#06B6D4' })
        : '';

    const readmeContent = `Favicons (generated)

Generated: ${timestamp}

Files
- favicons/  (all PNG icons)
${hasPWA ? '- manifest.json (optional PWA manifest)\n' : ''}

How to use
1) Copy the "favicons" folder into your site (e.g. /public/favicons or /favicons).
2) Paste this into your <head>:

${htmlSnippet || '(HTML snippet not available)'}

${hasPWA ? `PWA (optional)
- Place manifest.json at your site root (/) or adjust the path in the HTML.
` : ''}Included sizes
${favicons
    .slice()
    .sort((a, b) => a.size - b.size)
    .map(f => `- ${f.filename}`)
    .join('\n')}
`;

    zip.file('README.txt', readmeContent);


    const blob = await zip.generateAsync({ type: 'blob' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favicons.zip';
    a.click();

    URL.revokeObjectURL(url);
}