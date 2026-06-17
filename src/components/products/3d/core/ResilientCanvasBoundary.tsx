'use client'

import { Box } from 'lucide-react'
import React from 'react'

/**
 * A1 (DIŞ katman) — Canvas'ın KENDİSİ context alamaz / ilk-frame throw ederse DOM fallback render eder → SAYFA AYAKTA.
 * İç AssetErrorBoundary Canvas İÇİNDE yaşar, Canvas-mount throw'unu yakalayamaz; bu yüzden DIŞ katman şart.
 * NOT (açık borç): context-CREATION async hataları (webglcontextcreationerror) her zaman render-throw'a dönüşmez —
 * "çökme yolları büyük ölçüde kapanır", "imkânsız" değil. Tam garanti runtime kapısı (INV-3D-6) ile gelir.
 */
export function Static3DFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-product-3d-radial">
      <Box className="text-steel-gray opacity-40" size={48} strokeWidth={1.5} aria-hidden="true" />
    </div>
  )
}

interface Props {
  children: React.ReactNode
  fallback: React.ReactNode
}

interface State {
  hasError: boolean
}

export class ResilientCanvasBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    // 3D çöker, sayfa ayakta kalır — sessiz yutmuyoruz, logluyoruz.
    console.error('[VentHubCanvas] 3D yüzeyi yüklenemedi, sayfa ayakta kalıyor:', error)
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
