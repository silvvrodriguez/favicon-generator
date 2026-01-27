// Global state
let originalImage = null;
let selectedSizes = new Set();

// Size configurations
const SIZES = [
    { size: 16, label: '16×16', description: 'Browser tab', recommended: true },
    { size: 32, label: '32×32', description: 'Taskbar', recommended: true },
    { size: 48, label: '48×48', description: 'Windows', recommended: true },
    { size: 64, label: '64×64', description: 'Standard', recommended: false },
    { size: 128, label: '128×128', description: 'Chrome Web Store', recommended: false },
    { size: 180, label: '180×180', description: 'Apple Touch', recommended: true },
    { size: 192, label: '192×192', description: 'Android Chrome', recommended: true },
    { size: 512, label: '512×512', description: 'PWA', recommended: true }
];

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
const previewSection = document.getElementById('previewSection');
const downloadSection = document.getElementById('downloadSection');
const originalImageEl = document.getElementById('originalImage');
const imageInfo = document.getElementById('imageInfo');
const sizesGrid = document.getElementById('sizesGrid');
const generateBtn = document.getElementById('generateBtn');
const selectAllBtn = document.getElementById('selectAll');
const selectPWABtn = document.getElementById('selectPWA');
const downloadZipBtn = document.getElementById('downloadZip');
const copyCodeBtn = document.getElementById('copyCode');
const resetBtn = document.getElementById('resetBtn');
const cancelBtn = document.getElementById('cancelBtn');
const generatedPreviews = document.getElementById('generatedPreviews');
const codeSnippet = document.getElementById('codeSnippet');
const htmlCode = document.getElementById('htmlCode');

// Initialize
init();

function init() {
    setupEventListeners();
    renderSizesGrid();
}

function setupEventListeners() {
    // Upload area events
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Buttons
    generateBtn.addEventListener('click', generateFavicons);
    selectAllBtn.addEventListener('click', selectAllSizes);
    selectPWABtn.addEventListener('click', selectPWASizes);
    downloadZipBtn.addEventListener('click', downloadAsZip);
    copyCodeBtn.addEventListener('click', copyHTMLCode);
    resetBtn.addEventListener('click', resetApp);
    cancelBtn.addEventListener('click', cancelPreview);
}

// File handling
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImage(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImage(file);
    }
}

function loadImage(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            showPreviewSection();
            displayOriginalImage(img, file);
        };
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

function displayOriginalImage(img, file) {
    originalImageEl.src = img.src;
    
    const sizeKB = (file.size / 1024).toFixed(2);
    imageInfo.textContent = `${img.width} × ${img.height} pixels • ${sizeKB} KB`;
    
    // Auto-select recommended sizes
    selectRecommendedSizes();
}

function showPreviewSection() {
    uploadSection.style.display = 'none';
    previewSection.classList.remove('hidden');
}

// Render sizes grid
function renderSizesGrid() {
    sizesGrid.innerHTML = '';
    
    SIZES.forEach(config => {
        const sizeItem = document.createElement('div');
        sizeItem.className = 'size-item';
        sizeItem.innerHTML = `
            <input type="checkbox" id="size-${config.size}" data-size="${config.size}">
            <label for="size-${config.size}" class="size-label">${config.label}</label>
            <span class="size-description">${config.description}</span>
        `;
        
        const checkbox = sizeItem.querySelector('input');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedSizes.add(config.size);
                sizeItem.classList.add('selected');
            } else {
                selectedSizes.delete(config.size);
                sizeItem.classList.remove('selected');
            }
            updateGenerateButton();
        });
        
        sizeItem.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
                checkbox.click();
            }
        });
        
        sizesGrid.appendChild(sizeItem);
    });
}

function selectRecommendedSizes() {
    SIZES.forEach(config => {
        if (config.recommended) {
            const checkbox = document.getElementById(`size-${config.size}`);
            checkbox.checked = true;
            selectedSizes.add(config.size);
            checkbox.closest('.size-item').classList.add('selected');
        }
    });
    updateGenerateButton();
}

function selectAllSizes() {
    SIZES.forEach(config => {
        const checkbox = document.getElementById(`size-${config.size}`);
        checkbox.checked = true;
        selectedSizes.add(config.size);
        checkbox.closest('.size-item').classList.add('selected');
    });
    updateGenerateButton();
}

function selectPWASizes() {
    // Clear all first
    selectedSizes.clear();
    document.querySelectorAll('.size-item').forEach(item => {
        item.classList.remove('selected');
        item.querySelector('input').checked = false;
    });
    
    // Select PWA sizes: 192, 512, and Apple 180
    const pwaConfig = [180, 192, 512];
    pwaConfig.forEach(size => {
        const checkbox = document.getElementById(`size-${size}`);
        if (checkbox) {
            checkbox.checked = true;
            selectedSizes.add(size);
            checkbox.closest('.size-item').classList.add('selected');
        }
    });
    updateGenerateButton();
}

function updateGenerateButton() {
    generateBtn.disabled = selectedSizes.size === 0;
    generateBtn.textContent = selectedSizes.size > 0 
        ? `Generate ${selectedSizes.size} Favicon${selectedSizes.size > 1 ? 's' : ''}`
        : 'Select at least one size';
}

// Generate favicons
async function generateFavicons() {
    if (!originalImage || selectedSizes.size === 0) return;
    
    generateBtn.textContent = 'Generating...';
    generateBtn.disabled = true;
    
    // Clear previous previews
    generatedPreviews.innerHTML = '';
    
    // Generate each size
    const generatedImages = [];
    
    for (const size of selectedSizes) {
        const canvas = resizeImage(originalImage, size, size);
        const blob = await canvasToBlob(canvas);
        const url = URL.createObjectURL(blob);
        
        generatedImages.push({
            size,
            url,
            blob,
            filename: `favicon-${size}x${size}.png`
        });
        
        // Add to preview
        addPreviewItem(url, size);
    }
    
    // Store generated images globally for download
    window.generatedFavicons = generatedImages;
    
    // Show download section
    showDownloadSection();
    
    // Generate HTML code
    generateHTMLCode();
    
    generateBtn.textContent = '✓ Generated!';
    setTimeout(() => {
        generateBtn.textContent = 'Generate Favicons';
        generateBtn.disabled = false;
    }, 2000);
}

function addPreviewItem(url, size) {
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    previewItem.innerHTML = `
        <img src="${url}" alt="${size}x${size}">
        <div class="size-text">${size}×${size}</div>
    `;
    generatedPreviews.appendChild(previewItem);
}

function showDownloadSection() {
    previewSection.style.display = 'none';
    downloadSection.classList.remove('hidden');
}

// Download as ZIP
async function downloadAsZip() {
    if (!window.generatedFavicons) return;
    
    downloadZipBtn.textContent = 'Creating ZIP...';
    downloadZipBtn.disabled = true;
    
    const zip = await createFaviconZip(window.generatedFavicons);
    
    downloadZipBtn.textContent = '📦 Download All (ZIP)';
    downloadZipBtn.disabled = false;
}

// Copy HTML code
function copyHTMLCode() {
    const code = htmlCode.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        copyCodeBtn.textContent = '✓ Copied!';
        codeSnippet.classList.remove('hidden');
        
        setTimeout(() => {
            copyCodeBtn.textContent = '📋 Copy HTML Code';
        }, 2000);
    });
}

function generateHTMLCode() {
    const code = generateFaviconHTML(window.generatedFavicons);
    htmlCode.textContent = code;
}

// Reset app
function resetApp() {
    originalImage = null;
    selectedSizes.clear();
    window.generatedFavicons = null;
    
    fileInput.value = '';
    uploadSection.style.display = 'block';
    previewSection.classList.add('hidden');
    downloadSection.classList.add('hidden');
    codeSnippet.classList.add('hidden');
    
    // Clear previews
    generatedPreviews.innerHTML = '';
    
    // Reset size selections
    document.querySelectorAll('.size-item').forEach(item => {
        item.classList.remove('selected');
        item.querySelector('input').checked = false;
    });
    
    updateGenerateButton();
}

// Cancel preview and go back to upload
function cancelPreview() {
    originalImage = null;
    selectedSizes.clear();
    
    fileInput.value = '';
    uploadSection.style.display = 'block';
    previewSection.classList.add('hidden');
    
    // Reset size selections
    document.querySelectorAll('.size-item').forEach(item => {
        item.classList.remove('selected');
        item.querySelector('input').checked = false;
    });
    
    updateGenerateButton();
}

// Utility function to convert canvas to blob
function canvasToBlob(canvas) {
    return new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), 'image/png');
    });
}