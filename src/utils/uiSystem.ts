/**
 * VentHub Central UI Control System
 * Standardizes typography, spacing, and container scales across the application.
 */

export const UI_SYSTEM = {
    /** Typography System - Based on 'Inter' regular/medium/semibold hierarchy */
    typography: {
        // Main Titles (PDP Name, Category Titles)
        h1: "text-xl md:text-2xl font-semibold tracking-tight text-industrial-gray",
        
        // Section Headers (Technical Specs, Documents)
        h2: "text-lg md:text-xl font-semibold tracking-tight text-industrial-gray",
        
        // Sub-section Labels (Quick Details, Models)
        h3: "text-sm md:text-base font-semibold tracking-tight text-industrial-gray",
        
        // Technical labels (SKU, Qty, Attribute names)
        label: "text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.2em] text-steel-gray/60",
        
        // Main body text
        body: "text-sm md:text-base text-steel-gray leading-relaxed font-medium",
        
        // Technical/Secondary small text
        small: "text-[10px] md:text-xs text-steel-gray/80 font-medium",
        
        // Price displays
        price: "text-xl md:text-2xl font-semibold text-primary-navy tracking-tight",
        
        // Navigation / Breadcrumb items
        nav: "text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.2em]",
    },

    /** Layout & Spacing */
    layout: {
        // Standard max-width for elite focused pages (PDP, Brand Details)
        containerNarrow: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
        
        // Standard max-width for browsing pages (Home, Products Grid)
        containerWide: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        
        // Common border style for technical cards
        borderLight: "border border-slate-200/60",
        
        // Subtle shadow for airy design
        shadowAiry: "shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
    },

    /** Colors (Reference aliases for theme consistency) */
    colors: {
        primary: "text-primary-navy",
        secondary: "text-secondary-blue",
        accent: "text-air-blue",
        industrial: "text-industrial-gray",
        steel: "text-steel-gray",
    }
}
