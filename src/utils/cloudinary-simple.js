// Simple Cloudinary Util - Direct URLs Only
export const CLOUDINARY_CONFIG = {
  cloudName: 'df74ywsgg',
  baseUrl: 'https://res.cloudinary.com/df74ywsgg/image/upload'
};

// Simple function untuk News images
export function getNewsImageUrl(filename, isMobile = false) {
  // Return placeholder jika filename kosong
  if (!filename || filename === 'sample-news') {
    return isMobile 
      ? 'https://via.placeholder.com/80x80/4A90E2/ffffff?text=News'
      : 'https://via.placeholder.com/400x250/4A90E2/ffffff?text=News';
  }
  
  // Clean filename
  let publicId = filename;
  if (filename.includes('cloudinary.com')) {
    const parts = filename.split('/');
    publicId = parts[parts.length - 1].split('.')[0];
  } else if (filename.includes('.')) {
    publicId = filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
  }
  
  // Simple transform berdasarkan device
  const transform = isMobile ? 'w_80,h_80,c_fill' : 'w_400,h_250,c_fill';
  
  // Try original first, fallback ke sample
  return `${CLOUDINARY_CONFIG.baseUrl}/${transform}/${publicId}`;
}

// Simple function untuk Jadwal images  
export function getJadwalImageUrl(filename, isMobile = false) {
  if (!filename) {
    return isMobile 
      ? 'https://via.placeholder.com/80x80/28A745/ffffff?text=Event'
      : 'https://via.placeholder.com/400x250/28A745/ffffff?text=Event';
  }
  
  let publicId = filename;
  if (filename.includes('cloudinary.com')) {
    const parts = filename.split('/');
    publicId = parts[parts.length - 1].split('.')[0];
  } else if (filename.includes('.')) {
    publicId = filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
  }
  
  const transform = isMobile ? 'w_80,h_80,c_fill' : 'w_400,h_250,c_fill';
  return `${CLOUDINARY_CONFIG.baseUrl}/${transform}/${publicId}`;
}

// Simple function untuk Renungan images
export function getRenunganImageUrl(filename, isMobile = false) {
  if (!filename) {
    return isMobile 
      ? 'https://via.placeholder.com/80x80/DC3545/ffffff?text=Devotion'
      : 'https://via.placeholder.com/400x250/DC3545/ffffff?text=Devotion';
  }
  
  let publicId = filename;
  if (filename.includes('cloudinary.com')) {
    const parts = filename.split('/');
    publicId = parts[parts.length - 1].split('.')[0];
  } else if (filename.includes('.')) {
    publicId = filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
  }
  
  const transform = isMobile ? 'w_80,h_80,c_fill' : 'w_400,h_250,c_fill';
  return `${CLOUDINARY_CONFIG.baseUrl}/${transform}/${publicId}`;
}
