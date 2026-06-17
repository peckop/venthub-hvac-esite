// 3D asset registry (SSOT §1) — tek kayıt: yol + geçerlilik + Draco/KTX2.
// Decoder'lar YEREL (CDN DEĞİL → A2 çökme + B6 / CSP genişletme riski yok).
export const DRACO_DECODER_PATH = '/decoders/draco/'
export const KTX2_DECODER_PATH = '/decoders/basis/'

export type AssetType = 'glb' | 'hdr' | 'procedural'

export interface AssetEntry {
  key: string
  /** Prosedürel = null (yüklenecek dosya yok = çökecek asset yok). */
  path: string | null
  type: AssetType
  draco?: boolean
  ktx2?: boolean
}

/**
 * Bugün TÜM 3D modeller PROSEDÜREL (dosya yok). GLB göçünde:
 *   { key, path: '/models/x.glb', type: 'glb', draco: true } ekle + public/decoders/ wasm ZORUNLU
 *   (yoksa Draco/KTX2 sessizce kırılır + INV-3D-1 boş-registry'de yanlış-yeşil verir).
 */
export const ASSET_REGISTRY: Record<string, AssetEntry> = {}

export function resolveAsset(key: string, _tenantId?: string): AssetEntry | undefined {
  // Tenant-scoped path (assetBasePath ile data-bleeding izolasyonu / D2): P2.
  return ASSET_REGISTRY[key]
}
