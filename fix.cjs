const fs = require('fs');
const file = 'src/components/products/OrbitalProductsShowcase.tsx';
let content = fs.readFileSync(file, 'utf8');

const search = `    // Resize Hack (Minimal) - Keep ensuring layout
    useEffect(() => {
        const timers = [50, 200, 500].map(delay =>
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'))
            }, delay)
        )
        return () => timers.forEach(t => clearTimeout(t))
    }, [])`;

const replace = `    // Ensure layout without global resize hacks.
    // Framer Motion's AnimatePresence unmounting/mounting can cause the Canvas to render before it has dimensions.
    // We observe the container and update a dummy state to force R3F to re-measure itself if needed,
    // or just let R3F's internal ResizeObserver do its job safely.
    // Setting an initial dummy state triggers a re-render after mount.
    const [_, forceRender] = useState(0)
    useEffect(() => {
        const timer = setTimeout(() => forceRender(1), 100)
        return () => clearTimeout(timer)
    }, [])`;

content = content.replace(search, replace);
fs.writeFileSync(file, content);
