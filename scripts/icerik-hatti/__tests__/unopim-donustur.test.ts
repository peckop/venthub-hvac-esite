/**
 * KTL-80 · UnoPIM → katalog_model dönüştürücü kuralları (saf işlevler, ağ/DB yok) + CLI fail-closed.
 *
 * Sabotaj mantığı: her kural hem YEŞİL (kabul) hem KIRMIZI (red) yönüyle sınanır; yalnız yeşili
 * sınayan bir sınav kuralın var olduğunu kanıtlamaz.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

import {
  birimHaritasi, csvAyristir, csvNesneler, dilGrupla, egriAyristir, modelDonustur, sayiya,
  teknikSutunlar, yayinEngelleri,
} from '../unopim-donustur-kurallar.mjs'

const BETIK = join(__dirname, '..', 'unopim-donustur.mjs')
const gecici = mkdtempSync(join(tmpdir(), 'ktl80-'))
afterAll(() => rmSync(gecici, { recursive: true, force: true }))

const BIRIMLER = { max_absorbed_power_w: 'Watt', weight_kg: 'Kilogram', noise_level_db_a: 'Decibel' }
const ALANLAR = ['max_absorbed_power_w', 'weight_kg', 'noise_level_db_a', 'ip_rating', 'has_timer', 'pq_curve']

function satir(dil: string, ek: Record<string, string> = {}) {
  return { locale: dil, sku: 'VRT-1', status: 'false', attribute_family: 'aile_a', name: '', url_key: 'x-1', image: '', ...ek }
}

describe('csvAyristir', () => {
  it('tırnaklı virgül, "" kaçışı, CRLF ve BOM', () => {
    const r = csvAyristir('﻿a,b\r\n"1,5","x ""y"""\r\n')
    expect(r).toEqual([['a', 'b'], ['1,5', 'x "y"']])
  })
  it('başlıklı nesneye çevirir, boş satırı atar', () => {
    expect(csvNesneler('a,b\n1,2\n\n')).toEqual([{ a: '1', b: '2' }])
  })
})

describe('birimHaritasi (eşleme tablosunun kendi tutarlılığı)', () => {
  it('tutarlı tablo: hata yok', () => {
    const { harita, hatalar } = birimHaritasi([{ alan: 'weight_kg', unopim_birim_etiketi: 'Kilogram' }])
    expect(hatalar).toEqual([])
    expect(harita.weight_kg).toBe('Kilogram')
  })
  it('soneki etiketle uyuşmayan alan HATA (sabotaj)', () => {
    const { hatalar } = birimHaritasi([{ alan: 'weight_kg', unopim_birim_etiketi: 'Watt' }])
    expect(hatalar.join()).toContain('uyuşmuyor')
  })
  it('bilinmeyen etiket ve çift etiket HATA', () => {
    expect(birimHaritasi([{ alan: 'x_kg', unopim_birim_etiketi: 'Furlong' }]).hatalar.join()).toContain('bilinmeyen')
    expect(birimHaritasi([
      { alan: 'a_w', unopim_birim_etiketi: 'Watt' }, { alan: 'a_w', unopim_birim_etiketi: 'Kilowatt' },
    ]).hatalar.join()).toContain('iki etiket')
  })
})

describe('modelDonustur', () => {
  const en = satir('en_US', {
    name: 'Fan A', max_absorbed_power_w: '110.0000', 'max_absorbed_power_w(unit)': 'Watt',
    weight_kg: '4.9000', 'weight_kg(unit)': 'Kilogram', ip_rating: 'IPX5', has_timer: 'true',
    pq_curve: '[[0,294.2],[1135,0]]',
  })
  const tr = satir('tr_TR', {})

  it('iki dil birleşir; değer SAYI, boolean boolean, durum taslak', () => {
    const s = modelDonustur({ en, tr }, ALANLAR, BIRIMLER)
    expect(s.kabul).toBe(true)
    expect(s.satir.durum).toBe('taslak')
    expect(s.satir.ad_en).toBe('Fan A')
    expect(s.satir.teknik).toEqual({ max_absorbed_power_w: 110, weight_kg: 4.9, ip_rating: 'IPX5', has_timer: true })
  })
  it('pq_curve kaynak etiketi olmadan teknik\'e GİRMEZ, eksik raporuna düşer', () => {
    const s = modelDonustur({ en, tr }, ALANLAR, BIRIMLER)
    expect(s.satir.teknik).not.toHaveProperty('pq_curve')
    expect(s.eksikler).toContain('EGRI_KAYNAK_ETIKETI')
    expect(s.egriKaynaksiz).toBe(true)
  })
  it('boş tr_TR adı HATA değil EKSİK; slug daima karar bekliyor ve boş', () => {
    const s = modelDonustur({ en, tr }, ALANLAR, BIRIMLER)
    expect(s.kabul).toBe(true)
    expect(s.eksikler).toEqual(expect.arrayContaining(['AD_TR', 'ACIKLAMA_TR', 'SLUG_KARAR_BEKLIYOR']))
    expect(s.satir.slug_tr).toBeNull()
    expect(s.satir.slug_en).toBeNull()
    expect(yayinEngelleri(s.eksikler)).toEqual(expect.arrayContaining(['AD_TR', 'SLUG_KARAR_BEKLIYOR']))
  })
  it('birim etiketi beklenenden farklıysa satır REDDEDİLİR (sabotaj)', () => {
    const kotu = { ...en, 'weight_kg(unit)': 'Watt' }
    const s = modelDonustur({ en: kotu, tr }, ALANLAR, BIRIMLER)
    expect(s.kabul).toBe(false)
    expect(s.hatalar.map((h: { kod: string }) => h.kod)).toContain('BIRIM_UYUSMAZ')
    expect(s.satir.teknik).not.toHaveProperty('weight_kg')
  })
  it('değer var ama birim etiketi boşsa HATA; sayı olmayan ölçülü değer HATA', () => {
    const e1 = { ...en, 'weight_kg(unit)': '' }
    expect(modelDonustur({ en: e1, tr }, ALANLAR, BIRIMLER).hatalar.map((h: { kod: string }) => h.kod)).toContain('BIRIM_BOS')
    const e2 = { ...en, weight_kg: 'ağır' }
    expect(modelDonustur({ en: e2, tr }, ALANLAR, BIRIMLER).hatalar.map((h: { kod: string }) => h.kod)).toContain('DEGER_SAYI_DEGIL')
  })
  it('iki dil satırı aynı alanda çelişirse HATA', () => {
    const t = { ...tr, ip_rating: 'IP44' }
    const s = modelDonustur({ en, tr: t }, ALANLAR, BIRIMLER)
    expect(s.hatalar.map((h: { kod: string }) => h.kod)).toContain('DIL_CELISKI')
  })
  it('kötü sku deseni, eksik dil satırı ve bilinmeyen durum HATA', () => {
    expect(modelDonustur({ en: { ...en, sku: 'vrt 1' }, tr }, ALANLAR, BIRIMLER).hatalar.map((h: { kod: string }) => h.kod)).toContain('SKU_DESEN')
    expect(modelDonustur({ en, tr: undefined }, ALANLAR, BIRIMLER).hatalar.map((h: { kod: string }) => h.kod)).toContain('DIL_EKSIK')
    expect(modelDonustur({ en: { ...en, status: '?' }, tr }, ALANLAR, BIRIMLER).hatalar.map((h: { kod: string }) => h.kod)).toContain('DURUM_BILINMIYOR')
  })
  it('hiç teknik değer yoksa TEKNIK_BOS', () => {
    const s = modelDonustur({ en: satir('en_US', { name: 'B' }), tr: satir('tr_TR') }, ALANLAR, BIRIMLER)
    expect(s.eksikler).toContain('TEKNIK_BOS')
  })
})

describe('yardımcılar', () => {
  it('sayiya', () => {
    expect(sayiya('251.0000')).toBe(251)
    expect(sayiya('1,5')).toBe(1.5)
    expect(sayiya('IPX5')).toBeNull()
  })
  it('egriAyristir: x artan ve ≥2 nokta', () => {
    expect(egriAyristir('[[0,10],[5,0]]')).toEqual([[0, 10], [5, 0]])
    expect(egriAyristir('[[5,10],[0,0]]')).toBeNull()
    expect(egriAyristir('[[0,1]]')).toBeNull()
    expect(egriAyristir('bozuk')).toBeNull()
  })
  it('teknikSutunlar meta ve (unit) sütunlarını dışlar', () => {
    expect(teknikSutunlar(['sku', 'name', 'price (USD)', 'weight_kg', 'weight_kg(unit)', 'ip_rating'])).toEqual(['weight_kg', 'ip_rating'])
  })
  it('dilGrupla aynı dil satırı tekrarını ve bilinmeyen dili raporlar', () => {
    const { gruplar, tekrar } = dilGrupla([
      { sku: 'A', locale: 'en_US' }, { sku: 'A', locale: 'en_US' }, { sku: 'A', locale: 'fr_FR' }, { sku: 'A', locale: 'tr_TR' },
    ])
    expect(Object.keys(gruplar.get('A') as object).sort()).toEqual(['en', 'tr'])
    expect(tekrar).toHaveLength(2)
  })
})

describe('CLI uçtan uca (kuru koşu) ve fail-closed', () => {
  const csv = [
    'channel,locale,sku,status,attribute_family,name,url_key,image,weight_kg,weight_kg(unit)',
    'default,en_US,VRT-1,false,aile_a,Fan A,fan-a-1,product/1/image/01.png,4.9000,Kilogram',
    'default,tr_TR,VRT-1,false,aile_a,,fan-a-1,product/1/image/01.png,4.9000,Kilogram',
  ].join('\n')
  const birim = 'alan,unopim_birim_etiketi,satir_sayisi\nweight_kg,Kilogram,2\n'
  const sinif = 'sku,sinif,gorsel_dosyasi\nVRT-1,seri-tahmin,vortice/x/VRT-1/original/01.png\n'

  it('çıktıları üretir ve seri-tahmin görselini uyarıyla işaretler', () => {
    writeFileSync(join(gecici, 'u.csv'), csv)
    writeFileSync(join(gecici, 'b.csv'), birim)
    writeFileSync(join(gecici, 's.csv'), sinif)
    const cikti = join(gecici, 'cikti')
    execFileSync('node', [BETIK, '--csv', join(gecici, 'u.csv'), '--birim', join(gecici, 'b.csv'), '--sinif', join(gecici, 's.csv'), '--cikti', cikti])
    const ozet = JSON.parse(readFileSync(join(cikti, 'ozet.json'), 'utf8'))
    expect(ozet.girdi.urun).toBe(1)
    expect(ozet.kabul_edilen).toBe(1)
    expect(ozet.yayina_hazir).toBe(0)
    const gorsel = JSON.parse(readFileSync(join(cikti, 'katalog_model_gorsel.json'), 'utf8'))
    expect(gorsel[0].yayin_uyarisi).toContain('seri-tahmin')
    const model = JSON.parse(readFileSync(join(cikti, 'katalog_model.json'), 'utf8'))
    expect(model[0].teknik).toEqual({ weight_kg: 4.9 })
  })
  it('girdi yoksa çıkış 2 (ÖLÇÜLEMEDİ), 0 DEĞİL', () => {
    const r = spawnSync('node', [BETIK, '--csv', join(gecici, 'yok.csv'), '--birim', join(gecici, 'b.csv'), '--cikti', join(gecici, 'c2')])
    expect(r.status).toBe(2)
  })
  it('birim tablosu kendi içinde tutarsızsa çıkış 2', () => {
    writeFileSync(join(gecici, 'kotu.csv'), 'alan,unopim_birim_etiketi,satir_sayisi\nweight_kg,Watt,1\n')
    const r = spawnSync('node', [BETIK, '--csv', join(gecici, 'u.csv'), '--birim', join(gecici, 'kotu.csv'), '--cikti', join(gecici, 'c3')])
    expect(r.status).toBe(2)
  })
})
