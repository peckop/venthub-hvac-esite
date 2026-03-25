import { useRef, useCallback } from 'react'

export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
    const cleanupRef = useRef<(() => void) | null>(null)

    const callbackRef = useCallback((node: T | null) => {
        if (cleanupRef.current) {
            cleanupRef.current()
            cleanupRef.current = null
        }

        if (!node) return

        const el = node
        let isDown = false
        let startX: number
        let scrollLeft: number
        let hasDragged = false

        const DRAG_THRESHOLD = 5
        let startClientX: number

        el.style.cursor = 'grab'
        el.style.touchAction = 'pan-x'

        const handleMouseDown = (e: MouseEvent) => {
            if (e.button !== 0) return

            isDown = true
            hasDragged = false
            startClientX = e.pageX
            startX = e.pageX - el.offsetLeft
            scrollLeft = el.scrollLeft

            el.style.cursor = 'grabbing'
            el.style.userSelect = 'none'
            el.style.scrollBehavior = 'auto'
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
        if (typeof window !== 'undefined') window.addEventListener('mouseup', handleMouseUp)
        el.addEventListener('mouseleave', handleMouseLeave)
        el.addEventListener('mousemove', handleMouseMove)
        el.addEventListener('click', handleClick, { capture: true })

        cleanupRef.current = () => {
            el.removeEventListener('mousedown', handleMouseDown)
            if (typeof window !== 'undefined') window.removeEventListener('mouseup', handleMouseUp)
            el.removeEventListener('mouseleave', handleMouseLeave)
            el.removeEventListener('mousemove', handleMouseMove)
            el.removeEventListener('click', handleClick, { capture: true })
        }
    }, [])

    return callbackRef
}
