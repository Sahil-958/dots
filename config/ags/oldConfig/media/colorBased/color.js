
export function nearestNeighbor(pixels, width, height, factor) {
    const newWidth = Math.floor(width / factor);
    const newHeight = Math.floor(height / factor);
    const newPixels = [];

    for (let y = 0; y < newHeight; y++) {
        for (let x = 0; x < newWidth; x++) {
            const i = y * newWidth + x;
            const j = Math.floor(y * factor) * width + Math.floor(x * factor)
            newPixels[i] = pixels[j];
        }
    }

    return newPixels;
}

export function quantizePixels(pixels, numColors, iterationCount = 1) {
    // Helper function to calculate the Euclidean distance between two pixels
    function distance(p1, p2) {
        return Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + (p1[2] - p2[2]) ** 2)
    }

    // Initialize centroids randomly
    const centroids = [];
    for (let i = 0; i < numColors; i++) {
        const randomIndex = Math.floor(Math.random() * pixels.length);
        centroids.push(pixels[randomIndex]);
    }

    let clusters = new Array(numColors).fill(null).map(() => []);
    let oldClusters = [];

    // Repeat until convergence
    for (let i = 0; i < iterationCount; i++) {
        // Assign each pixel to the nearest centroid
        clusters = new Array(numColors).fill(null).map(() => []);
        for (const pixel of pixels) {
            let minDistance = Infinity;
            let closestCentroidIndex = -1;
            for (let i = 0; i < centroids.length; i++) {
                const d = distance(pixel, centroids[i]);
                if (d < minDistance) {
                    minDistance = d;
                    closestCentroidIndex = i;
                }
            }
            clusters[closestCentroidIndex].push(pixel);
        }

        // Check for convergence
        if (i + 1 === iterationCount) {
            break;
        }

        // Update centroids to the mean of the clusters
        for (let i = 0; i < numColors; i++) {
            if (clusters[i].length > 0) {
                const sum = clusters[i].reduce(
                    (acc, pixel) => {
                        return [acc[0] + pixel[0], acc[1] + pixel[1], acc[2] + pixel[2]];
                    },
                    [0, 0, 0],
                );
                centroids[i] = [
                    Math.round(sum[0] / clusters[i].length),
                    Math.round(sum[1] / clusters[i].length),
                    Math.round(sum[2] / clusters[i].length),
                ];
            }
        }

        oldClusters = clusters;
    }

    // Replace each pixel with the centroid of the cluster it belongs to
    const quantizedPixels = pixels.map((pixel) => {
        let minDistance = Infinity
        let closestCentroid = [0, 0, 0]
        for (const centroid of centroids) {
            const d = distance(pixel, centroid)
            if (d < minDistance) {
                minDistance = d
                closestCentroid = centroid
            }
        }
        return closestCentroid
    })

    return quantizedPixels
}

function calculateLuminance(r, g, b) {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function calculateVibrance(r, g, b) {
    return Math.max(r, g, b) - Math.min(r, g, b)
}

export function selectDarkVibrantPixel(pixels) {
    let darkVibrantPixel;
    let maxVibrance = -1;
    let minLuminance = 256; // Luminance can't be more than 255

    for (const pixel of pixels) {
        const [r, g, b] = pixel
        const luminance = calculateLuminance(r, g, b)
        const vibrance = calculateVibrance(r, g, b)

        // Check if this pixel is darker and more vibrant than the current candidate
        if (vibrance > maxVibrance && luminance < minLuminance) {
            darkVibrantPixel = pixel
            maxVibrance = vibrance
            minLuminance = luminance
        }
    }

    return { pixel: darkVibrantPixel, vibrance: maxVibrance, luminance: minLuminance }
}

/// Conversion helpers
// All using 255 as the max value
export function hexToRGB(hex) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return [r, g, b]
}
export function rgbToHex(rgb) {
    const [r, g, b] = rgb
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}
export function rgbToHSL(rgb) {
    const [r, g, b] = rgb.map((x) => x / 255)
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2

    if (max === min) {
        h = s = 0 // achromatic
    } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0)
                break
            case g:
                h = (b - r) / d + 2
                break
            case b:
                h = (r - g) / d + 4
                break
        }
        h /= 6
    }

    return [h * 360, s * 100, l * 100]
}
export function hslToRGB(hsl) {
    const [h, s, l] = hsl.map((x, i) => (i === 0 ? x / 360 : x / 100))
    let r, g, b;

    if (s === 0) {
        r = g = b = l // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1 / 6) return p + (q - p) * 6 * t
            if (t < 1 / 2) return q
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
            return p
        }

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
    }

    return [r * 255, g * 255, b * 255]
}
