/**
 * AI Image Forensics Tool - Main Application Logic
 * Coordinates UI, file handling, and analysis modules.
 */

// Import Modules (to be created)
import * as Metadata from './modules/metadata.js';
import * as PixelAnalysis from './modules/pixel_analysis.js';
import * as FrequencyAnalysis from './modules/frequency.js';
import * as Scoring from './modules/scoring.js';
import * as UI from './modules/ui.js';

// DOM Elements
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const uploadSection = document.getElementById('upload-section');
const dashboardSection = document.getElementById('dashboard-section');
const previewImg = document.getElementById('preview-img');
const resetBtn = document.getElementById('reset-btn');
const reportBtn = document.getElementById('download-report-btn');

// State
let currentFile = null;
let currentScore = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
});

function initEventListeners() {
    // Drag & Drop
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    // Manual File Selection
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Reset
    // Reset
    resetBtn.addEventListener('click', resetAnalysis);

    // Report
    reportBtn.addEventListener('click', generateReport);
}

function handleFiles(files) {
    if (files.length === 0) return;

    const file = files[0];
    if (!validateFile(file)) return;

    currentFile = file;
    startAnalysis(file);
}

function validateFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        alert('Format not supported. Please upload JPG, PNG, or WEBP.');
        return false;
    }
    if (file.size > 20 * 1024 * 1024) { // 20MB
        alert('File is too large. Max 20MB.');
        return false;
    }
    return true;
}

async function startAnalysis(file) {
    // UI Transitions
    uploadSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    uploadSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    resetBtn.classList.remove('hidden');
    reportBtn.classList.remove('hidden');

    // Display Preview
    const objectUrl = URL.createObjectURL(file);
    previewImg.src = objectUrl;

    // Update File Info
    const fileInfo = document.getElementById('file-info');
    fileInfo.innerHTML = `
        <strong>Name:</strong> ${file.name}<br>
        <strong>Size:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB<br>
        <strong>Type:</strong> ${file.type}
    `;

    // Wait for image to load before pixel analysis
    previewImg.onload = async () => {
        runAnalysisPipeline(file, previewImg);
    };
}

async function runAnalysisPipeline(file, imgElement) {
    console.log("Starting analysis pipeline...");
    UI.resetResults();
    UI.setStatus('processing');

    try {
        // 1. Metadata Analysis
        console.log("Running Metadata Analysis...");
        const metadataResults = await Metadata.analyze(file);
        UI.updateMetadata(metadataResults);

        // 2. Pixel Analysis
        console.log("Running Pixel Analysis...");
        const pixelResults = await PixelAnalysis.analyze(imgElement);
        UI.updatePixelResults(pixelResults);

        // 3. Frequency Analysis
        console.log("Running Frequency Analysis...");
        const freqResults = await FrequencyAnalysis.analyze(imgElement);
        UI.updateFreqResults(freqResults);

        // 4. Scoring
        console.log("Calculating Score...");
        // 4. Scoring
        console.log("Calculating Score...");
        const finalScore = Scoring.calculate(metadataResults, pixelResults, freqResults);
        currentScore = finalScore; // Store for report
        UI.updateScore(finalScore);

        // 5. Server-Side Verification (Async)
        runServerAnalysis(file);

    } catch (error) {
        console.error("Analysis failed:", error);
        alert("An error occurred during analysis.");
    }
}

async function runServerAnalysis(file) {
    console.log("Running Server-Side Analysis...");
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            UI.updateServerResults(result);
        } else {
            console.error("Server analysis failed");
            UI.updateServerResults({ error: "Server unavailable" });
        }
    } catch (e) {
        console.error("Server error:", e);
        UI.updateServerResults({ error: "Connection failed" });
    }
}

async function generateReport() {
    if (!currentFile || !currentScore) return;

    reportBtn.innerText = "Generating...";

    const formData = new FormData();
    formData.append('file', currentFile);
    formData.append('confidence', currentScore.score + '%');
    formData.append('verdict', currentScore.verdict);

    try {
        const response = await fetch('/api/report', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Forensics_Report_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            const err = await response.json();
            alert(`Failed to generate report: ${err.error || 'Unknown error'}`);
        }
    } catch (e) {
        console.error(e);
        alert(`Error connecting to report server: ${e.message}`);
    } finally {
        reportBtn.innerText = "📄 Download Report";
    }
}

function resetAnalysis() {
    currentFile = null;
    previewImg.src = "";
    uploadSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    resetBtn.classList.add('hidden');
    reportBtn.classList.add('hidden');
    fileInput.value = ""; // Reset input
}
