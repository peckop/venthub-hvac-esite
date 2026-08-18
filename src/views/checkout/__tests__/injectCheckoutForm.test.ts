/**
 * `injectCheckoutForm` davranış testleri.
 *
 * Bu modülün TEK var oluş sebebi, PSP parçasındaki betiğin GERÇEKTEN çalışmasıdır.
 * O yüzden testler "fonksiyon çağrıldı mı" diye değil, **betik yürüdü mü** diye sorar:
 * betiğin yan etkisi (global bir bayrak) ölçülür. Çağrının varlığını ölçmek bu modülde
 * sahte-yeşil üretirdi — `substring-assert-is-not-a-gate` dersi.
 *
 * NİÇİN KENDİ JSDOM ÖRNEĞİ (ölçüldü, varsayılmadı): projenin varsayılan test ortamı
 * betikleri **çalıştırmaz** — DOM API ile eklenen bir `<script>` bile yürümüyor
 * (probla doğrulandı; `@vitest-environment-options` docblock'u da bunu değiştirmedi).
 * O ortamda "innerHTML betiği çalıştırmaz" gibi bir kontrol **kod tamamen bozukken de
 * YEŞİL** kalırdı: yanlış sebeple geçen bir iddia, hiç olmayan iddiadan daha tehlikelidir.
 * Bu yüzden yürütme gerektiren testler `runScripts: 'dangerously'` açık kendi belgesinde
 * koşar. Enjektör `container.ownerDocument` kullandığı için belge-bağımsızdır; bu tasarım
 * kararı tam da burada işe yarıyor.
 */
import { JSDOM } from 'jsdom'
import { afterEach,beforeEach, describe, expect, it } from 'vitest'

import { hasRenderedSurface,injectCheckoutForm } from '../injectCheckoutForm'

let host: HTMLDivElement
/** Betiklerin GERÇEKTEN yürüdüğü belge (bkz. dosya başlığı). */
let dom: JSDOM
/** Betiklerin yan etkisini biriktirdiği dizi — yürütmenin tek kanıtı. */
let probe: () => string[]

beforeEach(() => {
  dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'dangerously' })
  const doc = dom.window.document
  const win = dom.window as unknown as { __vhInjectProbe: string[] }
  win.__vhInjectProbe = []
  probe = () => win.__vhInjectProbe

  host = doc.createElement('div') as unknown as HTMLDivElement
  doc.body.appendChild(host)
})

afterEach(() => {
  dom.window.close()
})

describe('injectCheckoutForm', () => {
  it('parçadaki satır-içi betiği GERÇEKTEN yürütür', () => {
    injectCheckoutForm(host, '<script>window.__vhInjectProbe.push("ran")</script>')

    expect(
      probe(),
      'Betik yürümedi. innerHTML ile eklenen script asla çalışmaz; düğüm yeniden yaratılmalı.',
    ).toEqual(['ran'])
  })

  /**
   * Bu test, düzeltilen kusurun AYNASIDIR: eski kod parçayı `dangerouslySetInnerHTML` ile
   * basıyordu. Aşağıdaki `innerHTML` ataması onun birebir eşdeğeri — ve betik ÇALIŞMAZ.
   * Testin amacı davranışın gerçekten farklı olduğunu göstermek, iddiaya güvenmemek.
   */
  it('kontrol: aynı parça innerHTML ile basılırsa betik ÇALIŞMAZ', () => {
    host.innerHTML = '<script>window.__vhInjectProbe.push("ran")</script>'

    expect(
      probe(),
      'innerHTML betiği çalıştırdı — bu testin dayandığı varsayım yanlış demektir.',
    ).toEqual([])
  })

  it('iç içe (sarmalayıcı içindeki) betikleri de yürütür', () => {
    injectCheckoutForm(host, '<div><span>form</span><script>window.__vhInjectProbe.push("nested")</script></div>')

    expect(probe()).toEqual(['nested'])
  })

  it('birden çok betiği SIRAYLA yürütür', () => {
    injectCheckoutForm(
      host,
      '<script>window.__vhInjectProbe.push("first")</script><script>window.__vhInjectProbe.push("second")</script>',
    )

    expect(
      probe(),
      'Yürütme sırası bozuldu; ikinci betik birincinin kurduğu global\'i bulamayabilir.',
    ).toEqual(['first', 'second'])
  })

  it('dış kaynaklı betikte sırayı korumak için async=false yapar', () => {
    injectCheckoutForm(host, '<script src="https://static.iyzipay.com/checkoutform/x.js"></script>')

    const script = host.querySelector('script')
    expect(script).not.toBeNull()
    expect(
      script?.async,
      'async açık kalmış: parça birden çok dış betik içerdiğinde yürütme sırası bozulur.',
    ).toBe(false)
  })

  it('betik olmayan içeriği olduğu gibi taşır', () => {
    injectCheckoutForm(host, '<div class="psp-form"><input name="card" /></div>')

    expect(host.querySelector('.psp-form')).not.toBeNull()
    expect(host.querySelector('input[name="card"]')).not.toBeNull()
  })

  it('ikinci enjeksiyonda kabı boşaltır — iki form üst üste binmez', () => {
    injectCheckoutForm(host, '<div class="first">1</div>')
    injectCheckoutForm(host, '<div class="second">2</div>')

    expect(host.querySelectorAll('.first')).toHaveLength(0)
    expect(host.querySelectorAll('.second')).toHaveLength(1)
  })

  it('cleanup kabı tamamen boşaltır', () => {
    const { cleanup } = injectCheckoutForm(host, '<div class="psp-form">x</div>')
    cleanup()

    expect(host.childNodes).toHaveLength(0)
  })

  it('betik sayısını doğru bildirir', () => {
    const { scriptCount } = injectCheckoutForm(
      host,
      '<div><script>1</script></div><script>2</script>',
    )

    expect(scriptCount).toBe(2)
  })
})

describe('hasRenderedSurface', () => {
  /**
   * EN ÖNEMLİ İDDİA. Enjeksiyondan hemen sonra kapta zaten bizim eklediğimiz betik
   * düğümleri vardır. "Çocuk var mı" diye sorulursa yüzey hiç çizilmemişken bile YEŞİL
   * döner — sahte-yeşil. Betik görünür bir yüzey DEĞİLDİR.
   */
  it('yalnız betik varsa yüzey YOK sayar', () => {
    injectCheckoutForm(host, '<script>window.__vhInjectProbe.push("only-script")</script>')

    expect(
      hasRenderedSurface(host),
      'Betik düğümü görünür yüzey sayıldı — form hiç çizilmemişken "hazır" denir (sahte-yeşil).',
    ).toBe(false)
  })

  it('boş kapta yüzey YOK sayar', () => {
    expect(hasRenderedSurface(host)).toBe(false)
  })

  it('iframe belirdiğinde yüzey VAR sayar', () => {
    host.innerHTML = '<iframe title="psp"></iframe>'
    expect(hasRenderedSurface(host)).toBe(true)
  })

  it('betik olmayan görünür eleman belirdiğinde yüzey VAR sayar', () => {
    injectCheckoutForm(host, '<div class="psp-form">kart formu</div>')
    expect(hasRenderedSurface(host)).toBe(true)
  })
})
