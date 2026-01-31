/**
 * Scoring Module
 * Aggregates signals from all analysis modules to determine likelihood of AI generation.
 */

export function calculate(metadata, pixel, freq) {
    let score = 0;
    let signals = [];

    // --- 1. Metadata Signals (High Confidence) ---
    if (metadata.aiFlags && metadata.aiFlags.length > 0) {
        score += 80;
        signals.push({ name: "Metadata AI Flags", impact: "High", detail: metadata.aiFlags.join(", ") });
    } else if (!metadata.exif.found) {
        score += 20; // Suspicious but not definitive
        signals.push({ name: "Missing EXIF", impact: "Low", detail: "No camera metadata found" });
    }

    if (metadata.c2pa) {
        // C2PA existence is usually a good sign of "responsible" AI or authentic camera,
        // but for now we'll treat it as a transparency bonus.
        // If we found "Content Credentials", it might denote AI.
        // For this simple logic: Neutral.
        signals.push({ name: "Content Credentials", impact: "Info", detail: "Provenance data detected" });
    }

    // --- 2. Pixel Signals (Medium Confidence) ---
    // Smoothness: > 60% flat is suspicious for high-res images
    if (pixel.smoothnessScore > 60) {
        score += 30;
        signals.push({ name: "Unnatural Smoothness", impact: "Medium", detail: "Lack of texture variance detected" });
    } else if (pixel.smoothnessScore > 40) {
        score += 15;
    }

    // Noise: < 5 is very clean (synthetic). > 10 is usually camera.
    if (pixel.noiseScore < 2.0) {
        score += 25;
        signals.push({ name: "Low Noise Levels", impact: "Medium", detail: "Image is suspiciously clean" });
    } else if (pixel.noiseScore < 5.0) {
        score += 10;
    }

    // --- 3. Frequency Signals (Experimental) ---
    // High anomaly score implies strange high-freq distribution
    if (freq.anomalyScore > 100) { // arbitrary threshold need tuning
        score += 10;
        signals.push({ name: "Frequency Anomaly", impact: "Low", detail: "Unusual spectral distribution" });
    }

    // Cap score at 99% (never 100%)
    score = Math.min(99, Math.max(0, score));

    return {
        score: Math.round(score),
        verdict: getVerdict(score),
        signals: signals
    };
}

function getVerdict(score) {
    if (score >= 70) return "Likely AI-Generated";
    if (score >= 40) return "Inconclusive / Suspicious";
    return "Likely Real / Unmodified";
}
