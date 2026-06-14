export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1',
  uploadUrl: process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:5001/uploads',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'JuzDog',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  paginationLimit: 10,
  defaultImage: '/placeholder.jpg',
  defaultAvatar: '/avatar-placeholder.png'
};
