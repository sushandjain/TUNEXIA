/**
 * Cloudinary & Media Optimization Utility for Tunexia
 * Transforms URLs to serve modern formats (WebP/AVIF), auto-quality, and responsive sizes.
 */

/**
 * Optimizes an image URL (Cloudinary, Picsum, or generic).
 * @param {string} url - The original image URL
 * @param {object} options - Transformation options { width, height, crop, quality, format }
 * @returns {string} - The optimized URL
 */
export function getOptimizedUrl(url, options = {}) {
    if (!url || typeof url !== 'string') return '';

    const {
        width,
        height,
        crop = 'fill',
        quality = 'auto',
        format = 'auto'
    } = options;

    // 1. Cloudinary URL optimization
    if (url.includes('res.cloudinary.com')) {
        // Pattern: .../image/upload/(v12345/)?...
        const uploadIndex = url.indexOf('/image/upload/');
        if (uploadIndex !== -1) {
            const prefix = url.substring(0, uploadIndex + '/image/upload/'.length);
            const rest = url.substring(uploadIndex + '/image/upload/'.length);

            // Avoid duplicating existing transformation segment
            if (/^(f_[^/]+|q_[^/]+|w_[^/]+|c_[^/]+)/.test(rest)) {
                return url;
            }

            const transforms = [`f_${format}`, `q_${quality}`];
            if (width) transforms.push(`w_${Math.round(width)}`);
            if (height) transforms.push(`h_${Math.round(height)}`);
            if (width || height) transforms.push(`c_${crop}`);

            return `${prefix}${transforms.join(',')}/${rest}`;
        }
    }

    // 2. Picsum Photos optimization (used in sample/seed data)
    if (url.includes('picsum.photos')) {
        // Example: https://picsum.photos/seed/hindi-hits/600/600 -> replace 600/600 with width/height
        const targetWidth = width ? Math.round(width) : 300;
        const targetHeight = height ? Math.round(height) : (width ? Math.round(width) : 300);
        return url.replace(/\/\d+\/\d+$/, `/${targetWidth}/${targetHeight}`);
    }

    return url;
}

/**
 * Returns a srcset string for responsive images.
 * @param {string} url - Base image URL
 * @param {number[]} widths - List of widths, e.g. [160, 320, 480]
 * @returns {string} - srcset attribute value
 */
export function getResponsiveSrcSet(url, widths = [160, 320, 480]) {
    if (!url) return '';
    return widths
        .map(w => `${getOptimizedUrl(url, { width: w, height: w })} ${w}w`)
        .join(', ');
}

/**
 * Returns a low-quality blurred placeholder URL (LQIP).
 * @param {string} url - Original image URL
 * @returns {string}
 */
export function getLqipUrl(url) {
    return getOptimizedUrl(url, { width: 24, height: 24, quality: 30 });
}
