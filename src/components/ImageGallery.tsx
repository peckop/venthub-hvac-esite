import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'

interface ImageGalleryProps {
    images: { path: string; alt?: string | null }[]
    productName: string
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productName }) => {
    const [activeIdx, setActiveIdx] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({})
    const imageContainerRef = useRef<HTMLDivElement>(null)

    const activeImage = images.length > 0 ? images[activeIdx] : null
    const storageUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL + '/storage/v1/object/public/product-images/'

    // Handle Zoom Effect
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageContainerRef.current) return
        const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect()
        const x = ((e.clientX - left) / width) * 100
        const y = ((e.clientY - top) / height) * 100

        setZoomStyle({
            transformOrigin: `${x}% ${y}%`,
            transform: 'scale(2)', // Adjust zoom level
        })
    }

    const handleMouseLeave = () => {
        setZoomStyle({
            transformOrigin: 'center center',
            transform: 'scale(1)',
        })
    }

    // Navigation
    // Navigation
    const nextImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation()
        setActiveIdx((prev) => (prev + 1) % images.length)
    }, [images.length])

    const prevImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation()
        setActiveIdx((prev) => (prev - 1 + images.length) % images.length)
    }, [images.length])

    // Keyboard navigation for Lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isLightboxOpen) return
            if (e.key === 'Escape') setIsLightboxOpen(false)
            if (e.key === 'ArrowRight') nextImage()
            if (e.key === 'ArrowLeft') prevImage()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isLightboxOpen, nextImage, prevImage])

    // Lock body scroll when lightbox is open (Premium UX) - DEFINITIVE FIX
    useEffect(() => {
        if (isLightboxOpen) {
            // Must lock BOTH html and body for complete scroll prevention
            document.documentElement.style.overflow = 'hidden'
            document.body.style.overflow = 'hidden'
            document.body.style.position = 'fixed'
            document.body.style.width = '100%'
            document.body.style.top = `-${window.scrollY}px`
        } else {
            const scrollY = document.body.style.top
            document.documentElement.style.overflow = ''
            document.body.style.overflow = ''
            document.body.style.position = ''
            document.body.style.width = ''
            document.body.style.top = ''
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1)
            }
        }
        return () => {
            document.documentElement.style.overflow = ''
            document.body.style.overflow = ''
            document.body.style.position = ''
            document.body.style.width = ''
            document.body.style.top = ''
        }
    }, [isLightboxOpen])

    if (!activeImage) {
        return (
            <div className="aspect-square bg-light-gray rounded-xl flex items-center justify-center text-steel-gray">
                No Images
            </div>
        )
    }

    return (
        <div className="space-y-4 select-none">
            {/* Main Image Stage */}
            <div
                ref={imageContainerRef}
                className="relative aspect-square bg-white rounded-xl overflow-hidden border border-light-gray cursor-zoom-in group"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => setIsLightboxOpen(true)}
            >
                <div className="w-full h-full transition-transform duration-200 ease-out" style={zoomStyle}>
                    <picture>
                        <source
                            srcSet={`${storageUrl}${activeImage.path}?format=avif&quality=90&width=1200`}
                            type="image/avif"
                        />
                        <source
                            srcSet={`${storageUrl}${activeImage.path}?format=webp&quality=90&width=1200`}
                            type="image/webp"
                        />
                        <img
                            src={`${storageUrl}${activeImage.path}?width=1200`}
                            alt={activeImage.alt || productName}
                            className="w-full h-full object-contain"
                        />
                    </picture>
                </div>

                {/* Hover Hint */}
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-steel-gray">
                    <ZoomIn size={20} />
                </div>

                {/* Floating Nav Arrows (Only if multiple images) */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary-navy p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 z-10"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary-navy p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 z-10"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIdx(idx)}
                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeIdx === idx
                                ? 'border-primary-navy ring-2 ring-primary-navy/20'
                                : 'border-transparent hover:border-gray-300'
                                }`}
                        >
                            <picture>
                                <source
                                    srcSet={`${storageUrl}${img.path}?format=avif&quality=70&width=200`}
                                    type="image/avif"
                                />
                                <img
                                    src={`${storageUrl}${img.path}?format=webp&quality=70&width=200`}
                                    alt={img.alt || `${productName} view ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </picture>
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox Modal - Rendered via Portal to escape stacking context */}
            {isLightboxOpen && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
                    {/* Close Button */}
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        aria-label="Kapat"
                        className="absolute top-6 right-6 bg-white/20 hover:bg-white text-white hover:text-black p-3 rounded-full transition-all cursor-pointer"
                    >
                        <X size={28} strokeWidth={2.5} />
                    </button>

                    {/* Main Image - Force viewport scaling */}
                    <div className="w-full h-full flex items-center justify-center p-2 pt-16 pb-24">
                        <img
                            src={`${storageUrl}${activeImage.path}`}
                            alt={activeImage.alt || productName}
                            className="object-contain"
                            style={{
                                width: '90vw',
                                height: '80vh',
                                maxWidth: '100%',
                                maxHeight: '100%'
                            }}
                        />
                    </div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white text-white hover:text-black p-3 rounded-full transition-all"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white text-white hover:text-black p-3 rounded-full transition-all"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </>
                    )}

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg backdrop-blur-sm">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveIdx(idx)}
                                    className={`w-14 h-14 rounded-md overflow-hidden border-2 transition-all ${activeIdx === idx ? 'border-white' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                >
                                    <img
                                        src={`${storageUrl}${img.path}?width=100`}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>,
                document.body
            )}
        </div>
    )
}

export default ImageGallery
