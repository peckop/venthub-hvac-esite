import type { Object3D, Texture } from 'three'
import { Mesh } from 'three'

function isTexture(value: unknown): value is Texture {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { isTexture?: boolean }).isTexture === true &&
    typeof (value as { dispose?: unknown }).dispose === 'function'
  )
}

/**
 * A4 / standart §6.1 — recursive dispose. R3F yalnız declaratif nesneleri otomatik temizler;
 * `<primitive>` ve `useGLTF` global cache ELLE temizlik ister. Unmount'ta çağır (useEffect cleanup).
 * `useGLTF.clear(path)` yalnız JS cache referansını siler — VRAM için bu dispose ŞART.
 */
export function disposeSceneObject(object: Object3D): void {
  object.traverse((child) => {
    if (!(child instanceof Mesh)) return
    child.geometry?.dispose()
    const materials = Array.isArray(child.material) ? child.material : [child.material]
    for (const material of materials) {
      if (!material) continue
      material.dispose()
      // Materyale bağlı tüm texture'ları VRAM'den temizle.
      for (const value of Object.values(material)) {
        if (isTexture(value)) value.dispose()
      }
    }
  })
}
