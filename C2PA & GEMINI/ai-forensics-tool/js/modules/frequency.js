/**
 * Frequency Analysis Module
 * Performs 2D FFT to analyze spatial frequency distribution.
 */

export async function analyze(imgElement) {
    const size = 256; // Power of 2 for FFT
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Draw grayscale
    ctx.drawImage(imgElement, 0, 0, size, size);
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    // Convert to complex array (Real, Imag)
    const real = new Float32Array(size * size);
    const imag = new Float32Array(size * size);

    for (let i = 0; i < size * size; i++) {
        const val = data[i * 4]; // R channel (grayscale assumed)
        real[i] = val / 255.0; // Normalize 0-1
        imag[i] = 0;
    }

    // Perform 2D FFT
    fft2D(real, imag, size, size);

    // Shift Quadrants (center low freqs) & Compute Magnitude
    const magnitude = new Float32Array(size * size);
    fftShiftAndMagnitude(real, imag, magnitude, size, size);

    // Visualize Spectrum
    const spectrumCanvas = drawSpectrum(magnitude, size, size);

    // Calculate Anomaly Score
    const anomalyScore = detectSpectalAnomalies(magnitude, size);

    return {
        anomalyScore: anomalyScore,
        spectrumCanvas: spectrumCanvas
    };
}

/**
 * 2D FFT Implementation (Row-Column decomposition)
 */
function fft2D(real, imag, width, height) {
    // 1. FFT on rows
    for (let y = 0; y < height; y++) {
        const rowReal = new Float32Array(width);
        const rowImag = new Float32Array(width);
        for (let x = 0; x < width; x++) {
            rowReal[x] = real[y * width + x];
            rowImag[x] = imag[y * width + x];
        }
        fft1D(rowReal, rowImag);
        for (let x = 0; x < width; x++) {
            real[y * width + x] = rowReal[x];
            imag[y * width + x] = rowImag[x];
        }
    }

    // 2. FFT on columns
    for (let x = 0; x < width; x++) {
        const colReal = new Float32Array(height);
        const colImag = new Float32Array(height);
        for (let y = 0; y < height; y++) {
            colReal[y] = real[y * width + x];
            colImag[y] = imag[y * width + x];
        }
        fft1D(colReal, colImag);
        for (let y = 0; y < height; y++) {
            real[y * width + x] = colReal[y];
            imag[y * width + x] = colImag[y];
        }
    }
}

/**
 * 1D Cooley-Tukey FFT (Radix-2)
 * Input length must be power of 2
 */
function fft1D(real, imag) {
    const n = real.length;
    if (n <= 1) return;

    // Bit-reverse permutation
    let j = 0;
    for (let i = 0; i < n; i++) {
        if (i < j) {
            [real[i], real[j]] = [real[j], real[i]];
            [imag[i], imag[j]] = [imag[j], imag[i]];
        }
        let m = n >> 1;
        while (m >= 1 && j >= m) {
            j -= m;
            m >>= 1;
        }
        j += m;
    }

    // Butterfly computations
    for (let m = 2; m <= n; m <<= 1) {
        const angle = -2 * Math.PI / m;
        const w_m_r = Math.cos(angle);
        const w_m_i = Math.sin(angle);

        for (let k = 0; k < n; k += m) {
            let w_r = 1;
            let w_i = 0;
            for (let j = 0; j < m / 2; j++) {
                const idx1 = k + j;
                const idx2 = k + j + m / 2;

                const t_r = w_r * real[idx2] - w_i * imag[idx2];
                const t_i = w_r * imag[idx2] + w_i * real[idx2];

                real[idx2] = real[idx1] - t_r;
                imag[idx2] = imag[idx1] - t_i;
                real[idx1] = real[idx1] + t_r;
                imag[idx1] = imag[idx1] + t_i;

                const tmp_r = w_r;
                w_r = tmp_r * w_m_r - w_i * w_m_i;
                w_i = tmp_r * w_m_i + w_i * w_m_r;
            }
        }
    }
}

function fftShiftAndMagnitude(real, imag, magnitude, w, h) {
    // Shift so DC is in center: (0,0) -> (w/2, h/2)
    const cx = w / 2;
    const cy = h / 2;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const idx = y * w + x;
            // Calculate Magnitude
            const mag = Math.sqrt(real[idx] * real[idx] + imag[idx] * imag[idx]);
            // Log scale for visualization: log(1 + mag)
            const val = Math.log(1 + mag);

            // Shift coordinates
            const ny = (y + cy) % h;
            const nx = (x + cx) % w;
            const nIdx = ny * w + nx;

            magnitude[nIdx] = val;
        }
    }
}

function drawSpectrum(magnitude, w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(w, h);

    // Normalize for display
    let max = 0;
    for (let i = 0; i < magnitude.length; i++) {
        if (magnitude[i] > max) max = magnitude[i];
    }

    const data = imageData.data;
    for (let i = 0; i < magnitude.length; i++) {
        const val = (magnitude[i] / max) * 255;
        // Heatmap style: Blue -> Green -> Red
        // Simple grayscale for now, maybe add color map later
        data[i * 4] = val;
        data[i * 4 + 1] = val; // val * 0.8
        data[i * 4 + 2] = val; // val * 0.5
        data[i * 4 + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

function detectSpectalAnomalies(magnitude, size) {
    // Check for "star pattern" or unusual high freq concentrations
    // Real images usually have smooth falloff from center.
    // AI images (older GANs especially) might have grid artifacts (bright spots in high freq).

    // We analyze the outer regions (high freq).
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.4;

    let highFreqEnergy = 0;
    let count = 0;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
            if (dist > radius) {
                highFreqEnergy += magnitude[y * size + x];
                count++;
            }
        }
    }

    // Normalize
    return (highFreqEnergy / count);
}
