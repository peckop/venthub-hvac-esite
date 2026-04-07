const fs = require('fs');
const file = 'src/components/products/OrbitalProductsShowcase.tsx';
let content = fs.readFileSync(file, 'utf8');

const search = `    // Ensure layout without global resize hacks.
    // Framer Motion's AnimatePresence unmounting/mounting can cause the Canvas to render before it has dimensions.
    // We observe the container and update a dummy state to force R3F to re-measure itself if needed,
    // or just let R3F's internal ResizeObserver do its job safely.
    // Setting an initial dummy state triggers a re-render after mount.
    const [_, forceRender] = useState(0)
    useEffect(() => {
        const timer = setTimeout(() => forceRender(1), 100)
        return () => clearTimeout(timer)
    }, [])`;

const replace = `    // Provide R3F with explicit frame invalidation on mount to guarantee layout computation
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

content = content.replace(search, replace);

// Now we need to add onCreated to the Canvas
const canvasSearch = `<Canvas
                shadows
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}`;
const canvasReplace = `<Canvas
                onCreated={handleCanvasCreated}
                shadows
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}`;

content = content.replace(canvasSearch, canvasReplace);

fs.writeFileSync(file, content);
