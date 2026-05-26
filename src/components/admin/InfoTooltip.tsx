import React from 'react'
import { Info } from 'lucide-react'

interface InfoTooltipProps {
    text: string
    size?: number
    className?: string
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, size = 14, className = '' }) => {
    return (
        <div className={`relative group inline-flex items-center justify-center ml-1 align-middle ${className}`}>
            <Info size={size} className="text-slate-400 hover:text-primary-navy cursor-help transition-colors" />

            {/* Tooltip kutusu (Tailwind Group-Hover ile açılır) */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3 py-2 bg-slate-800 text-white text-xs leading-relaxed rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-transform duration-200 z-50 shadow-xl whitespace-normal normal-case font-normal text-left pointer-events-none">
                {text}

                {/* Ok (Triangle) */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
            </div>
        </div>
    )
}

export default InfoTooltip
