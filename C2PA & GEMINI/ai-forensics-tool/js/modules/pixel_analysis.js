/**
 * Pixel Analysis Module
 * Analyzes image data for visual artifacts, noise patterns, and coherence.
 */

export async function analyze(imgElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Resize for performance if needed, but keep decent resolution for analysis
    const width = Math.min(imgElement.naturalWidth, 1024);
    const scale = width / imgElement.naturalWidth;
    const height = imgElement.naturalHeight * scale;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(imgElement, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    // 1. Noise Analysis
    const noiseScore = estimateNoise(imageData);

    // 2. Edge/Texture Consistency (Smoothness)
    const smoothnessScore = analyzeSmoothness(imageData);

    // Generate visualization (Error Level Analysis - simplified)
    const elaCanvas = generateELAVisualization(imgElement, width, height);

    return {
        noiseScore: noiseScore, // Higher = Noisier (Real photos often have healthy uniform noise)
        smoothnessScore: smoothnessScore, // Higher = Smoother/Dreamier (AI feature)
        elaCanvas: elaCanvas
    };
}

/**
 * Estimate Noise Variance (Laplacian approach simplified)
 * AI images often have lower or inconsistent high-frequency noise than real camera sensors.
 */
function estimateNoise(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    let sumVar = 0;
    let count = 0;

    // Sampling stride to save time
    const stride = 2;

    for (let y = 1; y < height - 1; y += stride) {
        for (let x = 1; x < width - 1; x += stride) {
            const idx = (y * width + x) * 4;
            // Grayscale
            const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];

            // Simple Laplacian kernel
            //  0 -1  0
            // -1  4 -1
            //  0 -1  0

            const idxU = ((y - 1) * width + x) * 4;
            const idxD = ((y + 1) * width + x) * 4;
            const idxL = (y * width + (x - 1)) * 4;
            const idxR = (y * width + (x + 1)) * 4;

            const gU = 0.299 * data[idxU] + 0.587 * data[idxU + 1] + 0.114 * data[idxU + 2];
            const gD = 0.299 * data[idxD] + 0.587 * data[idxD + 1] + 0.114 * data[idxD + 2];
            const gL = 0.299 * data[idxL] + 0.587 * data[idxL + 1] + 0.114 * data[idxL + 2];
            const gR = 0.299 * data[idxR] + 0.587 * data[idxR + 1] + 0.114 * data[idxR + 2];

            const laplacian = 4 * gray - gU - gD - gL - gR;
            sumVar += Math.abs(laplacian);
            count++;
        }
    }

    // Normalize return 0-100
    // Real photos typically result in higher values (10-30+) depending on ISO
    // AI images, especially smoothed ones, might be lower.
    const averageNoise = sumVar / count;
    return averageNoise;
}

/**
 * Analyze Smoothness / Texture Loss
 * Detects large areas of low variance (plastic skin effect).
 */
function analyzeSmoothness(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    let flatPixels = 0;
    const totalPixels = (width * height) / 4; // sampling

    // Check local variance in 3x3 blocks
    for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
            const idx = (y * width + x) * 4;
            if (idx + 4 >= data.length) continue;

            // Compare with neighbor
            const diff = Math.abs(data[idx] - data[idx + 4]) +
                Math.abs(data[idx + 1] - data[idx + 5]) +
                Math.abs(data[idx + 2] - data[idx + 6]);

            if (diff < 5) { // Very flat transition
                flatPixels++;
            }
        }
    }

    // Percentage of image that is "flat"
    return (flatPixels / totalPixels) * 100;
}


/**
 * Generate a visual representation of pixel differences (Mock ELA-style)
 * Since we can't easily re-compress JPEG in JS without libraries to do real ELA,
 * we'll visualize the High Pass Filter to show edges/noise.
 */
function generateELAVisualization(img, w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // 1. Draw original
    ctx.drawImage(img, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    // 2. Apply High Pass Filter
    const output = ctx.createImageData(w, h);
    const dst = output.data;

    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const idx = (y * w + x) * 4;

            // High pass logic (original - blurred mostly, or difference)
            // Using logic: |4*C - U - D - L - R| + 128

            for (let c = 0; c < 3; c++) { // RGB
                const val = data[idx + c];
                const u = data[((y - 1) * w + x) * 4 + c];
                const d = data[((y + 1) * w + x) * 4 + c];
                const l = data[(y * w + x - 1) * 4 + c];
                const r = data[(y * w + x + 1) * 4 + c];

                let hp = 4 * val - u - d - l - r;
                dst[idx + c] = Math.min(255, Math.max(0, hp + 128)); // Shift to gray
            }
            dst[idx + 3] = 255;
        }
    }

    ctx.putImageData(output, 0, 0);
    return canvas;
}
