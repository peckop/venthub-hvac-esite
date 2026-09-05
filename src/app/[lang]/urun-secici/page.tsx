/**
 * ÜRÜN SEÇİCİ — hesaplama araçlarının tek kalıcı girişi (karar K17 · K "Ürün Seçici", 2026-09-04).
 *
 * NİÇİN VAR: karar "seçicinin kalıcı bir girişi olur, adı Ürün Seçici; tek ad, tek hedef"
 * diyor. 2026-09-05'te ölçüldüğünde durum şuydu: dört hesaplama aracı canlıda ÇALIŞIYOR
 * ama ortak bir kapıları YOK — ana sayfadan yalnız birine (HRV) doğrudan bağlantı vardı,
 * header'da "Hesaplayıcılar" diye bir menü öğesi hiç yoktu, ve `/destek/hesaplayicilar`
 * dizin adresi 404 veriyordu (oysa `Routes.destek.hesaplayicilar()` slug'sız çağrılınca
 * tam o adresi üretebiliyordu — kodda üretilebilen, sitede olmayan bir adres).
 *
 * ⚠NE YAPMIYOR: dört aracı BİRLEŞTİRMİYOR. Karar metni "dört yol tek yola iner" diyor,
 * ama o birleşmenin motoru K18'e bağlı ve K18 açıkça "İSTİŞARE — KARAR DEĞİL" diye
 * işaretli. Motor hazır olmadan dört çalışan aracı tek sayfaya yönlendirmek canlıdan
 * yetenek silmek olurdu. Bu yüzden iş ikiye bölündü (OPS onayı, 2026-09-05):
 *   Adım 1 (bu sayfa) — tek ad + tek giriş, araçlar yerinde.
 *   Adım 2 (sonra)    — motorlar hazır olunca dört iç adres tek sayfaya 301'lenir.
 *
 * RSC: bu sayfa etkileşimli değil (başlık + dört bağlantı kartı), bu yüzden `'use client'`
 * YOK — CLAUDE.md kural 4. Sözlük sunucuda doğrudan okunur (kategori sayfalarının deseni).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { SITE_URL } from '@/config/siteUrl'
import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'
import { localizedHref, Routes } from '@/utils/routes'

type Params = { lang: string }

/**
 * Sözlük DOĞRUDAN okunur ve değişken adı bilerek `dict` — i18n ölü-anahtar kapısı
 * (INV-6) tüketimi `dict.<yol>` biçiminden tanıyor. Başka bir ada (`d`, `sozluk`)
 * koyulursa anahtarlar CANLI oldukları hâlde "ölü" sayılır ve kapı haklı olarak kırmızı
 * verir; 2026-09-05'te tam bunu yaşadım. Kapıyı gevşetmek yerine tüketimi kapının
 * tanıdığı biçime getirmek doğrusu — kategori sayfalarının deseni de bu.
 */
const sozlukSec = (lang: string) => (lang === 'en' ? en : tr)

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { lang } = await params
    const dict = sozlukSec(lang)
    /**
     * Adresler SSOT'tan kurulur: taban `SITE_URL` (INV-CANONICAL-1), dil öneki
     * `localizedHref` (INV-2 / CLAUDE.md kural 7 — elle `/tr/` birleştirme yasak).
     * İlk yazımda ikisini de elle kurmuştum; iki kapı da yakaladı ve haklıydılar.
     */
    const trUrl = `${SITE_URL}${localizedHref(Routes.urunSecici(), 'tr')}`
    const enUrl = `${SITE_URL}${localizedHref(Routes.urunSecici(), 'en')}`
    return {
        title: `${dict.urunSecici.baslik} | VentHub`,
        description: dict.urunSecici.aciklama,
        alternates: {
            canonical: lang === 'en' ? enUrl : trUrl,
            languages: { tr: trUrl, en: enUrl, 'x-default': trUrl },
        },
    }
}

export default async function UrunSeciciPage({ params }: { params: Promise<Params> }) {
    const { lang } = await params
    const dict = sozlukSec(lang)

    /**
     * Kartlar ELLE ve LİTERAL yazılır — döngüyle `t(değişken)` üretmek i18n ölü-anahtar
     * kapısını kör eder (2026-09-04'te sahada ölçüldü). Dört araç, dört literal kayıt.
     */
    const araclar = [
        { anahtar: 'kanal', ad: dict.urunSecici.araclar.kanal.ad, aciklama: dict.urunSecici.araclar.kanal.aciklama },
        { anahtar: 'hrv', ad: dict.urunSecici.araclar.hrv.ad, aciklama: dict.urunSecici.araclar.hrv.aciklama },
        { anahtar: 'hava-perdesi', ad: dict.urunSecici.araclar.havaPerdesi.ad, aciklama: dict.urunSecici.araclar.havaPerdesi.aciklama },
        { anahtar: 'jet-fan', ad: dict.urunSecici.araclar.jetFan.ad, aciklama: dict.urunSecici.araclar.jetFan.aciklama },
    ] as const

    /*
      Kök öğe <section>, <main> DEĞİL — MainLayout zaten `<main id="main-content">` çiziyor.
      İç içe iki <main>, ekran okuyucuda ÇİFT ANA BÖLGE demektir (axe:
      landmark-no-duplicate-main) ve "ana içeriğe atla" bağlantısını belirsizleştirir.
      İlk yazımda <main> koymuştum; kod incelemesi yakaladı.
    */
    return (
        <section className="mx-auto w-full max-w-5xl px-4 py-10 md:py-14">
            <header className="mb-8 md:mb-10">
                <p className="mb-2 text-sm font-medium uppercase tracking-wide text-steel-gray">
                    {dict.urunSecici.ustBaslik}
                </p>
                <h1 className="mb-3 text-2xl font-semibold text-industrial-gray md:text-3xl">
                    {dict.urunSecici.baslik}
                </h1>
                <p className="max-w-2xl text-base text-steel-gray">{dict.urunSecici.aciklama}</p>
            </header>

            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {araclar.map((a) => (
                    <li key={a.anahtar}>
                        <Link
                            href={localizedHref(Routes.destek.hesaplayicilar(a.anahtar), lang)}
                            className="block h-full rounded-lg border border-light-gray bg-white p-5 transition-colors hover:border-primary-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-navy"
                        >
                            <span className="mb-1 block text-lg font-medium text-industrial-gray">
                                {a.ad}
                            </span>
                            <span className="block text-sm text-steel-gray">{a.aciklama}</span>
                        </Link>
                    </li>
                ))}
            </ul>

            <p className="mt-8 text-sm text-steel-gray">{dict.urunSecici.not}</p>
        </section>
    )
}
