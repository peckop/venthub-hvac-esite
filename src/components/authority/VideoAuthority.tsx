'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Volume2, VolumeX } from 'lucide-react'
import type { VideoMetadata } from '../../types/media.types'

interface VideoAuthorityProps {
    metadata: VideoMetadata
    className?: string
}

/**
 * P01-012: VideoAuthority
 * Merkezi video yönetim bileşeni. Farklı sağlayıcılardan (Cloudflare, YouTube)
 * gelen videoları tek bir standartta render eder.
 */
export default function VideoAuthority({ metadata, className = '' }: VideoAuthorityProps) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isMuted, setIsMuted] = useState(metadata.options?.muted ?? true)

    const renderPlayer = () => {
        switch (metadata.provider) {
            case 'cloudflare':
                return (
                    <iframe
                        title={metadata.title || "Cloudflare Video Player"}
                        src={`https://${process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN || 'customer-XXXXX.cloudflarestream.com'}/${metadata.id}/iframe?autoplay=${metadata.options?.autoPlay ? 'true' : 'false'}&muted=${isMuted ? 'true' : 'false'}`}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                        onLoad={() => setIsLoaded(true)}
                    />
                )
            case 'youtube':
                return (
                    <iframe
                        title={metadata.title || "YouTube Video Player"}
                        src={`https://www.youtube.com/embed/${metadata.id}?autoplay=${metadata.options?.autoPlay ? 1 : 0}&mute=${isMuted ? 1 : 0}&loop=${metadata.options?.loop ? 1 : 0}&controls=${metadata.options?.controls ? 1 : 0}`}
                        className="absolute inset-0 w-full h-full"
                        allowFullScreen
                        onLoad={() => setIsLoaded(true)}
                    />
                )
            default:
                return (
                    <div className="flex items-center justify-center bg-slate-100 h-full">
                        <p className="text-xs font-bold text-slate-400 uppercase">Unsupported Provider</p>
                    </div>
                )
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative overflow-hidden rounded-2xl bg-slate-900 group ${className}`}
            style={{ aspectRatio: metadata.aspectRatio === 'vertical' ? '9/16' : '16/9' }}
        >
            {/* Thumbnail Fallback */}
            {!isLoaded && metadata.thumbnailUrl && (
                <img 
                    src={metadata.thumbnailUrl} 
                    alt={metadata.title} 
                    className="absolute inset-0 w-full h-full object-cover blur-sm opacity-50"
                />
            )}

            {/* Video Player */}
            {renderPlayer()}

            {/* Overlay Controls (Standardized) */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center space-x-2">
                        <span className="bg-primary-navy/80 text-white p-2 rounded-full backdrop-blur-md">
                            <Play size={12} fill="currentColor" />
                        </span>
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">{metadata.title}</span>
                    </div>
                    
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
