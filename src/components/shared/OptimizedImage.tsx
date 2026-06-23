import React from 'react';
import { getOptimizedUrl } from '@/lib/api';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  width?: number; // Target width for optimization
}

export default function OptimizedImage({ src, alt, className, width = 800, ...props }: OptimizedImageProps) {
  // Pass the raw src to getOptimizedUrl. It safely handles nulls, local paths, and external S3 URLs.
  const optimizedSrc = getOptimizedUrl(src, width);

  return (
    <img 
      src={optimizedSrc} 
      alt={alt} 
      className={className} 
      loading={props.loading || "lazy"} 
      {...props} 
    />
  );
}
