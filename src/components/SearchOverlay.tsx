'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

import type { FtsProductResult, SearchSuggestion } from '@/types/ui-models'

import { useCategories } from '../contexts/CategoryContext'
import { useLocalizedRoutes } from '../hooks/useLocalizedRoutes'
import { useI18n } from '../i18n/I18nProvider'
import { resolveProductImageUrl } from '../lib/images/productImage'
import { supabaseBrowserClient } from '../lib/supabase/client'
import type { DbCategory } from '../types/db-rows'
import { getCategoryDisplayName,getLocalizedCategorySlug } from '../utils/categoryHelpers'
import { getCategoryIcon } from '../utils/getCategoryIcon'
import { localizedHref } from '../utils/routes'
import { highlightMatch } from '../utils/searchHighlight'

interface SearchOverlayProps {
  open: boolean
  onClose: () => void
}

/**
 * ⭐REC-340: `SUGGESTING` durumu KALDIRILDI — arama artık TEK AŞAMALI.
 *
 * NİÇİN: Recep canlıda aradı ve *"ben bu şekilde 2 aramalı bir arama motoru bilmiyorum,
 * kullanıcı olarak ben de zorlandıysam bir yerde sorun var değil mi?"* dedi. Haklıydı.
 * Yazarken açılan kutu ile "tüm sonuçlar" adımı AYRI İKİ RPC'ye bağlıydı ve farklı sonuç
 * veriyorlardı: "jet fan" öneri kutusunda 0, tam aramada 20 sonuç (canlıda ölçüldü).
 *
 * Gövde tarafı migration ile tek koda indirildi; burası da tek listeye iner. Kullanıcı
 * yazarken ürünleri fiyat ve görseliyle doğrudan görür; kategori/marka kısayolları listenin
 * üstünde durur. Ara bir "tüm sonuçları göster" adımı YOKTUR.
 */
type ViewState = 'IDLE' | 'RESULTS'

const RECENT_SEARCHES_KEY = 'venthub_recent_searches'

const SearchOverlay: React.FC<SearchOverlayProps> = ({ open, onClose }) => {
  const { t, lang } = useI18n()
  const { categories: globalCategories, getCategoryBySlug } = useCategories()
  const Routes = useLocalizedRoutes()
  const [q, setQ] = React.useState('')
  const [debounced, setDebounced] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [viewState, setViewState] = React.useState<ViewState>('IDLE')
  const [activeIndex, setActiveIndex] = React.useState(-1)

  // Data
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([])
  const [results, setResults] = React.useState<FtsProductResult[]>([])
  const [recentSearches, setRecentSearches] = React.useState<string[]>([])
  const [error, setError] = React.useState<string | null>(null)
  // "Tekrar dene" aynı sorguyu yeniden çalıştırır: debounced değişmediği için effect'i bu sayaç tetikler.
  const [denemeNo, setDenemeNo] = React.useState(0)

  // Popüler kategorileri merkezi hiyerarşiden çek
  const popularCategories = React.useMemo(() => {
    return globalCategories.filter(c => !c.parent_id).slice(0, 5) as Partial<DbCategory>[]
  }, [globalCategories])

  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  // Load recent searches on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (stored) setRecentSearches(JSON.parse(stored).slice(0, 5))
    } catch { /* ignore */ }
  }, [])

  // Debounce logic
  React.useEffect(() => {
    const t_id = setTimeout(() => setDebounced(q.trim()), 200)
    return () => clearTimeout(t_id)
  }, [q])

  // Reset activeIndex when query or viewState changes
  React.useEffect(() => {
    setActiveIndex(-1)
  }, [debounced, viewState])

  // Scroll active item into view
  React.useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [activeIndex])

  // Main search logic
  React.useEffect(() => {
    let active = true

    async function fetchData() {
      if (!open) return

      if (!debounced) {
        setViewState('IDLE')
        setSuggestions([])
        setResults([])
        return
      }

      try {
        setLoading(true)
        setError(null)
        const { getSearchSuggestions, ftsSearchProducts } = await import('../lib/services/product.service')
        // İkisi PARALEL ve ikisi de artık AYNI eşleştirme gövdesini kullanıyor (migration
        // 20260916132052). Ürünler listeyi kurar; öneri çağrısından yalnız kategori/marka
        // kısayolları alınır — ürün kalemleri yinelenmesin diye süzülür.
        const [items, rows] = await Promise.all([
          getSearchSuggestions(supabaseBrowserClient, debounced, 6),
          ftsSearchProducts(supabaseBrowserClient, debounced, 20),
        ])

        if (active) {
          setSuggestions(items.filter(s => s.type !== 'product'))
          setResults(rows)
          setViewState('RESULTS')
        }
      } catch (err) {
        console.error(err)
        if (active) {
          setSuggestions([])
          setResults([])
          setViewState('RESULTS')
          // "Sonuç bulunamadı" DEĞİL: 2026-09-17 canlıda `İNLİNE` araması veritabanı süre
          // aşımına düştü (57014) ve ekran "Sonuç bulunamadı" dedi — oysa 24 ürün vardı.
          // Hata ile boş sonuç müşteriye farklı söylenir; hatada yeniden deneme yolu verilir.
          setError(t('search.failed'))
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchData()
    return () => { active = false }
    // `t` hata mesajı için kullanılıyor; `useI18n` onu kararlı döndürür (aynı desen
    // PaymentSuccessPage'de de var), bu yüzden bağımlılığa girmesi yeniden çağrı üretmez.
  }, [debounced, open, t, denemeNo])

  // Focus management
  React.useEffect(() => {
    if (open) {
      setQ('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Handlers
  const handleClose = () => {
    setQ('')
    setResults([])
    setSuggestions([])
    setViewState('IDLE')
    setActiveIndex(-1)
    onClose()
  }

  /**
   * Arama sonucundan ürüne git. PDP bir AİLE slug'ı bekler, varyant `?sku=` ile seçilir.
   * Eskiden `Routes.product(r.slug!)` çağrılıyordu ama RPC slug DÖNDÜRMÜYOR — kullanıcı
   * `/products/undefined` sayfasına düşüyordu. Aile slug'ı henüz gelmiyorsa (migration
   * prod'a inene kadar) sessizce hatalı adrese gitmek yerine arama sayfasına düşülür.
   */
  const goToResult = (res: FtsProductResult) => {
    if (res.family_slug) {
      router.push(Routes.product(res.family_slug, res.sku))
    } else {
      router.push(Routes.products())
    }
    handleClose()
  }

  const addToRecent = (term: string) => {
    if (!term.trim()) return
    const next = [term, ...recentSearches.filter(x => x !== term)].slice(0, 5)
    setRecentSearches(next)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
  }

  /**
   * Öneriden hedefe git — TEK YER (klavye Enter'ı da fare tıklaması da buradan geçer).
   *
   * NİÇİN DEĞİŞTİ (2026-08-26, canlı ölçüm): `get_search_suggestions` RPC'si DİL ÖNEKSİZ
   * adres döndürüyor (`/products/<uuid>`). Bu adres ham hâlde `router.push`'a verilince
   * önek olmadığı için middleware dili SAYFADAN değil TARAYICI `Accept-Language`'inden
   * çözüyordu; TÜRKÇE gezen müşteri öneriye tıklayınca İNGİLİZCE sayfaya düşüyordu.
   * Canlı kanıt: /tr → "lineo" → öneri → 307 `/products/<uuid>` → 308 `/en/products/<uuid>`
   * → 308 `/en/products/vortice-lineo-100-quiet-17160` → 200 `/en/products/vortice-lineo-quiet`.
   * Aynı sayfadaki normal ürün bağlantıları `/tr/...` taşıyordu; fark yalnız bu yoldaydı.
   *
   * Çözüm SSOT'a bağlanmaktır: dil öneki `localizedHref` ile eklenir (kural 7 — elle
   * `/${lang}/` birleştirme yasak). `localizedHref` idempotenttir, RPC ileride önekli
   * adres döndürmeye başlarsa mükerrer önek OLUŞMAZ.
   *
   * Adresi olmayan öneri için eskiden `'#'` push ediliyordu — bu, sayfayı değiştirmeden
   * geçmişe çöp kayıt bırakıyordu; artık yalnızca katman kapanır.
   */
  const goToSuggestion = (s: SearchSuggestion, term: string) => {
    if (s.url) {
      router.push(localizedHref(s.url, lang))
    }
    addToRecent(term)
    handleClose()
  }

  /**
   * Öneri etiketinin GÖRÜNEN hâli — kategori önerisinde ham TR ad basılmaz (REC-114).
   *
   * NİÇİN VAR (ölçüldü, 2026-09-01): `get_search_suggestions` etiketi
   * `c.name::text AS label` ile kuruyor — ham Türkçe ad — ve fonksiyonun `p_lang`
   * parametresi YOK. Bu bir eksiklik değil, açıkça yazılmış bir tasarım kararı: RPC'nin
   * kendi yorumu "RPC dili BİLMEZ, bu yüzden sözlüğü verir ve yerelleştirmeyi istemciye
   * bırakır" diyor ve `url` alanı kanonik EN slug taşıyor. Slug için zaten böyle
   * yapılıyordu; ADA aynısı uygulanmamıştı. Sonuç: /en'de arama kutusuna yazınca
   * öneri listesi Türkçe kategori adı basıyordu — REC-103'te düzeltilen popüler-kategori
   * çipleriyle AYNI ekranda, farklı dilde.
   *
   * ⭐Çözüm istemcide çünkü RPC'ye `p_lang` eklemek imza değişikliğidir: `drop` +
   * `create` gerektirir, yani migration. Kapsam bilerek küçük tutuldu.
   *
   * ⭐Eşleşme TAM kategori seti üzerinden: `getCategoryBySlug`, context'teki
   * `categoriesSlugMap`'ten okur ve o harita `allCategories` ile kurulur — ürünlü-kategori
   * filtresinden GEÇMEZ. Öneri RPC'si yalnız `is_active` filtreliyor; filtreli seti
   * kullansaydık ürünü olmayan aktif bir kategori eşleşmez ve sessizce ham TR ada
   * düşerdi.
   *
   * Eşleşme bulunamazsa `s.label`'a düşülür — bugünkü davranış, yani regresyon yok.
   */
  const oneriEtiketi = (s: SearchSuggestion): string => {
    if (s.type === 'category' && s.url) {
      const slug = s.url.split('/').filter(Boolean).pop()
      const kategori = slug ? getCategoryBySlug(slug) : undefined
      if (kategori) return getCategoryDisplayName(kategori, t)
    }
    return s.label ?? ''
  }

  /**
   * ⭐TEK GEZİNME UZAYI. Liste artık tek parça: önce kategori/marka kısayolları, sonra
   * ürünler. Klavye ok tuşları ikisinin arasında kesintisiz gezer — eskiden iki ayrı
   * görünümün iki ayrı dizini vardı ve Enter kullanıcıyı ikinci bir aramaya sokuyordu.
   */
  const gezinmeUzunlugu = suggestions.length + results.length

  const aktifKalemeGit = (idx: number) => {
    if (idx < 0) return
    if (idx < suggestions.length) {
      const s = suggestions[idx]
      // Klavye yolu da çözülmüş etiketi geçirir (REC-114 / NOT-3): ham `s.label` gitseydi
      // İngilizce gezen müşterinin arama geçmişine TÜRKÇE kategori adı yazılırdı.
      goToSuggestion(s, oneriEtiketi(s))
      return
    }
    const res = results[idx - suggestions.length]
    if (res) goToResult(res)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleClose()

    const maxIndex = viewState === 'RESULTS' ? gezinmeUzunlugu - 1 : -1

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev < maxIndex ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev > -1 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      // Seçili kalem varsa oraya git; yoksa listenin ilk kalemine. İkinci bir arama
      // adımı YOK — kullanıcı zaten sonuçlara bakıyor.
      if (activeIndex > -1) {
        aktifKalemeGit(activeIndex)
      } else if (gezinmeUzunlugu > 0) {
        addToRecent(debounced)
        aktifKalemeGit(0)
      }
    }
  }

  // Render Helpers
  const renderSuggestion = (s: SearchSuggestion, idx: number) => {
    const isActive = idx === activeIndex

    const icon = s.type === 'product' ? (
      (s.metadata as Record<string, string>)?.image_url ? (
        <div className="w-8 h-8 relative rounded-md overflow-hidden bg-white border border-gray-100 flex-shrink-0">
          <Image src={(s.metadata as Record<string, string>).image_url || ''} alt={s.label || ''} fill sizes="32px" className="object-cover" />
        </div>
      ) : (
        <svg className="w-5 h-5 text-steel-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
      )
    ) : s.type === 'category' ? (
      <svg className="w-5 h-5 text-primary-ocean" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    ) : (
      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
    )

    // ⭐Kategori önerisinde ham `s.label` (TR) DEĞİL, çözülmüş ad basılır (REC-114).
    // Marka öneki kendi dalında kalır; ÜRÜN önerisinin etiketi bu turda ham TR'dir —
    // ürün adı i18n'i REC-110'un işi ve `products.name_i18n` okuma zinciri henüz yazılmadı.
    const label = s.type === 'brand' ? `${t('search.brandPrefix')}${s.label}` : oneriEtiketi(s)

    return (
      <button
        key={`${s.type}-${Math.random()}`} // Avoid strict index mapping issues
        onMouseEnter={() => setActiveIndex(idx)}
        onClick={() => goToSuggestion(s, q)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-transform duration-200 group outline-none hover:scale-101 hover:shadow-md hover:z-10 relative ${isActive ? 'bg-air-blue/10 ring-inset ring-2 ring-primary-navy/20 shadow-sm' : 'hover:bg-gray-50'}`}
      >
        <div className={`p-2 rounded-lg border transition-colors flex items-center justify-center ${isActive ? 'bg-white border-primary-ocean/30 shadow-sm' : 'bg-gray-50 border-transparent group-hover:bg-white group-hover:border-gray-200'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-industrial-gray">{highlightMatch(label || '', debounced)}</div>
          {s.type === 'product' && (s.metadata as Record<string, string>)?.sku && (
            <div className="text-xs text-steel-gray mt-0.5">
              {(s.metadata as Record<string, string>).brand && <span className="font-semibold">{highlightMatch((s.metadata as Record<string, string>).brand, debounced)}</span>}
              {(s.metadata as Record<string, string>).brand && (s.metadata as Record<string, string>).sku && <span> • </span>}
              {highlightMatch((s.metadata as Record<string, string>).sku, debounced)}
            </div>
          )}
        </div>
        <div className={`transition-opacity flex items-center gap-1.5 ${isActive ? 'opacity-100 text-primary-navy' : 'opacity-0 text-primary-ocean group-hover:opacity-100'}`}>
          <span className="text-xs font-semibold bg-white border border-slate-200 rounded px-1.5 py-0.5 hidden xs:inline-block shadow-sm">{t('search.overlay.enterKey')}</span>
        </div>
      </button>
    )
  }

  // --- VIEW: IDLE ---
  const renderIdle = () => (
    <div className="py-2 animate-in fade-in duration-300">
      {recentSearches.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between px-4 mb-2">
            <h3 className="text-xs font-semibold text-steel-gray uppercase tracking-wider">{t('search.recentSearches')}</h3>
            <button
              onClick={() => {
                setRecentSearches([])
                localStorage.removeItem(RECENT_SEARCHES_KEY)
              }}
              className="text-xs text-red-500 hover:text-red-600 transition-colors"
            >
              {t('search.clearRecent')}
            </button>
          </div>
          <ul>
            {recentSearches.map((term, i) => (
              <li key={i}>
                <button
                  onClick={() => setQ(term)}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left text-sm text-industrial-gray group transition-colors"
                >
                  <svg className="w-4 h-4 text-steel-gray group-hover:text-primary-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{term}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="px-4 mb-2 text-xs font-semibold text-steel-gray uppercase tracking-wider">{t('search.popularCategories')}</h3>
        <div className="px-4 flex flex-wrap gap-2">
          {popularCategories.length > 0 ? popularCategories.map(cat => (
            <button
              key={String(cat.id)}
              onClick={() => { router.push(Routes.category(getLocalizedCategorySlug({ slug: cat.slug ?? null, metadata: cat.metadata }, lang))); handleClose(); }}
              className="px-3 py-1.5 bg-gray-50 text-sm text-industrial-gray rounded-full border border-gray-200 hover:border-primary-ocean hover:text-primary-ocean transition-colors flex items-center gap-1.5"
            >
              {getCategoryIcon(String(cat.slug), { size: 14 })}
              {/*
                REC-103: burada ham `cat.name` basılıyordu — fallback bile yoktu, yani
                İngilizce sayfada koşulsuz Türkçe ad. Mutlak Kural 7: kategori adı DAİMA
                getCategoryDisplayName üzerinden. Kapı: INV-KATEGORI-ADI-1.
              */}
              {getCategoryDisplayName(cat, t)}
            </button>
          )) : (
            // REC-103: değişken adı `cat` değil `cip` — buradaki etiketler DB'den değil
            // SÖZLÜKTEN gelen sabit kısayollar. `cat.name` adı, kategori-adı kapısının
            // (INV-KATEGORI-ADI-1) haklı olarak ihlal saydığı desenle birebir aynıydı;
            // kapıyı gevşetmek yerine adı gerçeğe uygun hale getirdim.
            [
              { etiket: t('home.hero.quickChips.fans'), slug: 'fans' },
              { etiket: t('home.hero.quickChips.airCurtains'), slug: 'air-curtains' },
              { etiket: t('home.hero.quickChips.heatRecovery'), slug: 'heat-recovery-vmc' }
            ].map(cip => (
              <button
                key={cip.slug}
                onClick={() => { router.push(Routes.category(cip.slug)); handleClose(); }}
                className="px-3 py-1.5 bg-gray-50 text-sm text-industrial-gray rounded-full border border-gray-200 hover:border-primary-ocean hover:text-primary-ocean transition-colors"
              >
                {cip.etiket}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )

  /**
   * Kategori/marka kısayolları — listenin ÜSTÜNDE durur, ürünlerle aynı gezinme uzayında.
   * Ürün önerileri burada YOK: onlar asıl listede fiyat ve görseliyle görünür, iki kez
   * gösterilmeleri kullanıcıya iki ayrı sonuç kümesi varmış izlenimi verirdi.
   */
  const renderKisayollar = () => {
    if (suggestions.length === 0) return null
    return (
      <div className="divide-y divide-gray-100 border-b border-gray-100 bg-slate-50/50">
        {suggestions.map((s, idx) => renderSuggestion(s, idx))}
      </div>
    )
  }

  // --- VIEW: RESULTS (tek liste) ---
  const renderResults = () => {
    // Boş durum: ne ürün ne kısayol. Artık "detaylı ara" teklifi YOK — bu kutu zaten
    // detaylı aramanın kendisi; kullanıcıyı ikinci bir aramaya göndermek onu oyalıyordu.
    if (results.length === 0 && suggestions.length === 0) {
      return (
        <div className="p-12 text-center text-industrial-gray flex flex-col items-center animate-in zoom-in-95 duration-300">
          <svg className="w-16 h-16 text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-lg font-medium">{t('search.noResults')}</span>
          <span className="text-sm text-steel-gray mt-1">{t('search.noResultsAdvice')}</span>
        </div>
      )
    }

    const hasFuzzy = results.some(r => r.is_fuzzy_match)

    return (
      <div className="pb-2 animate-in fade-in duration-300" ref={listRef}>
        {hasFuzzy && (
          <div className="bg-amber-50 px-4 py-2.5 text-sm text-amber-800 border-b border-amber-100 flex items-center gap-2 font-medium">
            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{t('search.fuzzyMatchNotice')}</span>
          </div>
        )}
        {renderKisayollar()}
        <ul className="divide-y">
          {results.map((r, i) => {
            // Kısayollar listenin başında olduğu için ürün dizinleri onların sayısı kadar
            // kaydırılır — tek gezinme uzayı budur.
            const idx = i + suggestions.length
            const isActive = idx === activeIndex
            const rImgUrl = resolveProductImageUrl(r)
            return (
              <li key={r.id}>
                <button
                  className={`w-full text-left px-4 py-3 flex items-center justify-between group outline-none transition-colors ${isActive ? 'bg-air-blue/10 ring-inset ring-2 ring-primary-navy/20' : 'hover:bg-slate-50'}`}
                  onClick={() => goToResult(r)}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <div className="flex items-center gap-4">
                    {rImgUrl ? (
                      <div className="w-10 h-10 relative rounded-md overflow-hidden bg-white border border-gray-100 flex-shrink-0 shadow-sm">
                        <Image src={rImgUrl} alt={r.name} fill sizes="40px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-steel-gray/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-industrial-gray group-hover:text-primary-navy transition-colors">{highlightMatch(r.name, debounced)}</div>
                      <div className="text-xs text-steel-gray flex items-center gap-1.5 mt-0.5">
                        {r.brand && <span className="font-semibold text-slate-600">{highlightMatch(r.brand, debounced)}</span>}
                        {r.brand && <span className="text-gray-300">•</span>}
                        <span>{highlightMatch(r.sku, debounced)}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`transition-opacity flex items-center gap-2 ${isActive ? 'opacity-100 text-primary-navy' : 'opacity-0 text-primary-ocean group-hover:opacity-100'}`}>
                    <span className="text-xs font-semibold bg-white border border-slate-200 rounded px-1.5 py-0.5 hidden sm:inline-block shadow-sm">{t('search.overlay.enterKey')}</span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-modal flex items-start justify-center pt-4 sm:pt-16 pb-4 px-2">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={handleClose} 
        onKeyDown={(e) => { if (e.key === 'Escape') handleClose() }}
        role="presentation"
      />
      
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300 flex flex-col max-h-full"
      >
          {/* Header / Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white relative z-10">
            <svg className="w-5 h-5 text-primary-ocean" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35" />
            </svg>
            {/*
              ⭐`placeholderAi` KALDIRILDI (REC-340 Faz 0, Recep onayı 2026-09-15).
              O metin "yapay zeka destekli arama" diyordu ve ARKASINDA YAPAY ZEKA YOKTU:
              bu kutu `ftsSearchProducts` → RPC `fts_search_products` çağırır; prod'da
              ölçüldü (`pg_proc.prosrc`): `to_tsvector` + `plainto_tsquery` VAR, embedding
              YOK, vektör YOK, dış HTTP çağrısı YOK — yani düz PostgreSQL tam-metin arama.
              Zaten sözlükte duran doğru metin kullanılıyor; yeni metin UYDURULMADI.
              Yetenek gerçekten geldiğinde (REC-340 Faz 2/3) iddia hak edilerek geri konur.
            */}
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('search.placeholder')}
              className="flex-1 text-lg placeholder:text-gray-400 focus-visible:outline-none text-industrial-gray bg-transparent font-medium"
            />
            {loading && (
              <svg className="animate-spin h-5 w-5 text-primary-ocean mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <button
              onClick={handleClose}
              className="px-2.5 py-1.5 text-xs font-bold text-steel-gray bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-slate-900 transition-colors shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy"
              aria-label={t('common.close')}
            >
              ESC
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-0">
            {error && (
              <div role="alert" className="p-4 bg-red-50 text-red-600 text-sm font-medium flex items-center justify-between gap-3">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setDenemeNo(n => n + 1)}
                  className="shrink-0 px-3 py-1.5 text-xs font-bold text-red-700 bg-white rounded-lg border border-red-200 hover:bg-red-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy"
                >
                  {t('search.retry')}
                </button>
              </div>
            )}

            {!error && !loading && (
              <>
                {viewState === 'IDLE' && renderIdle()}
                {viewState === 'RESULTS' && renderResults()}
              </>
            )}
          </div>

          {/* Footer Hint */}
          {viewState === 'RESULTS' && (suggestions.length > 0 || results.length > 0) && (
            <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex justify-between items-center text-xs text-steel-gray">
              <span className="flex items-center gap-1">
                <span className="bg-white px-1 py-0.5 rounded border border-slate-200 shadow-sm leading-none">{t('search.overlay.arrowUp')}</span>
                <span className="bg-white px-1 py-0.5 rounded border border-slate-200 shadow-sm leading-none">{t('search.overlay.arrowDown')}</span>
                <span className="ml-1">{t('search.keyboardHint')}</span>
              </span>
              <span className="flex items-center gap-1">
                {t('search.enterHint')} <strong className="bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-sm ml-1 text-slate-700">{t('search.overlay.enterKey')}</strong>
              </span>
            </div>
          )}
      </div>
    </div>
  )
}

export default React.memo(SearchOverlay)
