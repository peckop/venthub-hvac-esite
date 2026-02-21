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



