export default function customImageLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
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
