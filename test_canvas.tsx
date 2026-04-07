import React, { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

export const ResizeHandler = () => {
    const { gl, camera, size } = useThree()
    useEffect(() => {
        const handleResize = () => {
            // Force WebGL renderer to update size if needed
        }
        return handleResize
    }, [gl, camera, size])
    return null
}
