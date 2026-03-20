'use client'

import React, { forwardRef } from 'react'

interface PageShellProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode
    /**
     * Sayfanın genişlik tipi. 
     * 'contained': Standart 1280px sınırlı alan (Varsayılan)
     * 'wide': 1536px geniş alan
     * 'full': Tam ekran genişliği
     */
    width?: 'contained' | 'wide' | 'full'
    /**
     * Üst ve alt dikey boşluk miktarı
     */
    spacing?: 'none' | 'sm' | 'md' | 'lg'
}

const widthStyles = {
    contained: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    wide: 'max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8',
    full: 'w-full px-4'
}

const spacingStyles = {
    none: '',
    sm: 'py-4 sm:py-6',
    md: 'py-8 sm:py-12',
    lg: 'py-12 sm:py-20'
}

/**
 * P01-016: PageShell (Yardımcı Sayfa Kabuğu)
 * Tüm sayfaların iç kenar boşluklarını ve maksimum genişliklerini
 * standartlaştıran atomik yapı bileşeni.
 */
const PageShell = forwardRef<HTMLElement, PageShellProps>(({ 
    children, 
    width = 'contained', 
    spacing = 'md',
    className = '',
    ...props
}, ref) => {
    return (
        <section 
            ref={ref}
            className={`
                ${widthStyles[width]} 
                ${spacingStyles[spacing]} 
                ${className}
            `}
            {...props}
        >
            {children}
        </section>
    )
})

PageShell.displayName = 'PageShell'

export default PageShell
