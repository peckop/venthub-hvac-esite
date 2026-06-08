import { Box, ChevronLeft, ChevronRight, Maximize2,X } from 'lucide-react'
import dynamic from 'next/dynamic'
import React, { useCallback,useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useI18n } from '../i18n/I18nProvider'
import VentImage from './ui/VentImage'

const Product3DViewer = dynamic(
    () => import('./products/3d/Product3DViewer'),
    { ssr: false }
)

interface ImageGalleryProps {
    images: { path: string; alt?: string | null }[]
    productName: string
    slug?: string // For 3D Model
    modelType?: string // For 3D Model
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productName, slug, modelType }) => {
    const { t } = useI18n()
    const [activeIdx, setActiveIdx] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [is3DMode, setIs3DMode] = useState(false)
    const [is3DFullscreen, setIs3DFullscreen] = useState(false)
    const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({})
    const imageContainerRef = useRef<HTMLDivElement>(null)

    const activeImage = images.length > 0 ? images[activeIdx] : null

    // Handle Zoom Effect
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (is3DMode || !imageContainerRef.current) return
        const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect()
        const x = ((e.clientX - left) / width) * 100
        const y = ((e.clientY - top) / height) * 100

        setZoomStyle({
            transformOrigin: `${x}% ${y}%`,
            transform: 'scale(2)',
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

    // Keyboard & Scroll Locks
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isLightboxOpen) {
                if (e.key === 'Escape') setIsLightboxOpen(false)
                if (e.key === 'ArrowRight') nextImage()
                if (e.key === 'ArrowLeft') prevImage()
            }
            if (is3DFullscreen && e.key === 'Escape') setIs3DFullscreen(false)
        }
        window.addEventListener('keydown', handleKeyDown)
        
        const locked = isLightboxOpen || is3DFullscreen
        document.body.style.overflow = locked ? 'hidden' : ''
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [isLightboxOpen, is3DFullscreen, nextImage, prevImage])

    if (!activeImage && !slug) {
        return (
            <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                {t('common.noVisuals')}
            </div>
        )
    }

    return (
        <div className="space-y-4 select-none">
            {/* Main Container */}
            <div
                ref={imageContainerRef}
                className={`relative w-full md:max-w-55vh mx-auto aspect-square bg-white rounded-xl overflow-hidden border border-gray-200 group ${!is3DMode ? 'cursor-zoom-in' : ''}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') e.stopPropagation()
                }}
                role="presentation"
            >
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
                    activeImage ? (
                        <div className="w-full h-full transition-transform duration-200 ease-out relative z-0" style={zoomStyle}>
                            <VentImage
                                src={`product-images/${activeImage.path}`}
                                alt={activeImage.alt || productName}
                                fallbackType="product"
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 55vh"
                                className="object-contain p-4"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">{t('common.noImage')}</div>
                    )
                )}

                {/* Overlays */}
                {!is3DMode && activeImage && (
                    <div className="absolute top-3 right-16 z-50">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
                            className="bg-white/95 backdrop-blur-sm p-2 rounded-xl border border-gray-200 shadow-lg text-gray-700 hover:text-blue-600 hover:bg-white transition-shadow"
                            aria-label={t('common.viewFullscreen') || 'Tam Ekran Gör'}
                        >
                            <Maximize2 size={20} />
                        </button>
                    </div>
                )}

                {!is3DMode && slug && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIs3DMode(true); }}
                        className="absolute top-3 right-3 z-50 bg-white/95 backdrop-blur-sm hover:bg-white text-primary-navy px-2 py-1.5 rounded-lg shadow-lg border border-gray-200 flex flex-col items-center gap-0.5 transition-shadow"
                        aria-label={t('common.view3D') || '3D Model'}
                    >
                        <Box size={18} className="text-blue-600" />
                        <span className="text-xs font-bold">3D</span>
                    </button>
                )}

                {!is3DMode && images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary-navy p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-transform z-30"
                            aria-label={t('common.prev') || 'Geri'}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary-navy p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-transform z-30"
                            aria-label={t('common.next') || 'İleri'}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            <div className="flex flex-wrap gap-2">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => { setIs3DMode(false); setActiveIdx(idx); }}
                        className={`relative w-16 h-16 aspect-square rounded-lg overflow-hidden border-2 transition-colors ${!is3DMode && activeIdx === idx
                            ? 'border-primary-navy ring-2 ring-primary-navy/20'
                            : 'border-transparent hover:border-gray-300'
                            }`}
                        aria-label={`${productName} thumbnail ${idx + 1}`}
                    >
                        <VentImage
                            src={`product-images/${img.path}`}
                            alt={img.alt || `${productName} view ${idx + 1}`}
                            fallbackType="product"
                            fill
                            sizes="64px"
                            className="object-cover"
                        />
                    </button>
                ))}
            </div>

            {/* Lightbox Portal */}
            {isLightboxOpen && createPortal(
                <div className="fixed inset-0 z-toast bg-black/95 backdrop-blur-md flex items-center justify-center">
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors z-50"
                        aria-label={t('common.close') || 'Kapat'}
                    >
                        <X size={28} />
                    </button>

                    <div className="w-full h-full flex items-center justify-center p-4">
                        {activeImage && (
                            <VentImage
                                src={`product-images/${activeImage.path}`}
                                alt={activeImage.alt || productName}
                                fallbackType="product"
                                width={1200}
                                height={1200}
                                className="object-contain max-h-90vh max-w-90vw"
                            />
                        )}
                    </div>

                    {images.length > 1 && (
                        <>
                            <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-transform" aria-label={t('common.prev') || 'Geri'}>
                                <ChevronLeft size={32} />
                            </button>
                            <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-transform" aria-label={t('common.next') || 'İleri'}>
                                <ChevronRight size={32} />
                            </button>

                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/20 rounded-xl backdrop-blur-sm">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveIdx(idx)}
                                        className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${activeIdx === idx ? 'border-white ring-2 ring-white/20' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                        aria-label={`Go to image ${idx + 1}`}
                                    >
                                        <VentImage src={`product-images/${img.path}`} alt="" fill sizes="56px" className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>,
                document.body
            )}

            {/* 3D Portal */}
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

export default React.memo(ImageGallery)



