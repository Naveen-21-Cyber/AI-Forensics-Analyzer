/**
 * Metadata Analysis Module
 * Extracts EXIF data and checks for C2PA/Content Credentials.
 */

export async function analyze(file) {
    const arrayBuffer = await file.arrayBuffer();
    const dataView = new DataView(arrayBuffer);

    // 1. Extract EXIF
    const exifData = parseEXIF(dataView);

    // 2. Check for C2PA/Provenance
    const c2paDetected = detectC2PA(arrayBuffer);

    // 3. AI Detection based on Software/Metadata
    const aiFlags = detectAIFromMetadata(exifData);

    return {
        exif: exifData,
        c2pa: c2paDetected,
        aiFlags: aiFlags,
        rawSize: file.size
    };
}

/**
 * Basic EXIF Parser
 * Scans for APP1 marker and parses TIFF tags.
 */
function parseEXIF(dataView) {
    const exif = {
        make: null,
        model: null,
        software: null,
        datetime: null,
        found: false
    };

    try {
        if (dataView.getUint16(0) !== 0xFFD8) return exif; // Not JPEG

        let offset = 2;
        const length = dataView.byteLength;

        while (offset < length) {
            if (dataView.getUint8(offset) !== 0xFF) break; // Invalid marker

            const marker = dataView.getUint8(offset + 1);
            const segmentLength = dataView.getUint16(offset + 2);

            // APP1 Marker (Exif)
            if (marker === 0xE1) {
                if (dataView.getUint32(offset + 4) === 0x45786966) { // "Exif"
                    exif.found = true;
                    parseTIFF(dataView, offset + 10, exif);
                }
                break; // Found EXIF, stop scanning
            }

            offset += 2 + segmentLength;
        }
    } catch (e) {
        console.warn("Error parsing EXIF:", e);
    }

    return exif;
}

function parseTIFF(dataView, start, exif) {
    const endian = dataView.getUint16(start) === 0x4949; // II = Little Endian
    const littleEndian = endian;

    const firstIFDOffset = dataView.getUint32(start + 4, littleEndian);
    if (firstIFDOffset < 8) return;

    const dirStart = start + firstIFDOffset;
    const entries = dataView.getUint16(dirStart, littleEndian);

    for (let i = 0; i < entries; i++) {
        const entryOffset = dirStart + 2 + (i * 12);
        const tag = dataView.getUint16(entryOffset, littleEndian);

        switch (tag) {
            case 0x010F: // Make
                exif.make = readTagValue(dataView, entryOffset, start, littleEndian);
                break;
            case 0x0110: // Model
                exif.model = readTagValue(dataView, entryOffset, start, littleEndian);
                break;
            case 0x0131: // Software
                exif.software = readTagValue(dataView, entryOffset, start, littleEndian);
                break;
            case 0x0132: // DateTime
                exif.datetime = readTagValue(dataView, entryOffset, start, littleEndian);
                break;
        }
    }
}

function readTagValue(dataView, entryOffset, tiffStart, littleEndian) {
    const type = dataView.getUint16(entryOffset + 2, littleEndian);
    const count = dataView.getUint32(entryOffset + 4, littleEndian);
    const valueOffset = dataView.getUint32(entryOffset + 8, littleEndian) + tiffStart;

    if (type === 2) { // ASCII String
        let str = "";
        for (let i = 0; i < count - 1; i++) { // Ignore null terminator
            str += String.fromCharCode(dataView.getUint8(valueOffset + i));
        }
        return str.trim();
    }
    return null;
}

/**
 * C2PA / Content Credentials Detection
 * Scans for 'jum' / 'jumb' box or 'c2pa' UUID.
 */
function detectC2PA(arrayBuffer) {
    const uint8 = new Uint8Array(arrayBuffer);
    // Convert a chunk of the beginning and end of the file to string to search (optimization)
    // Or just scan the whole thing if small enough. For 20MB limit, full scan ok.

    // Naive search for "c2pa" or "jumb" string in binary
    // Better: Search for JUMBF Superbox UUID: 63 32 70 61 (c2pa)

    const textDecoder = new TextDecoder();
    // Scan first 100KB and last 100KB for efficiency usually, but let's do a search.
    // We'll search for the ASCII sequence "c2pa"

    const signature = [0x63, 0x32, 0x70, 0x61]; // 'c2pa'

    for (let i = 0; i < uint8.length - 4; i++) {
        if (uint8[i] === signature[0] &&
            uint8[i + 1] === signature[1] &&
            uint8[i + 2] === signature[2] &&
            uint8[i + 3] === signature[3]) {
            return true;
        }
    }

    return false;
}

/**
 * Pattern matching for known AI Generators
 */
function detectAIFromMetadata(exif) {
    const flags = [];
    const knownTools = [
        "Midjourney", "Stable Diffusion", "DALL-E", "Firefly", "Imagine", "Wonder", "Adobe Photoshop Generative"
    ];

    const checkString = (str) => {
        if (!str) return false;
        return knownTools.some(tool => str.toLowerCase().includes(tool.toLowerCase()));
    };

    if (checkString(exif.software)) {
        flags.push(`AI Software Detected: ${exif.software}`);
    }

    // Some AI tools leave specific Make/Model data or lack it entirely
    if (!exif.found) {
        flags.push("No EXIF Metadata found (Suspicious)");
    }

    return flags;
}
