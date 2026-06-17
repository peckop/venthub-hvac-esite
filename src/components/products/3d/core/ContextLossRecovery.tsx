'use client'

import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

/**
 * A3 — Context-loss kurtarma. GPU reset / bellek / Safari context-limiti durumunda sayfa ÇÖKMEZ, kendini toparlar.
 * `webglcontextlost` preventDefault → tarayıcının pes etmesini engeller; `restored` → invalidate ile yeniden çizer.
 */
export function ContextLossRecovery() {
  const gl = useThree((s) => s.gl)
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    const canvas = gl.domElement
    const handleLost = (event: Event) => {
      event.preventDefault()
    }
    const handleRestored = () => {
      invalidate()
    }
    canvas.addEventListener('webglcontextlost', handleLost as EventListener, false)
    canvas.addEventListener('webglcontextrestored', handleRestored as EventListener, false)
    return () => {
      canvas.removeEventListener('webglcontextlost', handleLost as EventListener)
      canvas.removeEventListener('webglcontextrestored', handleRestored as EventListener)
    }
  }, [gl, invalidate])

  return null
}
