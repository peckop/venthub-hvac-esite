'use client'
/**
 * Sessiz kanal fanı seçim sihirbazı — T150-VH.
 *
 * TASARIM KRİTERLERİ (Recep'in açık istisnasıyla, kriter yetkisi bizde):
 * "kullanıcı hiç zorluk çekmeden ürünü seçebilmeli". Bunun karşılığı dört karar:
 *  1. Kullanıcıya ASLA mühendislik büyüklüğü sorulmaz — m³/h, Pa, dB(A) girdisi yok.
 *     Sorulan her şey gözle bilinen şey: oda ne kadar, kanal ne kadar uzun, sessizlik
 *     ne kadar önemli. Debi ve basınç motorda hesaplanır (`ductFanSelection`).
 *  2. HER adımın varsayılanı doludur. Kullanıcı hiçbir şeye dokunmadan "Sonucu gör"
 *     diyebilir ve makul bir cevap alır; sihirbaz bir engel değil, bir kısayoldur.
 *  3. Sonuç TEK bir "doğru" değil ÜÇ öneridir (en uygun / en sessiz / en verimli),
 *     çünkü kullanıcının önceliği tek boyutlu değildir.
 *  4. Sonuç GEREKÇELİDİR: "odanız X m³, saatte Y hava değişimi için Z m³/h gerekiyor;
 *     bu model sizin kanalınızda W m³/h veriyor" — kullanıcı sayıyı görmek zorunda değil
 *     ama isterse görebilmeli. Kara kutu güven vermez.
 *
 * Hava perdesi sihirbazından (`EnhancedNeedsWizard`) AYRI bir bileşendir: o, kapı ölçüsü
 * ve ısıtıcı ihtiyacı soran bir hava perdesi hesap motorudur; bu alanın soruları da
 * eşleme kuralları da tamamen farklıdır.
 */
import {
  Bath,
  Building2,
  ChefHat,
  ChevronLeft,
  Loader2,
  Moon,
  Ruler,
  Sofa,
  Store,
  Volume2,
  Wind,
  X,
} from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

import { useLocalizedRoutes } from '@/hooks/useLocalizedRoutes'
import { useI18n } from '@/i18n/I18nProvider'
import {
  type AdaySonucu,
  type FanAdayi,
  type KanalGuzergahi,
  type MahalTipi,
  type SecimGirdisi,
  type SecimSonucu,
  secimYap,
  type SessizlikOnceligi,
} from '@/lib/hvac/ductFanSelection'
import type { KanalMalzemesi } from '@/lib/hvac/ductPressure'
import { getWizardCandidates } from '@/lib/services/wizard.service'
import { supabaseBrowserClient as supabase } from '@/lib/supabase/client'

interface SilentFanWizardProps {
  isOpen: boolean
  onClose: () => void
  /** Adayların çekileceği kategori (kanonik slug). */
  categorySlug: string
}

type Adim = 1 | 2 | 3 | 4 | 5

/** Kullanıcının hiçbir şeye dokunmadan sonuç alabilmesi için tüm alanlar dolu başlar. */
const VARSAYILAN_GIRDI: SecimGirdisi = {
  mahal: 'bathroom',
  alanM2: 8,
  tavanYuksekligiM: 2.5,
  guzergah: 'medium',
  sessizlik: 'important',
  kanalCapiMm: null,
  malzeme: 'galvanized',
}

const MAHALLER: ReadonlyArray<{ id: MahalTipi; ikon: typeof Bath }> = [
  { id: 'bathroom', ikon: Bath },
  { id: 'kitchen', ikon: ChefHat },
  { id: 'bedroom', ikon: Moon },
  { id: 'living', ikon: Sofa },
  { id: 'office', ikon: Building2 },
  { id: 'shop', ikon: Store },
]

const GUZERGAHLAR: readonly KanalGuzergahi[] = ['short', 'medium', 'long']
const MALZEMELER: readonly KanalMalzemesi[] = ['galvanized', 'pvc', 'flex']
const SESSIZLIKLER: readonly SessizlikOnceligi[] = ['normal', 'important', 'critical']
/** Katalogdaki ayrık kanal çapları; kullanıcı biliyorsa seçer, bilmiyorsa boş bırakır. */
const CAPLAR = [100, 125, 150, 200, 250, 315] as const

const KART_TEMEL =
  'focus-ring group p-5 text-left rounded-3xl border transition-shadow duration-500'
const KART_PASIF = 'border-slate-100 bg-slate-50 hover:border-cyan-500/30 hover:bg-white hover:shadow-xl'
const KART_AKTIF = 'border-cyan-500 bg-white shadow-xl'

export default function SilentFanWizard({ isOpen, onClose, categorySlug }: SilentFanWizardProps) {
  const { t } = useI18n()
  const Routes = useLocalizedRoutes()

  const [adim, setAdim] = useState<Adim>(1)
  const [girdi, setGirdi] = useState<SecimGirdisi>(VARSAYILAN_GIRDI)
  const [adaylar, setAdaylar] = useState<FanAdayi[] | null>(null)
  const [yukleniyor, setYukleniyor] = useState(false)
  const [hata, setHata] = useState<string | null>(null)
  const [sonuc, setSonuc] = useState<SecimSonucu | null>(null)
  const [dokumAcik, setDokumAcik] = useState(false)

  // Adaylar bir kez çekilir; sonraki hesaplar aynı liste üzerinde yapılır.
  const adaylariGetir = useCallback(async () => {
    if (adaylar !== null) return adaylar
    setYukleniyor(true)
    setHata(null)
    try {
      const liste = await getWizardCandidates(supabase, categorySlug)
      setAdaylar(liste)
      return liste
    } catch (err) {
      // Hata YUTULMAZ. Hava perdesi sihirbazı tam bu yüzden beş ay boyunca sessizce
      // boş sonuç gösterdi; burada kullanıcı ne olduğunu görür.
      setHata(err instanceof Error ? err.message : String(err))
      return null
    } finally {
      setYukleniyor(false)
    }
  }, [adaylar, categorySlug])

  useEffect(() => {
    if (adim !== 5) return
    let iptal = false
    void (async () => {
      const liste = await adaylariGetir()
      if (iptal || !liste) return
      setSonuc(secimYap(liste, girdi))
    })()
    return () => {
      iptal = true
    }
  }, [adim, girdi, adaylariGetir])

  if (!isOpen) return null

  const ileri = () => setAdim((a) => Math.min(5, a + 1) as Adim)
  const geri = () => setAdim((a) => Math.max(1, a - 1) as Adim)
  const bastanBasla = () => {
    setAdim(1)
    setGirdi(VARSAYILAN_GIRDI)
    setSonuc(null)
    setDokumAcik(false)
  }

  const yaz = (parca: Partial<SecimGirdisi>) => setGirdi((g) => ({ ...g, ...parca }))

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sessiz-fan-sihirbaz-baslik"
    >
      <button
        type="button"
        className="absolute inset-0 w-full h-full bg-slate-900/60 backdrop-blur-xl cursor-default border-none outline-none"
        onClick={onClose}
        aria-label={t('common.close')}
        tabIndex={-1}
      />

      <div className="relative w-full max-w-4xl bg-white rounded-hvac-2xl shadow-2xl overflow-hidden flex flex-col max-h-90vh">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            {adim > 1 && (
              <button
                type="button"
                onClick={geri}
                aria-label={t('silentFanWizard.goBack')}
                className="focus-ring p-2 hover:bg-white rounded-xl transition-colors"
              >
                <ChevronLeft size={20} className="text-slate-400" />
              </button>
            )}
            <div>
              <h3 id="sessiz-fan-sihirbaz-baslik" className="text-lg font-bold text-slate-900">
                {t('silentFanWizard.headerTitle')}
              </h3>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`h-1 rounded-full transition-colors duration-500 ${
                      s <= adim ? 'w-6 bg-cyan-500' : 'w-2 bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="focus-ring p-2 hover:bg-white rounded-xl transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* 1 — MAHAL */}
          {adim === 1 && (
            <section className="space-y-8">
              <header className="text-center max-w-lg mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                  {t('silentFanWizard.step1Title')}
                </h2>
                <p className="text-slate-500 font-light leading-relaxed">
                  {t('silentFanWizard.step1Desc')}
                </p>
              </header>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {MAHALLER.map(({ id, ikon: Ikon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      yaz({ mahal: id })
                      ileri()
                    }}
                    className={`${KART_TEMEL} ${girdi.mahal === id ? KART_AKTIF : KART_PASIF}`}
                  >
                    <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center mb-4 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                      <Ikon size={20} />
                    </div>
                    <p className="font-bold text-slate-900">{t(`silentFanWizard.room.${id}`)}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {t(`silentFanWizard.roomHint.${id}`)}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* 2 — ODA BÜYÜKLÜĞÜ */}
          {adim === 2 && (
            <section className="space-y-8">
              <header className="text-center max-w-lg mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                  {t('silentFanWizard.step2Title')}
                </h2>
                <p className="text-slate-500 font-light leading-relaxed">
                  {t('silentFanWizard.step2Desc')}
                </p>
              </header>

              <div className="max-w-lg mx-auto space-y-8">
                <div>
                  <label htmlFor="oda-alan" className="flex justify-between items-baseline mb-3">
                    <span className="font-bold text-slate-900">{t('silentFanWizard.areaLabel')}</span>
                    <span className="text-2xl font-black text-cyan-600">
                      {girdi.alanM2} {t('silentFanWizard.unitM2')}
                    </span>
                  </label>
                  <input
                    id="oda-alan"
                    type="range"
                    min={2}
                    max={60}
                    step={1}
                    value={girdi.alanM2}
                    onChange={(e) => yaz({ alanM2: Number(e.target.value) })}
                    className="focus-ring w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <label htmlFor="tavan" className="flex justify-between items-baseline mb-3">
                    <span className="font-bold text-slate-900">
                      {t('silentFanWizard.ceilingLabel')}
                    </span>
                    <span className="text-2xl font-black text-cyan-600">
                      {girdi.tavanYuksekligiM.toFixed(1)} {t('silentFanWizard.unitM')}
                    </span>
                  </label>
                  <input
                    id="tavan"
                    type="range"
                    min={2}
                    max={4}
                    step={0.1}
                    value={girdi.tavanYuksekligiM}
                    onChange={(e) => yaz({ tavanYuksekligiM: Number(e.target.value) })}
                    className="focus-ring w-full accent-cyan-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={ileri}
                  className="focus-ring w-full bg-primary-navy text-white py-4 rounded-2xl font-bold hover:bg-secondary-blue transition-colors active:scale-95"
                >
                  {t('silentFanWizard.continue')}
                </button>
              </div>
            </section>
          )}

          {/* 3 — KANAL */}
          {adim === 3 && (
            <section className="space-y-8">
              <header className="text-center max-w-lg mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                  {t('silentFanWizard.step3Title')}
                </h2>
                <p className="text-slate-500 font-light leading-relaxed">
                  {t('silentFanWizard.step3Desc')}
                </p>
              </header>

              <div className="space-y-6">
                <fieldset>
                  <legend className="font-bold text-slate-900 mb-3">
                    {t('silentFanWizard.routeLabel')}
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {GUZERGAHLAR.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => yaz({ guzergah: g })}
                        className={`${KART_TEMEL} ${girdi.guzergah === g ? KART_AKTIF : KART_PASIF}`}
                      >
                        <p className="font-bold text-slate-900">{t(`silentFanWizard.route.${g}`)}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {t(`silentFanWizard.routeHint.${g}`)}
                        </p>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="font-bold text-slate-900 mb-3">
                    {t('silentFanWizard.materialLabel')}
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {MALZEMELER.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => yaz({ malzeme: m })}
                        className={`${KART_TEMEL} ${girdi.malzeme === m ? KART_AKTIF : KART_PASIF}`}
                      >
                        <p className="font-bold text-slate-900">
                          {t(`silentFanWizard.material.${m}`)}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {t(`silentFanWizard.materialHint.${m}`)}
                        </p>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="font-bold text-slate-900 mb-3">
                    {t('silentFanWizard.diameterLabel')}
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => yaz({ kanalCapiMm: null })}
                      className={`focus-ring px-4 py-2 rounded-xl border font-bold transition-colors ${
                        girdi.kanalCapiMm === null
                          ? 'border-cyan-500 bg-cyan-500 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-500/40'
                      }`}
                    >
                      {t('silentFanWizard.diameterUnknown')}
                    </button>
                    {CAPLAR.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => yaz({ kanalCapiMm: c })}
                        className={`focus-ring px-4 py-2 rounded-xl border font-bold transition-colors ${
                          girdi.kanalCapiMm === c
                            ? 'border-cyan-500 bg-cyan-500 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-500/40'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    {t('silentFanWizard.diameterHint')}
                  </p>
                </fieldset>

                <button
                  type="button"
                  onClick={ileri}
                  className="focus-ring w-full bg-primary-navy text-white py-4 rounded-2xl font-bold hover:bg-secondary-blue transition-colors active:scale-95"
                >
                  {t('silentFanWizard.continue')}
                </button>
              </div>
            </section>
          )}

          {/* 4 — SESSİZLİK */}
          {adim === 4 && (
            <section className="space-y-8">
              <header className="text-center max-w-lg mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                  {t('silentFanWizard.step4Title')}
                </h2>
                <p className="text-slate-500 font-light leading-relaxed">
                  {t('silentFanWizard.step4Desc')}
                </p>
              </header>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {SESSIZLIKLER.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      yaz({ sessizlik: s })
                      ileri()
                    }}
                    className={`${KART_TEMEL} ${girdi.sessizlik === s ? KART_AKTIF : KART_PASIF}`}
                  >
                    <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center mb-4 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                      <Volume2 size={20} />
                    </div>
                    <p className="font-bold text-slate-900">{t(`silentFanWizard.quiet.${s}`)}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {t(`silentFanWizard.quietHint.${s}`)}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* 5 — SONUÇ */}
          {adim === 5 && (
            <section className="space-y-8">
              {yukleniyor && (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Loader2 size={32} className="animate-spin text-cyan-500" />
                  <p className="text-slate-500">{t('silentFanWizard.calculating')}</p>
                </div>
              )}

              {hata && !yukleniyor && (
                <div className="max-w-lg mx-auto text-center py-12">
                  <p className="font-bold text-slate-900 mb-2">{t('silentFanWizard.errorTitle')}</p>
                  <p className="text-slate-500">{t('silentFanWizard.errorDesc')}</p>
                </div>
              )}

              {sonuc && !yukleniyor && !hata && (
                <>
                  <header className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                      {t('silentFanWizard.resultTitle')}
                    </h2>
                    <p className="text-slate-500 font-light leading-relaxed">
                      {t('silentFanWizard.resultNeed', {
                        hacim: Math.round(sonuc.hesap.hacimM3),
                        debi: Math.round(sonuc.hesap.tasarimDebiM3h),
                      })}
                    </p>
                  </header>

                  {sonuc.uygunlar.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="font-bold text-slate-900 mb-2">
                        {t('silentFanWizard.noMatchTitle')}
                      </p>
                      <p className="text-slate-500">{t('silentFanWizard.noMatchDesc')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <OneriKarti
                        sonuc={sonuc.enUygun}
                        rozet={t('silentFanWizard.badgeBest')}
                        vurgulu
                        Routes={Routes}
                        t={t}
                      />
                      <OneriKarti
                        sonuc={sonuc.enSessiz}
                        rozet={t('silentFanWizard.badgeQuietest')}
                        Routes={Routes}
                        t={t}
                      />
                      <OneriKarti
                        sonuc={sonuc.enVerimli}
                        rozet={t('silentFanWizard.badgeEfficient')}
                        Routes={Routes}
                        t={t}
                      />
                    </div>
                  )}

                  <div className="max-w-2xl mx-auto">
                    <button
                      type="button"
                      onClick={() => setDokumAcik((a) => !a)}
                      className="focus-ring text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"
                    >
                      {dokumAcik
                        ? t('silentFanWizard.hideDetails')
                        : t('silentFanWizard.showDetails')}
                    </button>

                    {dokumAcik && (
                      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm bg-slate-50 rounded-2xl p-6">
                        <dt className="text-slate-500">{t('silentFanWizard.detailVolume')}</dt>
                        <dd className="font-bold text-slate-900">
                          {sonuc.hesap.hacimM3.toFixed(1)} {t('silentFanWizard.unitM3')}
                        </dd>
                        <dt className="text-slate-500">{t('silentFanWizard.detailAch')}</dt>
                        <dd className="font-bold text-slate-900">{sonuc.hesap.ach}{t('silentFanWizard.unitTimes')}</dd>
                        <dt className="text-slate-500">{t('silentFanWizard.detailNeed')}</dt>
                        <dd className="font-bold text-slate-900">
                          {Math.round(sonuc.hesap.tasarimDebiM3h)} {t('silentFanWizard.unitM3h')}
                          {sonuc.hesap.minimumUygulandi && (
                            <span className="font-normal text-slate-400">
                              {' '}
                              {t('silentFanWizard.detailMinApplied')}
                            </span>
                          )}
                        </dd>
                        <dt className="text-slate-500">{t('silentFanWizard.detailPressure')}</dt>
                        <dd className="font-bold text-slate-900">
                          {t('silentFanWizard.approx')} {Math.round(sonuc.sistemBasinciPa)} {t('silentFanWizard.unitPa')}
                        </dd>
                        <dt className="text-slate-500">{t('silentFanWizard.detailEliminated')}</dt>
                        <dd className="font-bold text-slate-900">{sonuc.elenenler.length}</dd>
                      </dl>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={bastanBasla}
                      className="focus-ring px-6 py-3 rounded-2xl border-2 border-slate-200 font-bold text-slate-600 hover:border-cyan-500 transition-colors"
                    >
                      {t('silentFanWizard.restart')}
                    </button>
                  </div>
                </>
              )}
            </section>
          )}
        </div>

        {adim < 5 && (
          <footer className="px-8 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <Ruler size={14} />
              {t('silentFanWizard.defaultsHint')}
            </p>
            <button
              type="button"
              onClick={() => setAdim(5)}
              className="focus-ring text-sm font-bold text-cyan-600 hover:text-cyan-700 transition-colors"
            >
              {t('silentFanWizard.skipToResult')}
            </button>
          </footer>
        )}
      </div>
    </div>
  )
}

/** Tek öneri kartı. `sonuc` null ise (o kategoride aday yoksa) hiç basılmaz. */
function OneriKarti({
  sonuc,
  rozet,
  vurgulu = false,
  Routes,
  t,
}: {
  sonuc: AdaySonucu | null
  rozet: string
  vurgulu?: boolean
  Routes: ReturnType<typeof useLocalizedRoutes>
  t: (key: string, params?: Record<string, string | number>) => string
}) {
  if (!sonuc) return null
  const { aday } = sonuc

  return (
    <article
      className={`rounded-3xl border p-6 flex flex-col ${
        vurgulu ? 'border-cyan-500 bg-white shadow-xl' : 'border-slate-100 bg-slate-50'
      }`}
    >
      <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-cyan-600 mb-3">
        <Wind size={12} />
        {rozet}
      </span>
      <h3 className="font-bold text-slate-900 leading-snug">{aday.ad}</h3>

      <dl className="mt-4 space-y-1 text-sm flex-1">
        <div className="flex justify-between">
          <dt className="text-slate-500">{t('silentFanWizard.cardDelivers')}</dt>
          <dd className="font-bold text-slate-900">
            {Math.round(sonuc.calismaDebisiM3h)} {t('silentFanWizard.unitM3h')}
          </dd>
        </div>
        {aday.sesDbA != null && (
          <div className="flex justify-between">
            <dt className="text-slate-500">{t('silentFanWizard.cardNoise')}</dt>
            <dd className="font-bold text-slate-900">{aday.sesDbA} {t('silentFanWizard.unitDbA')}</dd>
          </div>
        )}
        {aday.capMm != null && (
          <div className="flex justify-between">
            <dt className="text-slate-500">{t('silentFanWizard.cardDiameter')}</dt>
            <dd className="font-bold text-slate-900">{aday.capMm} {t('silentFanWizard.unitMm')}</dd>
          </div>
        )}
      </dl>

      <Link
        href={Routes.product(aday.slug)}
        className="focus-ring mt-5 text-center bg-primary-navy text-white py-3 rounded-2xl font-bold hover:bg-secondary-blue transition-colors"
      >
        {t('silentFanWizard.cardCta')}
      </Link>
    </article>
  )
}
