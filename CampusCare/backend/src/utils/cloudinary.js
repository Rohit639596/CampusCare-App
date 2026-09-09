import { v2 as cloudinary } from 'cloudinary';

const configured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
if (configured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

export async function uploadImage(buffer) {
  if (!configured) return null;
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'campuscare/complaints', resource_type: 'image' }, (error, result) => {
      if (error) reject(error); else resolve(result.secure_url);
    });
    stream.end(buffer);
  });
}
