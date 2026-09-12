#!/usr/bin/env node
/**
 * ORTAK BİTİŞ BLOĞUNU 71 SKILL.md'ye GEÇİRİR (REC-305).
 *
 * NİÇİN BETİK: 71 dosya elle düzenlenmez — elle yapılan bir geçiş, bir sonraki skill'de
 * hatırlanmaya bağlı kalır (ölçülmüş kusur sınıfı: "kural yazmak kuralı uygulamak değildir").
 *
 * ⭐BLOK GÖVDEYE GİRER, FRONTMATTER'A GİRMEZ. Sebep ölçülmüş (REC-304): oturum açılışında
 * yalnız `name` + `description` okunuyor; gövde ancak skill ÇAĞRILDIĞINDA yüklenir. Böylece
 * her oturumun sabit bedeli (always-on) DEĞİŞMEZ — kapı `skill-yuku-butcesi.test.ts` bunu ölçer.
 *
 * FİKİR BİRLİĞİ TEK KAYNAKTAN: blok metni `.claude/skills/_ortak/bitis-durumu.md`. Bu betik onu
 * okuyup işaretler arasına yazar; ikinci koşuda ÇOĞALTMAZ, günceller (fikir tek yerde durur).
 *
 * KULLANIM
 *   node scripts/hijyen/skill-bitis-blogu.mjs           # yazar
 *   node scripts/hijyen/skill-bitis-blogu.mjs --kuru     # yalnız sayar, dosyaya dokunmaz
 */
import fs from 'node:fs'
import path from 'node:path'

const depoKoku = path.resolve(import.meta.dirname, '..', '..')
const KAYNAK = path.join(depoKoku, '.claude', 'skills', '_ortak', 'bitis-durumu.md')
const AGACLAR = ['.claude/skills', '.agent/skills']
export const BAS = '<!-- ORTAK-BITIS-BASLANGIC (kaynak: .claude/skills/_ortak/bitis-durumu.md) -->'
export const SON = '<!-- ORTAK-BITIS-SON -->'

const kuru = process.argv.includes('--kuru')

function blokMetni() {
  const govde = fs.readFileSync(KAYNAK, 'utf8').trimEnd()
  return `${BAS}\n${govde}\n${SON}\n`
}

/** Bir SKILL.md'ye bloğu yazar. Dönen: 'eklendi' | 'guncellendi' | 'ayni'. */
function dosyayaYaz(dosya, blok) {
  const ham = fs.readFileSync(dosya, 'utf8')
  const bas = ham.indexOf(BAS)
  const son = ham.indexOf(SON)

  if (bas !== -1 && son !== -1) {
    const mevcut = ham.slice(bas, son + SON.length + 1)
    if (mevcut.trim() === blok.trim()) return 'ayni'
    const yeni = ham.slice(0, bas) + blok + ham.slice(son + SON.length + 1)
    if (!kuru) fs.writeFileSync(dosya, yeni, 'utf8')
    return 'guncellendi'
  }

  // ⚠Yarım işaret: biri var öteki yok. Dosyayı TAHMİNLE onarmıyorum — adını basıp atlıyorum.
  if (bas !== -1 || son !== -1) return 'yarim-isaret'

  const ayrac = ham.endsWith('\n') ? '\n' : '\n\n'
  if (!kuru) fs.writeFileSync(dosya, ham + ayrac + blok, 'utf8')
  return 'eklendi'
}

const blok = blokMetni()
const satirSayisi = blok.split('\n').filter((s) => s.trim()).length
if (satirSayisi > 25) {
  console.log(`BEKLENMEYEN: blok ${satirSayisi} satir (tavan 25) -> DOKUNMADIM`)
  process.exit(2)
}

const sayac = { eklendi: 0, guncellendi: 0, ayni: 0, 'yarim-isaret': 0 }
const yarimlar = []

for (const agac of AGACLAR) {
  const kok = path.join(depoKoku, agac)
  if (!fs.existsSync(kok)) continue
  for (const g of fs.readdirSync(kok, { withFileTypes: true })) {
    if (!g.isDirectory() || g.name.startsWith('_')) continue
    const dosya = path.join(kok, g.name, 'SKILL.md')
    if (!fs.existsSync(dosya)) continue
    const sonuc = dosyayaYaz(dosya, blok)
    sayac[sonuc]++
    if (sonuc === 'yarim-isaret') yarimlar.push(`${agac}/${g.name}`)
  }
}

console.log(`[skill-bitis-blogu]${kuru ? ' KURU KOSU' : ''} blok ${satirSayisi} satir`)
console.log(`  eklendi ${sayac.eklendi} · guncellendi ${sayac.guncellendi} · ayni ${sayac.ayni}`)
if (yarimlar.length) {
  // Sessiz atlama yok: yarim isaretli dosya insan hukmu bekler.
  console.log(`  ⚠YARIM ISARET (dokunulmadi, elle bak): ${yarimlar.join(', ')}`)
  process.exit(2)
}
