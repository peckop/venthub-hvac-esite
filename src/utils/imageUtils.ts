/**
 * Compresses an image file to WebP format with a max width of 1200px.
 * Useful for optimizing uploads to Supabase Storage.
 */
export const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target?.result as string
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const MAX_WIDTH = 1200
                const scaleSize = MAX_WIDTH / img.width
                const newWidth = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width
                const newHeight = (img.width > MAX_WIDTH) ? (img.height * scaleSize) : img.height
                canvas.width = newWidth
                canvas.height = newHeight
                const ctx = canvas.getContext('2d')
                if (!ctx) { reject(new Error("Canvas context failed")); return }
                ctx.drawImage(img, 0, 0, newWidth, newHeight)
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob)
                    else reject(new Error("Compression failed"))
                }, 'image/webp', 0.8)
            }
        }
        reader.onerror = (error) => reject(error)
    })
}

/**
 * Normalizes any image URL, providing robust validation, handling local/remote paths,
 * and falling back safely to a default placeholder for missing or invalid URLs.
 */
export const normalizeImageUrl = (
  url: string | null | undefined,
  fallback: string = '/images/vortice_lineo_futuristic.png',
  bucketPrefix?: string
): string => {
  if (!url || typeof url !== 'string') return fallback;
  
  const trimmed = url.trim();
  if (trimmed.length === 0) return fallback;
  
  // Detect if the string is just a placeholder word (like "image", "test", "img", "null", "undefined")
  // by checking if it does not have a standard extension and is not a remote/absolute path.
  const hasExtension = /\.(jpg|jpeg|png|webp|gif|svg|bmp|tiff)$/i.test(trimmed);
  const isAbsolute = trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:');
  const isRootRelative = trimmed.startsWith('/');

  // If it's a placeholder word like "image" or "test" (no extension, not a URL/path)
  if (!hasExtension && !isAbsolute && !isRootRelative) {
    return fallback;
  }
  
  if (isAbsolute || isRootRelative) {
    return trimmed;
  }
  
  // Resolve Supabase storage path
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    // If we have a bucket prefix (like 'category-images') and the path doesn't already start with it, prepend it
    const pathWithBucket = bucketPrefix && !trimmed.startsWith(bucketPrefix)
      ? `${bucketPrefix}/${trimmed}`
      : trimmed;
      
    // Clean duplicate public prefix if any
    const cleanPath = pathWithBucket.replace(`${supabaseUrl}/storage/v1/object/public/`, '');
    return `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
  }
  
  return trimmed;
};




