/**
 * Assets and constants for PDF generation
 */

// Roboto font URLs from reliable CDN (for runtime loading)
export const PDF_FONTS = {
    Roboto: {
        regular: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf',
        medium: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf',
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Bold.ttf'
    }
};

export const PDF_COLORS = {
    primary: [27, 43, 75],     // Navy #1B2B4B
    secondary: [59, 130, 246],  // Blue #3B82F6
    accent: [245, 158, 11],    // Orange #F59E0B
    text: [55, 65, 81],        // Dark Gray #374151
    lightText: [107, 114, 128], // Gray #6B7280
    border: [229, 231, 235],    // Light Gray #E5E7EB
    white: [255, 255, 255]
};

/**
 * Converts an image URL to a Base64 string for embedding in PDF.
 * Uses Canvas to ensure the output is a 100% PDF-compatible JPEG format
 * regardless of whether the source is WEBP, PNG, etc.
 */
export async function getBase64ImageFromUrl(imageUrl: string): Promise<string> {
    if (!imageUrl) return '';
    try {
        // Fetch as blob first to avoid canvas CORS tainting issues
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Optional: You can scale down huge images here if needed
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    // Fill white background in case of transparent PNG/WEBP
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    // Export as highest quality JPEG for jsPDF compatibility
                    const dataURL = canvas.toDataURL('image/jpeg', 0.95);
                    URL.revokeObjectURL(objectUrl);
                    resolve(dataURL);
                } else {
                    URL.revokeObjectURL(objectUrl);
                    reject(new Error('Canvas context not available'));
                }
            };
            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error('Image could not be loaded into canvas'));
            };
            img.src = objectUrl;
        });
    } catch (error) {
        console.error('Error converting image to Canvas Base64:', error);
        return '';
    }
}

/**
 * VentHub Logo - Base64 SVG Placeholder
 */
