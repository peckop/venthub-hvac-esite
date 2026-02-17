import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X, Box, Maximize2 } from 'lucide-react'
import { Product3DViewer } from './products/3d/Product3DViewer'

interface ImageGalleryProps {
    images: { path: string; alt?: string | null }[]
    productName: string
    slug?: string // For 3D Model
    modelType?: string // For 3D Model
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productName, slug, modelType }) => {
    const [activeIdx, setActiveIdx] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false) // Only for Images
    const [is3DMode, setIs3DMode] = useState(false) // Toggle between Image and 3D in the square container
    const [is3DFullscreen, setIs3DFullscreen] = useState(false) // Dedicated 3D Fullscreen
    const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({})
    const imageContainerRef = useRef<HTMLDivElement>(null)

    const activeImage = images.length > 0 ? images[activeIdx] : null
    const storageUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL + '/storage/v1/object/public/product-images/'

    // Handle Zoom Effect (Only for Image Mode)
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (is3DMode || !imageContainerRef.current) return
        const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect()
        const x = ((e.clientX - left) / width) * 100
        const y = ((e.clientY - top) / height) * 100

        setZoomStyle({
            transformOrigin: `${x}% ${y}% `,
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
    const nextImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation()
        setActiveIdx((prev) => (prev + 1) % images.length)
    }, [images.length])

    const prevImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation()
        setActiveIdx((prev) => (prev - 1 + images.length) % images.length)
    }, [images.length])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Image Lightbox Nav
            if (isLightboxOpen) {
                if (e.key === 'Escape') setIsLightboxOpen(false)
                if (e.key === 'ArrowRight') nextImage()
                if (e.key === 'ArrowLeft') prevImage()
            }
            // 3D Fullscreen Nav
            if (is3DFullscreen) {
                if (e.key === 'Escape') setIs3DFullscreen(false)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isLightboxOpen, is3DFullscreen, nextImage, prevImage])

    // Lock body scroll
    useEffect(() => {
        const locked = isLightboxOpen || is3DFullscreen
        if (locked) {
            document.documentElement.style.overflow = 'hidden'
            document.body.style.overflow = 'hidden'
        } else {
            document.documentElement.style.overflow = ''
            document.body.style.overflow = ''
        }
        return () => {
            document.documentElement.style.overflow = ''
            document.body.style.overflow = ''
        }
    }, [isLightboxOpen, is3DFullscreen])


    if (!activeImage && !slug) {
        return (
            <div className="aspect-square bg-light-gray rounded-xl flex items-center justify-center text-steel-gray">
                No Visuals
            </div>
        )
    }

    return (
        <div className="space-y-4 select-none">
            {/* Main Container (Square) - Adjusted for Laptop Screens (max-h-55vh equiv) */}
            <div
                ref={imageContainerRef}
                className={`relative w - full md: max - w - [55vh] mx - auto aspect - square bg - white rounded - xl overflow - hidden border border - light - gray group ${!is3DMode ? 'cursor-zoom-in' : ''} `}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                // Image mode click -> Open Lightbox
                // Image mode click -> Disable auto fullscreen
                onClick={(e) => e.stopPropagation()}
            >
                {/* MODE: 3D VIEWER (Inline) */}
                {is3DMode ? (
                    <div className="w-full h-full relative">
                        <Product3DViewer
                            slug={slug}
                            modelType={modelType}
                            isFullscreen={false}
                            onToggleFullscreen={() => setIs3DFullscreen(true)}
                            onClose={() => setIs3DMode(false)}
                        />
                    </div>
                ) : (
                    /* MODE: IMAGE VIEWER (Inline) */
                    activeImage ? (
                        <div className="w-full h-full transition-transform duration-200 ease-out relative z-0" style={zoomStyle}>
                            <picture>
                                <source
                                    srcSet={`${storageUrl}${activeImage.path}?format = avif & quality=90 & width=1200`}
                                    type="image/avif"
                                />
                                <source
                                    srcSet={`${storageUrl}${activeImage.path}?format = webp & quality=90 & width=1200`}
                                    type="image/webp"
                                />
                                <img
                                    src={`${storageUrl}${activeImage.path}?width = 1200`}
                                    alt={activeImage.alt || productName}
                                    className="w-full h-full object-contain"
                                />
                            </picture>
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">Görsel Yok</div>
                    )
                )}

                {/* ── OVERLAY ICONS (Always on top, outside conditional) ──────── */}
                {/* These are OUTSIDE the zoom div to avoid stacking context issues */}

                {/* Fullscreen Icon (Top Right) — Image mode only */}
                {!is3DMode && activeImage && (
                    <div className="absolute top-3 right-3 z-50 pointer-events-auto">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
                            className="bg-white/95 backdrop-blur-sm p-2.5 rounded-xl border border-gray-200/80 shadow-lg text-gray-700 hover:text-blue-600 hover:bg-white hover:shadow-xl transition-all"
                            title="Tam Ekran Görüntüle"
                        >
                            <Maximize2 size={22} strokeWidth={1.8} />
                        </button>
                    </div>
                )}

                {/* 3D Toggle Button (Top Right - Left of Fullscreen) */}
                {!is3DMode && slug && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIs3DMode(true); }}
                        className="absolute top-3 right-16 z-50 pointer-events-auto bg-white/95 backdrop-blur-sm hover:bg-white text-primary-navy px-3 py-2 rounded-xl shadow-lg border border-gray-200/80 flex items-center gap-2 transition-all hover:shadow-xl group"
                    >
                        <div className="bg-blue-50 p-1 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                            <Box size={16} strokeWidth={2} />
                        </div>
                        <span className="text-xs font-bold tracking-wide">3D İNCELE</span>
                    </button>
                )}



                {/* Floating Nav Arrows (Image Mode Only) */}
                {!is3DMode && images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary-navy p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 z-30 pointer-events-auto"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary-navy p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 z-30 pointer-events-auto"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

            </div>


            {/* Thumbnail Strip + 3D Toggle */}
            <div className="flex flex-wrap gap-2">

                {/* 3D Model Thumbnail Toggle */}
                {slug && (
                    <button
                        type="button"
                        onClick={() => setIs3DMode(true)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center bg-gray-50 group shrink-0 ${is3DMode
                            ? 'border-primary-navy ring-2 ring-primary-navy/20'
                            : 'border-transparent hover:border-gray-300'
                            }`}
                        title="3D Modeli İncele"
                    >
                        <div className="flex flex-col items-center gap-1">
                            <Box size={20} className={`transition-colors ${is3DMode ? 'text-primary-navy' : 'text-gray-400 group-hover:text-primary-navy'}`} />
                            <span className={`text-[10px] font-bold ${is3DMode ? 'text-primary-navy' : 'text-gray-500 group-hover:text-primary-navy'}`}>3D</span>
                        </div>
                    </button>
                )}

                {/* Image Thumbnails */}
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => { setIs3DMode(false); setActiveIdx(idx); }}
                        className={`aspect - square rounded - lg overflow - hidden border - 2 transition - all ${!is3DMode && activeIdx === idx
                            ? 'border-primary-navy ring-2 ring-primary-navy/20'
                            : 'border-transparent hover:border-gray-300'
                            } `}
                    >
                        <picture>
                            <img
                                src={`${storageUrl}${img.path}?format = webp & quality=70 & width=200`}
                                alt={img.alt || `${productName} view ${idx + 1} `}
                                className="w-full h-full object-cover"
                            />
                        </picture>
                    </button>
                ))}
            </div>

            {/* PORTAL: Image Lightbox (Existing Logic) */}
            {isLightboxOpen && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute top-6 right-6 bg-white/20 hover:bg-white text-white hover:text-black p-3 rounded-full transition-all cursor-pointer z-50 shadow-lg"
                    >
                        <X size={28} strokeWidth={2.5} />
                    </button>

                    <div className="w-full h-full flex items-center justify-center p-4">
                        {activeImage && (
                            <img
                                src={`${storageUrl}${activeImage.path} `}
                                alt={activeImage.alt || productName}
                                className="object-contain max-h-[90vh] max-w-[90vw]"
                            />
                        )}
                    </div>

                    {images.length > 1 && (
                        <>
                            <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white text-white hover:text-black p-3 rounded-full transition-all">
                                <ChevronLeft size={32} />
                            </button>
                            <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white text-white hover:text-black p-3 rounded-full transition-all">
                                <ChevronRight size={32} />
                            </button>

                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg backdrop-blur-sm">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveIdx(idx)}
                                        className={`w - 14 h - 14 rounded - md overflow - hidden border - 2 transition - all ${activeIdx === idx ? 'border-white' : 'border-transparent opacity-50 hover:opacity-100'} `}
                                    >
                                        <img src={`${storageUrl}${img.path}?width = 100`} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>,
                document.body
            )}

            {/* PORTAL: 3D Fullscreen Viewer (New Professional Logic) */}
            {is3DFullscreen && createPortal(
                <Product3DViewer
                    slug={slug}
                    modelType={modelType}
                    isFullscreen={true}
                    onToggleFullscreen={() => setIs3DFullscreen(false)}
                    onClose={() => setIs3DFullscreen(false)}
                />,
                document.body
            )}
        </div>
    )
}

export default ImageGallery
