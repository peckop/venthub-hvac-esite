# Brainstorm: PDP Redesign & UI/UX Synchronization

## 1. Goal: "Standardize Design Language"
- **Problem**: PDP looks "zoomed in", fonts are too large, and styles mismatch the homepage.
- **Solution**:
  - Adopt homepage's typography: 'Inter' with controlled `tracking` and smaller but high-contrast `font-size`.
  - Use `text-industrial-gray` for primary text and `text-steel-gray` for secondary.
  - Heading hierarchy: `h1` should be bold but elegant, not overwhelming (approx `text-2xl` to `text-3xl`, not `text-5xl`).
  - Containerization: Use `max-w-7xl` but increase gutters and internal padding for a "lighter" feel.

## 2. Goal: "Header & Breadcrumb Architecture"
- **Problem**: Current breadcrumb area is a separate "band" that looks architecturally dissonant from the main sticky header.
- **Solution**:
  - Merge the breadcrumb into the `StickyHeader` context or make it look like a seamless sub-header.
  - Instead of a full-width gray band, use a transparent or subtle blurred background.
  - Position breadcrumbs closer to the content or integrate them into the StickyHeader's progress/info state when scrolling.

## 3. Goal: "Sticky Tech-Nav Accessibility"
- **Problem**: The technical navigation (Genel Bilgiler, Teknik Özellikler, etc.) is hidden until scroll.
- **Solution**:
  - Position a version of this navigation *above* the product description or near the primary CTAs so users can jump immediately.
  - Maintain the "adaptive sticky" behavior but ensure it's visually lighter.
  - Use icons + text standard from the homepage design.

## 4. Goal: "Product Card & Grid Proportionality"
- **Problem**: PDP elements (Image Gallery, Action Card) are huge.
- **Solution**:
  - Resize the `ImageGallery` container to be more proportional (`60/40` split).
  - Clean up the Action Card: unify button styles, smaller icons, use "Air Blue" backgrounds more effectively.
  - Redesign price area to be clean and technical, not "shouty".

## 5. Implementation Strategy (Superpowers)
- **Phase 1**: Typography & Spacing Overhaul (CSS/Tailwind classes).
- **Phase 2**: Header/Breadcrumb unification.
- **Phase 3**: Repositioning and styling the Technical Nav.
- **Phase 4**: Refactoring the PDP Hero (Actions + Info).
