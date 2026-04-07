const fs = require('fs');
const file = 'src/components/products/OrbitalProductsShowcase.tsx';
let content = fs.readFileSync(file, 'utf8');

const searchHack = `    // Resize Hack (Minimal) - Keep ensuring layout
    useEffect(() => {
        const timers = [50, 200, 500].map(delay =>
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'))
            }, delay)
        )
        return () => timers.forEach(t => clearTimeout(t))
    }, [])`;

content = content.replace(searchHack, '');

const componentSearch = `const OrbitalProductsShowcase: React.FC<OrbitalProductsShowcaseProps> = ({ items, onCardClick, externalPause = false, onFocusedItemChange, onFrontCardChange, modelScale = 1.5, containerHeight = 500, skipHints = false }) => {`;

const resizerComponent = `/**
 * Internal helper to force R3F to render initial frames during Framer Motion scale transitions
 * without polluting the global window object with resize events.
 */
const MotionTransitionFix = () => {
    const { invalidate } = useThree()
    useEffect(() => {
        // Framer Motion transition is 400ms. We invalidate the frame locally during this window
        // to ensure the canvas resolves its layout and correctly draws despite CSS scale transforms.
        const interval = setInterval(() => invalidate(), 50)
        setTimeout(() => clearInterval(interval), 600)
        return () => clearInterval(interval)
    }, [invalidate])
    return null
}

`;

content = content.replace(componentSearch, resizerComponent + componentSearch);

const canvasSearch = `<Canvas
                shadows`;

const canvasReplace = `<Canvas
                shadows`;

const ambientSearch = `<ambientLight intensity={0.5} />`;
const ambientReplace = `<MotionTransitionFix />
                <ambientLight intensity={0.5} />`;

content = content.replace(ambientSearch, ambientReplace);

fs.writeFileSync(file, content);
