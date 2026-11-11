function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error('An item is missing its image.'));
      return;
    }
    const image = new Image();
    const timeout = setTimeout(() => finish(new Error('An image took too long to load. Try again.')), 15000);
    const finish = (error) => {
      clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
      if (error) reject(error);
      else resolve(image);
    };
    image.crossOrigin = 'anonymous';
    image.onload = () => finish();
    image.onerror = () => finish(new Error('Could not load an item image for export. Its host may block downloads.'));
    image.src = src;
  });
}

// Render from the same piece positions as OutfitCanvas, without selection tools.
export async function exportOutfit(pieces, name = 'Untitled outfit') {
  if (!pieces.length) throw new Error('Add an item before exporting this outfit.');
  const ordered = [...pieces].sort((a, b) => a.z - b.z);
  const images = await Promise.all(ordered.map((piece) => loadImage(piece.item.imageLink)));
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1215; // Match the saved card's 8:9 outfit preview.
  const margin = 54;
  canvas.width = width + margin * 2;
  canvas.height = height + margin * 2 + 130;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser could not create the image.');

  context.fillStyle = '#faf7f1';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.translate(margin, margin);
  context.beginPath();
  context.roundRect(0, 0, width, height, 24);
  context.clip();
  context.fillStyle = '#eee8de';
  context.fillRect(0, 0, width, height);

  ordered.forEach((piece, index) => {
    const image = images[index];
    const size = width * .34;
    const ratio = Math.min(size / image.naturalWidth, size / image.naturalHeight);
    const imageWidth = image.naturalWidth * ratio;
    const imageHeight = image.naturalHeight * ratio;
    context.save();
    context.translate(piece.x / 100 * width, piece.y / 100 * height);
    context.rotate(piece.rotate * Math.PI / 180);
    context.scale(piece.scale, piece.scale);
    context.shadowColor = 'rgba(87,64,52,.16)';
    context.shadowBlur = 21;
    context.shadowOffsetY = 36;
    context.drawImage(image, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
    context.restore();
  });
  context.restore();

  context.fillStyle = '#4e3932';
  context.font = '24px sans-serif';
  context.fillText('MALABIS · MY OUTFITS', margin, height + margin + 56);
  context.fillStyle = '#3f332f';
  context.font = '600 42px sans-serif';
  context.fillText(name, margin, height + margin + 114, width);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error('The image could not be created. Try again.')), 'image/png');
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const filename = Array.from(name, (character) => character.charCodeAt(0) < 32 ? '-' : character)
    .join('').replace(/[<>:"/\\|?*]/g, '-').replace(/[. ]+$/g, '').trim().slice(0, 80);
  link.download = `${filename || 'outfit'}.png`;
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    // Give the browser time to start consuming the download before releasing it.
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}
