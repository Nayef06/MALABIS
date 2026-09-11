import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Image upload service is not configured.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export const uploadToCloudinary = async (file, removeBackground = true) => {
  try {
    configureCloudinary();
    const processedImageBuffer = await sharp(file.buffer)
      .png({ force: true })
      .ensureAlpha()
      .toBuffer();

    const b64 = processedImageBuffer.toString("base64");
    const dataURI = `data:image/png;base64,${b64}`;

    const uploadOptions = {
      folder: "malabis-clothing",
      resource_type: "auto",
      transformation: [
        ...(removeBackground ? [{ effect: "background_removal" }] : []),
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto" },
      ],
    };

    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default cloudinary;
