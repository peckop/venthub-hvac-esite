import { describe, expect, it } from 'vitest'
import { durumPlani, tersPlan } from '../urun-durum.mjs'

const canli = [
  { id: 'a', sku: 'VRT-16107', status: 'active' },
  { id: 'b', sku: 'VRT-16108', status: 'archived' },
  { id: 'c', sku: 'VRT-16109', status: 'draft' },
]
const temel = { _nicin: 'REC-397', _kanit: 's.33', karar: '130' }

describe('urun-durum çekirdeği (REC-397)', () => {
  it('beklenen önceki durumdaki ürünü yazar, zaten istenen durumdakini atlar', () => {
    const p = durumPlani(canli, { ...temel, skus: { 'VRT-16107': { onceki: 'active', yeni: 'archived' }, 'VRT-16108': { onceki: 'active', yeni: 'archived' } } })
    expect(p.yazilacak.map(y => y.sku)).toEqual(['VRT-16107'])
    expect(p.ayni.map(y => y.sku)).toEqual(['VRT-16108'])
    expect(p.red).toEqual([])
  })

  it('canlıda olmayan, önceki durumu tutmayan ve izinsiz değerli satırları RED yapar', () => {
    const p = durumPlani(canli, { ...temel, skus: {
      'VRT-99999': { onceki: 'active', yeni: 'archived' },
      'VRT-16109': { onceki: 'active', yeni: 'archived' },
      'VRT-16107': { onceki: 'active', yeni: 'pasif' },
    } })
    expect(p.red.map(r => r.sku).sort()).toEqual(['VRT-16107', 'VRT-16109', 'VRT-99999'])
    expect(p.yazilacak).toEqual([])
  })

  it('gerekçesiz ya da boş plan RED', () => {
    expect(durumPlani(canli, { skus: { 'VRT-16107': { onceki: 'active', yeni: 'archived' } } }).red.length).toBe(1)
    expect(durumPlani(canli, { ...temel, skus: {} }).red.length).toBe(1)
  })

  it('ters plan yazımı birebir geri alır', () => {
    const plan = { ...temel, skus: { 'VRT-16107': { onceki: 'active', yeni: 'archived' } } }
    const { yazilacak } = durumPlani(canli, plan)
    const ters = tersPlan(plan, yazilacak)
    const sonra = [{ id: 'a', sku: 'VRT-16107', status: 'archived' }]
    const geri = durumPlani(sonra, ters)
    expect(geri.yazilacak).toEqual([{ sku: 'VRT-16107', id: 'a', onceki: 'archived', yeni: 'active' }])
    expect(geri.red).toEqual([])
  })
})
