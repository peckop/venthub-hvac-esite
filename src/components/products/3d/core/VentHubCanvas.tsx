'use client'

import { Canvas } from '@react-three/fiber'
import React from 'react'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'

import { DEFAULT_TENANT_ID } from '@/utils/tenantConstants'

import { ContextLossRecovery } from './ContextLossRecovery'
import { ResilientCanvasBoundary, Static3DFallback } from './ResilientCanvasBoundary'
import { type EnvPresetKey,SceneLightingRig } from './SceneLightingRig'
import { TenantSceneProvider } from './tenantScene'
import { type DprCap,useDeviceDpr } from './useDeviceDpr'

type CanvasProps = React.ComponentProps<typeof Canvas>

export interface VentHubCanvasProps {
  children: React.ReactNode
  /** Yüzey tipi → doğru environment + ışık preset'i. */
  preset?: 'product' | 'showcase' | 'nav' | 'authority'
  /** Açık environment override (verilmezse preset'ten türer). */
  environment?: EnvPresetKey
  /** Tenant seam (E1): verilmezse DEFAULT_TENANT_ID. ASLA render'da useTenant() çağrılmaz (throw eder). */
  tenantId?: string
  /**
   * PERF kontratı — her yüzey KENDİ frameloop'unu taşır, kabuk SADELEŞTİRMEZ.
   * (Orbital `isInView?'always':'demand'`, Product3DViewer `'always'` → davranış korunur.)
   */
  frameloop?: CanvasProps['frameloop']
  camera?: CanvasProps['camera']
  dprCap?: Partial<DprCap>
  className?: string
  /** Canvas KENDİSİ çökerse gösterilen DOM fallback (3D dışı, sayfa ayakta). */
  fallback?: React.ReactNode
}

const PRESET_ENV: Record<NonNullable<VentHubCanvasProps['preset']>, EnvPresetKey> = {
  product: 'product',
  showcase: 'showcase',
  nav: 'nav',
  authority: 'authority',
}

/**
 * SSOT §1 / A5 — TEK Canvas/renderer dayanıklılık kabuğu. Ham `<Canvas>` başka yerde YASAK (INV-3D-2/4).
 *
 * KATMAN SIRASI (load-bearing): ResilientCanvasBoundary (DOM, Canvas-DIŞI) > Canvas > ContextLossRecovery +
 * prosedürel SceneLightingRig (dosya YOK) + TenantSceneProvider > children. Çökme-fix tam olarak bu dizilim:
 * canlı bug'da `<Environment files>` İÇ Suspense/ErrorBoundary'nin ÜSTÜndeydi → parse hatası boundary'leri atlıyordu.
 */
export function VentHubCanvas({
  children,
  preset = 'product',
  environment,
  tenantId,
  frameloop = 'demand',
  camera,
  dprCap,
  className,
  fallback,
}: VentHubCanvasProps) {
  const dpr = useDeviceDpr(dprCap)
  const envKey = environment ?? PRESET_ENV[preset]
  const resolvedTenantId = tenantId ?? DEFAULT_TENANT_ID

  return (
    <ResilientCanvasBoundary fallback={fallback ?? <Static3DFallback />}>
      <Canvas
        shadows="percentage"
        frameloop={frameloop}
        dpr={dpr}
        camera={camera}
        className={className}
        gl={{ alpha: true, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false }}
        onCreated={(state) => {
          // C2 — sRGB output + ACESFilmic tone mapping, tek yerden.
          state.gl.toneMapping = ACESFilmicToneMapping
          state.gl.outputColorSpace = SRGBColorSpace
        }}
      >
        <ContextLossRecovery />
        <SceneLightingRig env={envKey} />
        <TenantSceneProvider tenantId={resolvedTenantId}>{children}</TenantSceneProvider>
      </Canvas>
    </ResilientCanvasBoundary>
  )
}
