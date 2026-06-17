'use client'

import React, { createContext, useContext } from 'react'

import { DEFAULT_TENANT_ID } from '@/utils/tenantConstants'

import { type FanMaterials,useFanMaterials } from '../materials/useFanMaterials'
import type { EnvPresetKey } from './SceneLightingRig'

/**
 * 3D alt-ağacına ÇÖZÜLMÜŞ tenantId'yi yayar (E1 / CLAUDE.md #12). throw-SAFE: default'lu context,
 * `useTenant()` (provider yoksa throw eder) ÇAĞRILMAZ — VentHubCanvas tenantId'yi prop+DEFAULT ile çözer.
 */
const TenantSceneContext = createContext<string>(DEFAULT_TENANT_ID)

export function TenantSceneProvider({ tenantId, children }: { tenantId: string; children: React.ReactNode }) {
  return <TenantSceneContext.Provider value={tenantId}>{children}</TenantSceneContext.Provider>
}

export function useSceneTenantId(): string {
  return useContext(TenantSceneContext)
}

/**
 * SEAM (E1) — imza ŞİMDİ, tenant gövdesi P2. resolveMaterials TAM-40-set döndürür (productType subset DEĞİL:
 * fan+purifier materyalleri by-name paylaşır, temiz partition YOK). Tenant varyantı = envMapIntensity/color
 * OVERLAY (statik MATERIALS_CACHE asla mutate edilmez → CLEAN dosya korunur).
 */
export function useResolveMaterials(_tenantId?: string): FanMaterials {
  return useFanMaterials()
}

export interface EnvRigSpec {
  key: EnvPresetKey
}

export function resolveEnvPreset(key: EnvPresetKey, _tenantId?: string): EnvRigSpec {
  // Lightformer renk/yoğunluk tenant tonundan overlay: P2.
  return { key }
}
