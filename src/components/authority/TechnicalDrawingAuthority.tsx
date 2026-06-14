'use client'

import { motion } from 'framer-motion'
import { Clock, Download, FileText, Info } from 'lucide-react'
import React from 'react'

import type { TechnicalDrawingMetadata } from '../../types/media.types'

const VERSION_PREFIX = 'v'

interface TechnicalDrawingAuthorityProps {
    drawings: TechnicalDrawingMetadata[]
    className?: string
}

const formatColors = {
    pdf: 'bg-red-50 text-red-600 border-red-100',
    dwg: 'bg-blue-50 text-blue-600 border-blue-100',
    svg: 'bg-orange-50 text-orange-600 border-orange-100',
    png: 'bg-green-50 text-green-600 border-green-100'
}

/**
 * P01-012: TechnicalDrawingAuthority
 * Teknik doküman ve çizimlerin otorite standartlarında sergilenmesi.
 * Versiyon takibi ve format bazlı görsel ayrıştırma içerir.
 */
export default function TechnicalDrawingAuthority({ drawings, className = '' }: TechnicalDrawingAuthorityProps) {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
            {drawings.map((doc, idx) => (
                <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 hover:border-primary-navy/30 hover:shadow-md transition-shadow group"
                >
                    <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${formatColors[doc.format] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                            <FileText size={20} />
                        </div>
                        
                        <div className="flex flex-col">
                            <div className="flex items-center space-x-2">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{doc.category}</span>
                                {doc.version && (
                                    <span className="bg-slate-100 text-slate-500 text-xs font-bold px-1.5 py-0.5 rounded uppercase">{VERSION_PREFIX}{doc.version}</span>
                                )}
                            </div>
                            <h4 className="text-sm font-black text-industrial-gray leading-tight group-hover:text-primary-navy transition-colors">
                                {doc.title}
                            </h4>
                            <div className="flex items-center space-x-3 mt-1 text-xs text-slate-400 font-bold uppercase tracking-tight">
                                <span className="flex items-center"><Info size={10} className="mr-1" /> {doc.format.toUpperCase()}</span>
                                {doc.lastUpdated && <span className="flex items-center"><Clock size={10} className="mr-1" /> {doc.lastUpdated}</span>}
                            </div>
                        </div>
                    </div>

                    <a
                        href={doc.url}
                        download
                        className="p-3 bg-slate-50 hover:bg-primary-navy text-slate-400 hover:text-white rounded-xl transition-shadow shadow-sm"
                        title="Download Drawing"
                    >
                        <Download size={18} />
                    </a>
                </motion.div>
            ))}
        </div>
    )
}
