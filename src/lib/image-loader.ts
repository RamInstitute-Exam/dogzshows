export default function customImageLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
  // Bypass optimization in development or for local development servers
  if (
    process.env.NODE_ENV === 'development' ||
    src.includes('localhost') ||
    src.includes('127.0.0.1') ||
    src.includes('192.168.') ||
    src.includes('0.0.0.0')
  ) {
    return `${src}${src.includes('?') ? '&' : '?'}w=${width}`;
  }

  // If it's already a wsrv.nl URL, return as is
  if (src.includes('wsrv.nl')) {
    return src;
  }
  
  if (src.startsWith('/')) {
    // Append width and quality to satisfy next/image loader check
    return `${src}?w=${width}&q=${quality || 75}`;
  }
  
  // Use wsrv.nl to proxy and resize the image from AWS S3 (or any external URL)
  return `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}&output=webp`;
}
