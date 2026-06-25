'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
}

export function SafeImage({ 
  src, 
  fallbackSrc = '/images/placeholder.webp', 
  alt, 
  ...props 
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  React.useEffect(() => {
    setImgSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <Image
      src={imgSrc}
      alt={alt || 'Image'}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
      {...props}
    />
  );
}
