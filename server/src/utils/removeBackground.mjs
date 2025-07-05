import fetch from 'node-fetch';

export const removeBackgroundWithRemoveBg = async (imageBuffer) => {
  try {
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVE_BG_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_file_b64: imageBuffer.toString('base64'),
        size: 'auto'
      })
    });

    if (!response.ok) {
      throw new Error(`Remove.bg API error: ${response.status}`);
    }

    const buffer = await response.buffer();
    return buffer;
  } catch (error) {
    console.error('Remove.bg error:', error);
    throw error;
  }
}; 