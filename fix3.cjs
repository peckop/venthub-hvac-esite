const fs = require('fs');
const file = 'src/components/products/OrbitalProductsShowcase.tsx';
let content = fs.readFileSync(file, 'utf8');

const search = `    // Provide R3F with explicit frame invalidation on mount to guarantee layout computation
    // R3F Canvas relies on resize observers, but when nested inside AnimatePresence with scale transitions,
    // it may occasionally miscalculate initial boundaries.
    const handleCanvasCreated = useCallback((state: any) => {
        // Trigger a single resize update on the internal gl context
        setTimeout(() => {
            state.invalidate()
            // We can also dispatch a specific resize event only to the canvas element
            state.gl.domElement.dispatchEvent(new Event('resize'))
        }, 100)
    }, [])`;

const replace = `    // Safe Resize Handler: Reacts to actual DOM size changes instead of relying on arbitrary timeouts
    useEffect(() => {
        if (!containerRef.current) return
        // We observe the exact container for dimensions changing (e.g. from Framer Motion transitions)
        const observer = new ResizeObserver(() => {
            // Dispatch a global resize only when a real DOM resize is detected on our container.
            // This is required because R3F Canvas might not catch the exact frame boundaries
            // when animated via Framer Motion scale changes.
            window.dispatchEvent(new Event('resize'))
        })
        observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])`;

content = content.replace(search, replace);

// Remove onCreated
const canvasSearch = `<Canvas
                onCreated={handleCanvasCreated}
                shadows`;
const canvasReplace = `<Canvas
                shadows`;

content = content.replace(canvasSearch, canvasReplace);

fs.writeFileSync(file, content);
