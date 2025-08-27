import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

if (!process.env.CLOUDINARY_URL) {
  throw new Error('CLOUDINARY_URL environment variable is not set.');
}


export async function uploadFile(file: Express.Multer.File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, uploadResult) => {
      if (error) {
        return reject(error);
      }
      if (!uploadResult) {
        return reject(new Error('Cloudinary upload result is undefined.'));
      }
      resolve(uploadResult.public_id);
    }).end(file.buffer);
  });
}

export function getFileUrl(publicId: string): string {
  // This generates a simple delivery URL. You can add transformations here.
  const url = cloudinary.url(publicId, { secure: true });
  return url;
}

export async function deleteFile(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}