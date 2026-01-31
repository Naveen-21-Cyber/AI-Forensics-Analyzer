# AI Image Forensics Tool

> **A Client-Side Digital Forensics Suite for AI Generation Detection**

**Version:** 1.0.0-research
**Author:** AI Engineer (Agent)

## Overview
This tool is a browser-based application designed to analyze images for signs of AI generation. It combines metadata inspection, pixel-level statistical analysis, and frequency domain (FFT) visualization to provide a probabilistic "Integrity Score". 

It runs entirely in the browser using Vanilla JavaScript, HTML5, and CSS3, ensuring privacy (images are not uploaded to a cloud server) and transparency.

## Features

### 1. Metadata Analysis
- **EXIF Extraction**: Parses standard JPEG/TIFF tags to identify camera make, model, and software.
- **AI Signature Detection**: Scans the "Software" field for known AI generators (e.g., "Midjourney", "Stable Diffusion", "Adobe Firefly").
- **Content Credentials (C2PA)**: Detects the presence of C2PA/JUMBF provenance data (often used by Adobe and Microsoft to label AI content).

### 2. Pixel-Level Heuristics
- **Noise Variance Estimation**: Analyzes local noise levels. AI images often exhibit "cleaner" or more uniform noise patterns compared to the chaotic photon noise of real camera sensors.
- **Smoothness/Texture Analysis**: Detects unnatural smoothness ("plastic skin" effect) common in diffusion models.
- **Error Level Analysis (ELA) Visualization**: Simulates ELA by highlighting high-frequency edge artifacts.

### 3. Frequency Domain Analysis
- **2D FFT**: Performs a Fast Fourier Transform on the image.
- **Spectral Visualization**: Displays the magnitude spectrum to reveal anomalies. AI generation often leaves grid-like artifacts or unusual high-frequency energy distributions.
- **Anomaly Scoring**: Quantifies deviations from natural image spectral characteristics.

### 4. Confidence Scoring
A weighted scoring engine aggregates all signals:
- **0-39%**: Likely Real / Unmodified
- **40-69%**: Inconclusive / Suspicious
- **70-100%**: Likely AI-Generated

> **⚠️ Disclaimer**: This tool provides probabilistic analysis and does **not** guarantee absolute authenticity. It is intended for research and educational purposes.

## Installation & Usage

### Method 1: Direct Open
Simply open `index.html` in any modern web browser (Edge, Chrome, Firefox). No server required.

### Method 2: Local Server (Optional)
If strict browser policies block module loading (CORS), run a local server:

```bash
# Python 3
python -m http.server 8000
# Node
npx serve
```
Then visit `http://localhost:8000`.

## Directory Structure
```
/
├── index.html            # Main entry point
├── css/
│   └── styles.css        # Glassmorphism UI styles
├── js/
│   ├── app.js            # Main controller
│   └── modules/
│       ├── metadata.js   # EXIF & C2PA parsers
│       ├── pixel_analysis.js # Noise & Edge logic
│       ├── frequency.js  # FFT implementation
│       ├── scoring.js    # Confidence logic
│       └── ui.js         # DOM rendering
└── server_stub.py        # Optional backend stub
```

## Future Improvements
- **Full C2PA Validation**: Verify the cryptographic signature of Content Credentials.
- **Deep Learning Model**: Integrate ONNX Runtime Web to run a lightweight CNN (e.g., ResNet-50) for feature extraction in the browser.
- **Advanced ELA**: Implement true JPEG re-compression ELA.
