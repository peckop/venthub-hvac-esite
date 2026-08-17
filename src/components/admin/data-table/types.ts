import type { ReactNode } from 'react'

/** Hücre hizalama — sayısal kolonlar 'right' (Polaris §3). */
export type AdminAlign = 'left' | 'right' | 'center'

/**
 * Kolonların TEK kaynağı (SSOT). `header` = i18n-ÇÖZÜLMÜŞ string — kit içinde `t()` YOK,
 * çağıran taraf `t('...')` ile çözüp geçirir (fallback-pattern YASAK, standart §6.5).
 */
export interface AdminColumn<T> {
  /** Stabil kolon kimliği — visibleCols persist + faceted filter anahtarı */
  key: string
  /** ZORUNLU. Çağıran tarafça çözülmüş düz başlık metni */
  header: string
  /**
   * Başlığın yanında açıklama balonu (tooltip) metni — çağıran tarafça `t()` ile çözülmüş.
   * `header` DÜZ STRING kalmak zorunda (ColumnsMenu etiketi ve `aria` metni odur), bu yüzden
   * açıklama ayrı bir alan; `ReactNode` başlık kit sözleşmesini kirletirdi.
   */
  headerHint?: string
  /** Başlıktan toggle ile sıralanabilir mi (sortMode='none' ise yok sayılır) */
  sortable?: boolean
  /** Hücre hizalama */
  align?: AdminAlign
  /** Kolon görünürlük menüsünde gizlenebilir mi */
  hideable?: boolean
  /** İlk yüklemede gizli başlasın mı */
  defaultHidden?: boolean
  /** Hücre render — TanStack `row.original` eşdeğeri */
  cell: (row: T) => ReactNode
  /** Başlık ekstra sınıfı (design-token; arbitrary Tailwind YASAK) */
  headerClassName?: string
  /** Hücre ekstra sınıfı */
  cellClassName?: string
  /** Faceted filter için bu kolondan değer çıkar (verilmişse kolon facet'lenebilir) */
  facetAccessor?: (row: T) => string | null | undefined
}

/** Faceted filtre seçeneği — sayaçlı (Polaris §2.5). */
export interface DataTableFacet {
  /** {@link AdminColumn.key} ile eşleşir */
  key: string
  /** i18n-çözülmüş etiket */
  label: string
  options: { value: string; label: string; count: number }[]
}

/**
 * Inline-edit sözleşmesi [ADV-1#2 / ADV-2#d-4]:
 * - `parse` dönüşü ile `onSave` girdisi TİP-UYUMLU (her ikisi de `string | number`).
 * - Optimistik UI: kit local satırı günceller; `onSave` reddederse kit geri alır (rollback) + hata toast'u.
 * - Kit invariant'ı: aynı anda yalnız BİR açık editör.
 */
export interface EditableCell<T> {
  /** {@link AdminColumn.key} */
  columnKey: string
  /** ham input string'ini değere çevirir (varsayılan: string aynen) */
  parse?: (raw: string) => string | number
  /** `onSave` İÇİNDE `mutateWithAudit` ZORUNLU çağrılır (çağıran sorumlu). */
  onSave: (row: T, value: string | number) => Promise<void>
}
