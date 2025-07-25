import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file, removeBackground = true) => {
  try {
    const processedImageBuffer = await sharp(file.buffer)
      // Ensure alpha channel is present -> allows transparent bgs
      .png({ force: true })
      .ensureAlpha()
      .toBuffer();
    
    const b64 = processedImageBuffer.toString('base64');
    const dataURI = `data:image/png;base64,${b64}`;
    
    const uploadOptions = {
      folder: 'malabis-clothing',
      resource_type: 'auto',
      transformation: [
        ...(removeBackground ? [{ effect: 'background_removal' }] : []),
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' }
      ]
    };

    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default cloudinary; 