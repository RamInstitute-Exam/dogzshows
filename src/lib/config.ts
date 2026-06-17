const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    console.error('❌ FATAL ERROR: NEXT_PUBLIC_API_URL is missing in .env.local. Please configure it to point to your backend (e.g. http://localhost:5001/api/v1)');
  }
  return url || 'http://127.0.0.1:5001/api/v1';
};

if (!process.env.NODE_ENV) {
  console.warn('⚠️ WARNING: NODE_ENV is undefined. Defaulting to development.');
}

export const config = {
  apiUrl: getApiUrl(),

  uploadUrl: process.env.NEXT_PUBLIC_UPLOAD_URL || 'https://s3.ap-south-1.amazonaws.com/namma-orru-foods/images',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'JuzDog',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  paginationLimit: 10,
  defaultImage: '/images/placeholder.webp',
  defaultAvatar: '/images/avatar-placeholder.png'
};
