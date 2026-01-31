/**
 * UI Module
 * Handles DOM updates, charts, and visualizations.
 */

const metadataResults = document.getElementById('metadata-results');
const c2paResults = document.getElementById('c2pa-results');
const visualResults = document.getElementById('visual-results');
const fftResults = document.getElementById('fft-results');
const fileInfo = document.getElementById('file-info');

const gaugeEl = document.getElementById('confidence-gauge');
const gaugeFill = gaugeEl.querySelector('.gauge-fill');
const scoreText = gaugeEl.querySelector('.score-text');
const verdictEl = document.getElementById('final-verdict');

const visualChecklist = document.getElementById('visual-checklist');

export function setStatus(status) {
    verdictEl.innerText = status === 'processing' ? 'Analyzing...' : '';
    if (status === 'processing') {
        gaugeFill.style.background = `conic-gradient(var(--text-secondary) 0%, transparent 0%)`;
        scoreText.innerText = "--";
    }
}

export function resetResults() {
    metadataResults.innerHTML = '<ul class="checklist"><li>Waiting...</li></ul>';
    c2paResults.innerHTML = '<p class="placeholder-text">Pending...</p>';
    visualChecklist.innerHTML = '<li>Waiting for data...</li>';
    fftResults.innerHTML = '<p class="placeholder-text">Pending...</p>';

    // Clear canvases
    const noiseCanvas = document.getElementById('noise-canvas');
    const fftCanvas = document.getElementById('fft-canvas');

    if (noiseCanvas) {
        const ctx = noiseCanvas.getContext('2d');
        ctx.clearRect(0, 0, noiseCanvas.width, noiseCanvas.height);
        noiseCanvas.classList.add('hidden');
    }
    if (fftCanvas) {
        const ctx = fftCanvas.getContext('2d');
        ctx.clearRect(0, 0, fftCanvas.width, fftCanvas.height);
        fftCanvas.classList.add('hidden');
    }
}

export function updateMetadata(data) {
    const list = document.createElement('ul');
    list.className = 'checklist';

    // EXIF
    if (data.exif.found) {
        list.innerHTML += `<li>✅ EXIF Data Found</li>`;
        if (data.exif.make) list.innerHTML += `<li>📷 Make: ${data.exif.make}</li>`;
        if (data.exif.model) list.innerHTML += `<li>📸 Model: ${data.exif.model}</li>`;
        if (data.exif.software) list.innerHTML += `<li>💾 Software: ${data.exif.software}</li>`;
        if (data.exif.datetime) list.innerHTML += `<li>🕒 Date: ${data.exif.datetime}</li>`;
    } else {
        list.innerHTML += `<li>⚠️ No EXIF Data Found</li>`;
    }

    // AI Flags
    if (data.aiFlags && data.aiFlags.length > 0) {
        data.aiFlags.forEach(flag => {
            list.innerHTML += `<li style="color: var(--status-danger)">🤖 ${flag}</li>`;
        });
    }

    metadataResults.innerHTML = '';
    metadataResults.appendChild(list);

    document.getElementById('metadata-badge').innerText = "Done";
    document.getElementById('metadata-badge').style.color = varColor('safe');

    // C2PA
    if (data.c2pa) {
        c2paResults.innerHTML = `<div style="color: var(--accent-primary); font-weight: bold;">✅ Content Credentials Detected</div>
                                 <p style="font-size:0.8rem; margin-top:5px;">File contains C2PA provenance data.</p>`;
        document.getElementById('c2pa-badge').innerText = "Found";
    } else {
        c2paResults.innerHTML = `<div style="color: var(--text-secondary);">❌ No Content Credentials</div>`;
        document.getElementById('c2pa-badge').innerText = "None";
    }
}

export function updatePixelResults(data) {
    const list = visualChecklist;
    list.innerHTML = '';

    list.innerHTML += `<li>📉 Noise Score: ${data.noiseScore.toFixed(2)} (Lower = Cleaner)</li>`;
    list.innerHTML += `<li>☁️ Smoothness: ${data.smoothnessScore.toFixed(1)}%</li>`;

    if (data.noiseScore < 3) {
        list.innerHTML += `<li style="color: var(--status-warning)">⚠️ Low noise (possible synthetic)</li>`;
    }

    // Visualize ELA
    if (data.elaCanvas) {
        const wrapper = document.getElementById('visual-results');
        const oldCanvas = document.getElementById('noise-canvas');
        if (oldCanvas) oldCanvas.remove();

        data.elaCanvas.id = 'noise-canvas';
        data.elaCanvas.className = 'analysis-canvas';
        wrapper.insertBefore(data.elaCanvas, list);
    }

    document.getElementById('visual-badge').innerText = "Done";
}

export function updateFreqResults(data) {
    const wrapper = document.getElementById('fft-results');
    wrapper.innerHTML = ''; // clear placeholder

    if (data.spectrumCanvas) {
        data.spectrumCanvas.id = 'fft-canvas';
        data.spectrumCanvas.className = 'analysis-canvas';
        wrapper.appendChild(data.spectrumCanvas);
    }

    const p = document.createElement('p');
    p.style.fontSize = '0.9rem';
    p.style.marginTop = '10px';
    p.innerText = `Spectral Anomaly Score: ${data.anomalyScore.toFixed(2)}`;
    wrapper.appendChild(p);

    document.getElementById('fft-badge').innerText = "Done";
}

export function updateScore(result) {
    const score = result.score;
    const verdict = result.verdict;

    // Animate Gauge
    scoreText.innerText = `${score}%`;

    let color = varColor('safe');
    if (score > 40) color = varColor('warning');
    if (score > 70) color = varColor('danger');

    // Simple conical gradient
    gaugeFill.style.transition = 'background 1s ease';
    gaugeFill.style.background = `conic-gradient(${color} ${score}%, rgba(255,255,255,0.05) ${score}%)`;

    verdictEl.innerText = verdict;
    verdictEl.style.color = color;

    // Add contributing factors
    const card = document.querySelector('.score-card');
    const existingList = document.getElementById('factors-list');
    if (existingList) existingList.remove();

    if (result.signals.length > 0) {
        const ul = document.createElement('ul');
        ul.id = 'factors-list';
        ul.className = 'checklist';
        ul.style.marginTop = '20px';
        ul.style.borderTop = '1px solid var(--border-color)';
        ul.style.paddingTop = '10px';

        result.signals.forEach(sig => {
            const li = document.createElement('li');
            li.innerHTML = `<span style="color: ${getImpactColor(sig.impact)}">●</span> <strong>${sig.name}:</strong> ${sig.detail}`;
            ul.appendChild(li);
        });
        card.appendChild(ul);
    }
}

function varColor(name) {
    if (name === 'safe') return '#10b981'; // Emerald
    if (name === 'warning') return '#f59e0b'; // Amber
    if (name === 'danger') return '#ef4444'; // Red
    return '#fff';
}

function getImpactColor(impact) {
    if (impact === 'High') return varColor('danger');
    if (impact === 'Medium') return varColor('warning');
    return varColor('safe');
}

export function updateServerResults(data) {
    const list = document.createElement('ul');
    list.className = 'checklist';
    const badge = document.getElementById('server-badge');
    const container = document.getElementById('server-results');

    container.innerHTML = '';

    if (data.error) {
        list.innerHTML = `<li style="color: var(--status-warning)">⚠️ ${data.error}</li>`;
        badge.innerText = "Error";
        badge.style.color = varColor('warning');
    } else if (data.server_analysis) {
        const res = data.server_analysis;
        list.innerHTML += `<li>✅ Format: ${res.format}</li>`;
        list.innerHTML += `<li>📐 Dimensions: ${res.dimensions[0]}x${res.dimensions[1]}</li>`;
        list.innerHTML += `<li>📉 ELA Variance: ${res.ela_variance}</li>`;

        badge.innerText = "Verified";
        badge.style.color = res.ela_variance < 0.01 ? varColor('warning') : varColor('safe');
    }

    container.appendChild(list);
}
