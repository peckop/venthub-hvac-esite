import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import DateRangePicker from '../DateRangePicker'

/**
 * T113-VH · react-day-picker v9 geçişinin DAVRANIŞ kanıtı.
 *
 * NİÇİN BU TEST VAR (K13: varlık ≠ kullanım)
 *
 * INV-PEER-1'deki muafiyet gerekçesi şunu yazıyordu: "Admin tarih filtresi
 * çalışıyor ... ama bu DAVRANIŞ kanıtı değil, yalnızca çökmediği gözlemi."
 * Bu dosya o eksiği kapatır. Sorduğu şey "takvim render oldu mu" DEĞİL,
 * "tarih filtresi gerçekten bir aralık ÜRETİYOR ve o aralık kullanılabilir mi"
 * sorusudur.
 *
 * NİÇİN ÖZELLİKLE v9 GEÇİŞİNDE
 *
 * v9'un kırılması SESSİZDİR: `tsc` temiz geçer, hiçbir test kırmızı olmaz,
 * yalnızca takvim çıplak render olur ve seçim yolu bozulursa filtre boş döner.
 * Bu yüzden burada iki ayrı şey ölçülür:
 *
 *   1. Seçim ÜRETİYOR MU — hazır aralık düğmesi gerçek bir `DateRange` yayıyor
 *      mu, ve o aralığın sınırları tutarlı mı (from <= to).
 *   2. Sınıf haritası GERÇEKTEN İNİYOR MU — takvimin DOM'unda admin sınıfları
 *      var mı. v8 anahtarları v9'da sessizce yok sayıldığı için bu, geçişin
 *      "yapıldı" değil "işe yaradı" kanıtıdır.
 */

describe('DateRangePicker · v9 davranış kanıtı (T113-VH)', () => {
  it('hazır aralık seçimi GERÇEK bir tarih aralığı üretir (varlık değil kullanım)', () => {
    const onChange = vi.fn()

    /*
     * KONTROLLÜ kullanım — gerçek çağrı yerleri (AdminInventoryReportPage,
     * OrdersTableBody) bileşeni böyle kullanır: `value` dışarıda tutulur.
     * Kontrolsüz kullanımda bileşen seçimi `value`'ya geri senkronladığı için
     * seçim ayakta kalmaz; bunu ölçerek gördüm ve ayrıca rapor ettim.
     */
    function Sarmalayici() {
      const [aralik, setAralik] = React.useState<
        { from?: Date; to?: Date } | undefined
      >(undefined)
      return (
        <DateRangePicker
          value={aralik as never}
          onChange={(r) => {
            setAralik(r)
            onChange(r)
          }}
        />
      )
    }
    render(<Sarmalayici />)

    fireEvent.click(screen.getByRole('button'))

    /* Hazır aralık düğmelerinden ilkine bas: hangi etiket olursa olsun,
       ölçtüğümüz şey ETİKET değil ÜRETİLEN ARALIK. */
    const secenekler = screen
      .getAllByRole('button')
      .filter((b) => b.className.includes('text-left'))
    expect(secenekler.length, 'hazir aralik secenegi hic bulunamadi').toBeGreaterThan(0)
    fireEvent.click(secenekler[0])

    /*
     * Seçim TEK BAŞINA yaymaz — bileşen bilinçli olarak "uygula"ya kadar
     * bekletir. Bunu da ölçerek öğrendim: önce doğrudan onChange bekledim ve
     * test kırmızı oldu; kusur bileşende değil benim akış varsayımımdaydı.
     */
    const uygula = screen
      .getAllByRole('button')
      .find((b) => b.className.includes('bg-admin-accent') && b.className.includes('px-6'))
    expect(uygula, 'uygula dugmesi bulunamadi').toBeTruthy()
    fireEvent.click(uygula!)

    expect(onChange).toHaveBeenCalled()
    const aralik = onChange.mock.calls[0][0]
    expect(aralik, 'onChange bos aralik yaydi').toBeTruthy()
    expect(aralik.from instanceof Date, 'from bir Date degil').toBe(true)
    expect(aralik.to instanceof Date, 'to bir Date degil').toBe(true)
    expect(
      aralik.from.getTime() <= aralik.to.getTime(),
      'aralik ters: from, to dan sonra',
    ).toBe(true)
  })

  it('takvimin sınıf haritası DOM’a gerçekten iniyor (v8 anahtarları sessizce düşerdi)', () => {
    render(<DateRangePicker />)
    fireEvent.click(screen.getByRole('button'))

    /*
     * `weekday` v9 anahtarıdır; v8'de adı `head_cell` idi. Harita eski
     * anahtarlarla kalsaydı bu sınıf DOM'a HİÇ inmezdi ve hiçbir kapı
     * bunu görmezdi — testin varlık sebebi tam olarak bu.
     */
    const haftaBasliklari = document.querySelectorAll('.text-admin-fg-muted.w-9')
    expect(
      haftaBasliklari.length,
      'Haftanin gun basliklarina admin sinifi inmedi - siniflar sessizce dusmus olabilir',
    ).toBeGreaterThan(0)
  })
})
