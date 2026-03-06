import { useRef, useEffect } from 'react'

export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
    const ref = useRef<T>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        let isDown = false
        let startX: number
        let scrollLeft: number
        let hasDragged = false

        const DRAG_THRESHOLD = 5
        let startClientX: number

        // Set initial cursor
        el.style.cursor = 'grab'
        // Ensure the element can handle mouse events over children
        // and doesn't interfere with momentum scrolling on mobile
        el.style.touchAction = 'pan-x'

        const handleMouseDown = (e: MouseEvent) => {
            // Only left click
            if (e.button !== 0) return

            isDown = true
            hasDragged = false
            startClientX = e.pageX
            startX = e.pageX - el.offsetLeft
            scrollLeft = el.scrollLeft

            el.style.cursor = 'grabbing'
            el.style.userSelect = 'none'
            el.style.scrollBehavior = 'auto' // Prevent conflict with smooth scroll
        }

        const handleMouseLeave = () => {
            if (!isDown) return
            isDown = false
            el.style.cursor = 'grab'
            el.style.userSelect = ''
            el.style.scrollBehavior = ''
        }

        const handleMouseUp = () => {
            if (!isDown) return
            isDown = false
            el.style.cursor = 'grab'
            el.style.userSelect = ''
            el.style.scrollBehavior = ''
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDown) return

            const x = e.pageX - el.offsetLeft
            const walk = (x - startX) * 1.5

            const distance = Math.abs(e.pageX - startClientX)
            if (distance > DRAG_THRESHOLD) {
                if (!hasDragged) {
                    hasDragged = true
                }
                e.preventDefault()
                el.scrollLeft = scrollLeft - walk
            }
        }

        const handleClick = (e: MouseEvent) => {
            if (hasDragged) {
                e.preventDefault()
                e.stopPropagation()
            }
        }

        el.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mouseup', handleMouseUp) // Use window to catch up even if mouse is outside
        el.addEventListener('mouseleave', handleMouseLeave)
        el.addEventListener('mousemove', handleMouseMove)
        el.addEventListener('click', handleClick, { capture: true })

        return () => {
            el.removeEventListener('mousedown', handleMouseDown)
            window.removeEventListener('mouseup', handleMouseUp)
            el.removeEventListener('mouseleave', handleMouseLeave)
            el.removeEventListener('mousemove', handleMouseMove)
            el.removeEventListener('click', handleClick, { capture: true })
        }
    }, [])

    return ref
}
