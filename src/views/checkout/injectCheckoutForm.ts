/**
 * PSP'nin döndürdüğü HTML+betik parçasını gerçekten ÇALIŞACAK biçimde DOM'a yerleştirir.
 *
 * NİÇİN AYRI BİR MODÜL (T080-A · 2026-08-18)
 *
 * İyzico `checkoutFormContent` alanında bir HTML parçası döner ve o parçanın İÇİNDEKİ
 * `<script>` bloğu formu kuran şeydir. Bu parçayı React'in `dangerouslySetInnerHTML`'i ile
 * basmak **çalışmaz**: HTML spesifikasyonu gereği `innerHTML` ile eklenen `<script>`
 * düğümleri **asla yürütülmez** (HTML Standard, "script" element — "already started" bayrağı).
 * Ekranda hiçbir hata çıkmaz, sadece boş bir kutu kalır — T080'in tam olarak yaşadığı şey.
 *
 * Bu yüzden betik düğümleri **yeniden yaratılır**: yeni bir `<script>` elemanı oluşturulup
 * öznitelikleri ve gövdesi kopyalanır; yeni eleman DOM'a girdiğinde tarayıcı onu yürütür.
 *
 * SIRA KORUNUR: dış kaynaklı betiklerde `async` açıkça `false`'a çekilir. Varsayılan
 * `document.createElement('script')` davranışı `async = true`'dur ve parça birden çok betik
 * içeriyorsa (İyzico'da içerir) yürütme sırası bozulur — sonraki betik, kurduğu global'i
 * bekleyen öncekinden önce koşabilir.
 */

/** Enjeksiyon sonucu — çağıran temizliği ve ölçümü buradan yapar. */
export interface InjectionResult {
    /** Yürütülmek üzere DOM'a eklenen betik sayısı (0 ise parça betiksizdir). */
    scriptCount: number
    /** Kabı boşaltır. Bileşen sökülürken ya da yeniden enjekte etmeden önce çağrılır. */
    cleanup: () => void
}

/** `<script>` dışındaki düğümler olduğu gibi taşınır. */
function isScript(node: Node): node is HTMLScriptElement {
    return node.nodeName.toLowerCase() === 'script'
}

/**
 * `original` betiğinin **yürütülebilir** bir kopyasını üretir.
 * `innerHTML` ile gelen betik "already started" sayıldığı için kopyalamak şarttır.
 */
function reviveScript(doc: Document, original: HTMLScriptElement): HTMLScriptElement {
    const revived = doc.createElement('script')

    for (const attr of Array.from(original.attributes)) {
        revived.setAttribute(attr.name, attr.value)
    }

    // Dış kaynaklı betiklerde sırayı koru (bkz. modül başlığı).
    if (revived.src) revived.async = false
    else revived.textContent = original.textContent

    return revived
}

/**
 * `html` parçasını `container` içine yerleştirir ve içindeki betikleri yürütür.
 *
 * Kap **önce boşaltılır**: aynı kaba ikinci kez enjeksiyon (kullanıcı ödemeyi tekrar
 * başlatırsa) iki form üst üste binmemelidir.
 *
 * @param container Hedef eleman
 * @param html PSP'den gelen HTML parçası
 */
export function injectCheckoutForm(container: HTMLElement, html: string): InjectionResult {
    const doc = container.ownerDocument
    const cleanup = () => { container.replaceChildren() }

    cleanup()

    // `template` ayrıştırması içerikteki betikleri yürütmez — yürütme, biz kopyayı
    // DOM'a eklediğimizde ve yalnızca o zaman olur. Kontrol bizde kalır.
    const template = doc.createElement('template')
    template.innerHTML = html

    let scriptCount = 0
    for (const node of Array.from(template.content.childNodes)) {
        if (isScript(node)) {
            container.appendChild(reviveScript(doc, node))
            scriptCount += 1
            continue
        }

        container.appendChild(node)

        // Betikler iç içe de gelebilir (ör. bir sarmalayıcı div içinde). Taşınan alt ağaçtaki
        // betikler de "already started" olduğundan onların da canlandırılması gerekir.
        //
        // `nodeType` ile bakılır, `instanceof Element` ile DEĞİL: `instanceof` REALM'e
        // bağlıdır ve düğüm başka bir belgeden geldiğinde (test için ayrı bir JSDOM örneği,
        // iframe, popup) sessizce `false` döner — iç içe betikler hiç canlandırılmaz ve
        // form yine boş kalır. Tarayıcıda tek realm olduğu için bu kusur görünmez;
        // testte görünür oldu ve gerçek bir kırılganlıktı.
        if (node.nodeType === 1 /* ELEMENT_NODE */) {
            const element = node as Element
            for (const nested of Array.from(element.querySelectorAll('script'))) {
                nested.replaceWith(reviveScript(doc, nested))
                scriptCount += 1
            }
        }
    }

    return { scriptCount, cleanup }
}

/**
 * Kabın GERÇEKTEN bir form yüzeyi taşıyıp taşımadığı.
 *
 * NİÇİN "çocuk var mı" YETMEZ: enjeksiyondan hemen sonra kapta zaten bizim eklediğimiz
 * betik düğümleri vardır. Betik görünür bir şey değildir; onu "form geldi" saymak
 * **sahte-yeşil** üretir — K2'nin (başarı yolu boş ekran üretemez) tam ihlali.
 * Bu yüzden yalnız **görünür** yüzeyler sayılır: iframe ya da betik olmayan bir eleman.
 */
export function hasRenderedSurface(container: HTMLElement): boolean {
    if (container.querySelector('iframe')) return true
    return Array.from(container.children).some((el) => el.tagName.toLowerCase() !== 'script')
}
