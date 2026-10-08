import React, { useState } from 'react';
import { getOptimizedUrl, getResponsiveSrcSet } from '../../utils/mediaOptimizer';

/**
 * High-performance responsive image component
 * - Lazy loaded with decoding="async"
 * - Automatically transforms Cloudinary / Picsum URLs to optimal size/format
 * - Skeleton loading state to prevent Cumulative Layout Shift (CLS)
 */
const OptimizedImage = ({
    src,
    alt = '',
    className = '',
    width,
    height,
    sizes = '(max-width: 640px) 160px, (max-width: 1024px) 240px, 300px',
    responsiveWidths = [160, 240, 360],
    fallbackIcon,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const optimizedSrc = getOptimizedUrl(src, { width, height });
    const srcSet = responsiveWidths ? getResponsiveSrcSet(src, responsiveWidths) : undefined;

    return (
        <div className={`relative overflow-hidden bg-neutral-800 ${className}`}>
            {/* Shimmer skeleton while loading */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 animate-pulse" />
            )}

            {/* Actual image */}
            {!hasError ? (
                <img
                    src={optimizedSrc}
                    srcSet={srcSet}
                    sizes={sizes}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    width={width}
                    height={height}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasError(true)}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    {...props}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-500 text-xs">
                    {fallbackIcon || '🎵'}
                </div>
            )}
        </div>
    );
};

export default React.memo(OptimizedImage);
