import { NewsTemplate } from "../types";

const fetchImageAsDataUrl = (imageUrl: string): Promise<string> =>
  new Promise((resolve, reject) => {
    fetch(imageUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load template image: ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read template image data"));
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });

/**
 * Fetches a template image and returns a data URL for Gemini.
 * Falls back to a generated layout preview if no template image is provided.
 */
export const getTemplateReferenceImage = (template: NewsTemplate): Promise<string> => {
  // If it's a custom uploaded template, return the image directly
  if (template.customImageBase64) {
    if (!template.customImageBase64.startsWith('data:')) {
        return Promise.resolve(`data:image/png;base64,${template.customImageBase64}`);
    }
    return Promise.resolve(template.customImageBase64);
  }

  if (template.templateImageUrl) {
    return fetchImageAsDataUrl(template.templateImageUrl);
  }

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve('');
      return;
    }

    // Clear background (transparent)
    ctx.clearRect(0, 0, 1024, 1024);

    // Use a very faint placeholder background to define the bounds, 
    // helping the model understand the "empty space" where the photo goes.
    ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
    ctx.fillRect(0, 0, 1024, 1024);

    if (!template.layoutConfig) {
        resolve(canvas.toDataURL('image/png'));
        return;
    }

    const { primaryColor, secondaryColor, overlayStyle } = template.layoutConfig;

    if (overlayStyle === 'bottom-banner') {
      // Draw standard lower third banner - HIGH CONTRAST
      const bannerHeight = 250;
      const y = 1024 - bannerHeight;
      
      // Left Red - Opaque
      ctx.fillStyle = primaryColor;
      ctx.fillRect(0, y, 512, bannerHeight);
      
      // Right Blue - Opaque
      ctx.fillStyle = secondaryColor;
      ctx.fillRect(512, y, 512, bannerHeight);
      
      // Placeholder Text Lines to guide text placement
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(50, y + 60, 400, 30);
      ctx.fillRect(50, y + 110, 300, 30);

      // Add a Logo placeholder
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(950, y + 125, 50, 0, Math.PI * 2);
      ctx.fill();

    } else if (overlayStyle === 'modern-gradient') {
      // Draw futuristic gradient overlay
      const gradient = ctx.createLinearGradient(0, 500, 0, 1024);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.5)'); // Darken transition
      gradient.addColorStop(0.7, primaryColor); // Solid color at bottom
      gradient.addColorStop(1, primaryColor);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1024, 1024);

      // Neon accent line - Thick
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.moveTo(0, 850);
      ctx.lineTo(1024, 850);
      ctx.stroke();

    } else if (overlayStyle === 'pop-frame') {
      // Thick border frame - VERY SOLID
      const borderWidth = 50;
      ctx.fillStyle = secondaryColor; 
      ctx.fillRect(0, 0, 1024, 1024);
      
      // Cut out center 
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillRect(borderWidth, borderWidth, 1024 - (borderWidth * 2), 1024 - (borderWidth * 2));
      
      // Reset composite to draw graphics
      ctx.globalCompositeOperation = 'source-over';
      
      // Sticker in bottom right
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.arc(900, 900, 120, 0, Math.PI * 2);
      ctx.fill();
    }

    resolve(canvas.toDataURL('image/png'));
  });
};
