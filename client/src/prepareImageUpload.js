// Leave room for multipart fields below Vercel's 4.5 MB request limit.
const MAX_UPLOAD_BYTES = 4_000_000;
const MAX_IMAGE_EDGE = 2048;

function encodeImage(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob?.size) resolve(blob);
      else reject(new Error('This photo could not be prepared. Please try another photo.'));
    }, type, quality);
  });
}

export async function prepareImageUpload(file) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file for this item.');
  if (file.size <= MAX_UPLOAD_BYTES) return file;

  const url = URL.createObjectURL(file);
  const image = new Image();
  const canvas = document.createElement('canvas');
  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('This photo could not be opened. Try a JPG, PNG or WEBP photo.'));
      image.src = url;
    });

    const context = canvas.getContext('2d');
    if (!context) throw new Error('This photo could not be prepared. Please try another browser.');

    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
    let width = Math.max(1, Math.round(image.naturalWidth * scale));
    let height = Math.max(1, Math.round(image.naturalHeight * scale));
    // WebP retains transparency; browsers without WebP encoding fall back to PNG.
    const outputType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp';

    for (let attempt = 0; attempt < 4; attempt += 1) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      for (const quality of [0.9, 0.8, 0.7]) {
        const blob = await encodeImage(canvas, outputType, quality);
        if (blob.size <= MAX_UPLOAD_BYTES) {
          const extension = { 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png' }[blob.type];
          const name = `${file.name.replace(/\.[^.]+$/, '') || 'photo'}.${extension}`;
          return new File([blob], name, { type: blob.type, lastModified: file.lastModified });
        }
        if (blob.type === 'image/png') break; // PNG encoding ignores quality.
      }
      width = Math.max(1, Math.floor(width * 0.75));
      height = Math.max(1, Math.floor(height * 0.75));
    }
    throw new Error('This photo could not be made small enough to upload. Please try another photo.');
  } finally {
    URL.revokeObjectURL(url);
    canvas.width = 0;
    canvas.height = 0;
  }
}
