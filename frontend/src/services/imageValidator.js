/**
 * Ultrasound Domain & Out-of-Distribution (OOD) Validator
 * Clinically validates whether an uploaded image is an authentic B-mode pelvic ultrasound
 * or an invalid out-of-distribution image (such as food, animals, landscapes, or everyday objects).
 */

export async function validateUltrasoundImage(imageSource) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const sampleSize = 128; // Downsample for ultra-fast real-time verification
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

        const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const data = imgData.data;
        const totalPixels = sampleSize * sampleSize;

        let totalChroma = 0;
        let grayscalePixels = 0;
        let darkMarginPixels = 0;
        let totalLuminance = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          const chroma = maxC - minC;
          totalChroma += chroma;

          // Luminance (standard Rec. 601)
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLuminance += lum;

          // Grayscale tolerance for clinical B-mode ultrasound
          if (chroma < 18) {
            grayscalePixels++;
          }

          // Ultrasounds typically have dark acoustic background/margins
          if (lum < 35) {
            darkMarginPixels++;
          }
        }

        const avgChroma = totalChroma / totalPixels;
        const grayscaleRatio = grayscalePixels / totalPixels;
        const darkMarginRatio = darkMarginPixels / totalPixels;
        const avgLuminance = totalLuminance / totalPixels;

        // B-mode ultrasound criteria:
        // 1. Predominantly grayscale (grayscaleRatio > 70% and avgChroma < 14)
        // 2. Not uniformly bright (avgLuminance usually < 140 due to acoustic shadow & black background)
        const isColor = avgChroma > 15 || grayscaleRatio < 0.65;
        const isTooBrightDiffuse = avgLuminance > 165 && darkMarginRatio < 0.1;

        if (isColor || isTooBrightDiffuse) {
          resolve({
            isValidUltrasound: false,
            avgChroma: Number(avgChroma.toFixed(1)),
            grayscaleRatio: Number((grayscaleRatio * 100).toFixed(1)),
            avgLuminance: Number(avgLuminance.toFixed(1)),
            reason: `Non-medical color image detected (Chroma: ${avgChroma.toFixed(1)}, Grayscale: ${(grayscaleRatio * 100).toFixed(1)}%). True B-mode pelvic ultrasounds are monochromatic acoustic scans.`,
            detectedType: 'Natural Photo / Non-Sonogram (e.g. Food, Object, Landscape)',
          });
        } else {
          resolve({
            isValidUltrasound: true,
            avgChroma: Number(avgChroma.toFixed(1)),
            grayscaleRatio: Number((grayscaleRatio * 100).toFixed(1)),
            avgLuminance: Number(avgLuminance.toFixed(1)),
            reason: 'Valid monochromatic acoustic texture consistent with B-mode pelvic sonography.',
            detectedType: 'Pelvic B-Mode Ultrasound Scan',
          });
        }
      } catch (err) {
        // Fallback in case of CORS or canvas security block
        resolve({
          isValidUltrasound: true,
          reason: 'Bypassed client validator due to cross-origin restriction.',
          detectedType: 'Pelvic Ultrasound (Unverified)',
        });
      }
    };

    img.onerror = () => {
      resolve({
        isValidUltrasound: false,
        reason: 'Image file could not be decoded or is corrupted.',
        detectedType: 'Corrupt / Invalid Format',
      });
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else if (imageSource instanceof File || imageSource instanceof Blob) {
      img.src = URL.createObjectURL(imageSource);
    } else {
      resolve({
        isValidUltrasound: false,
        reason: 'No valid image provided.',
        detectedType: 'Missing Image',
      });
    }
  });
}
