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

export const deleteCloudinaryImages = async (publicIds) => {
  if (!publicIds.length) return;
  configureCloudinary();

  // A missing asset is already deleted. Keep the account when any other deletion fails
  // so the remaining image IDs are available for a retry.
  for (const publicId of new Set(publicIds)) {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(`Could not delete uploaded image: ${publicId}`);
    }
  }
};

export default cloudinary;
