'use strict'
/**
 * GÖVDE İÇİNDE KABUK İKAMESİ (2026-09-27, ARAÇ olayı) — bash-write-guard'ın üçüncü sınıfı.
 *
 * ── NİÇİN VAR ──
 *
 * PR gövdesi `node -e "..."` çift tırnaklı bash dizesinin içinde kuruldu; metindeki kaçışsız
 * ters tırnaklar bash için KOMUT İKAMESİ'dir. `npm ci --ignore-scripts` ve
 * `node tools/wrongstack-mcp/kurulum.cjs` — izin sisteminin aynı gün REDDETTİĞİ kurulum kipi —
 * istemeden koştu. Betik ilk adımda düştüğü için zarar olmadı (MCP süreçleri 24 → 24); ders
 * yazıldı ama OPS'un hükmü: "dersi yazmak yetmez, mekanik kapı olsun".
 *
 * ── KURAL ──
 *
 * Gövde/metin taşıyan komutlarda (`gh pr|issue create|edit|comment`, `gh api`, `node -e/-p`,
 * `python -c`) ÇİFT TIRNAK İÇİNDE kaçışsız ters tırnak ya da `$(` varsa reddedilir. Tek tırnak
 * güvenlidir (bash genişletmez); `\`` kaçışı güvenlidir. Doğru yol: gövdeyi Write ile dosyaya
 * yaz, `--body-file` / `-F body=@dosya` ile gönder; kod için betiği dosyaya yaz.
 *
 * Kapsam DIŞI (adıyla): tırnaksız heredoc (`<<EOF`) da ikame yapar; bu sürüm onu görmez.
 */

const TETIK = /\bgh\s+(pr|issue)\s+(create|edit|comment)\b|\bgh\s+api\b|\bnode\s+(-e|-p|--eval|--print)\b|\bpython3?\s+-c\b/

/** @returns {Array<{ ad: string, konum: number, parca: string }>} */
function govdeIkameBulgulari(komut) {
  const k = String(komut || '')
  if (!TETIK.test(k)) return []
  const bulgular = []
  let durum = 'duz' // duz | tek | cift
  for (let i = 0; i < k.length; i++) {
    const h = k[i]
    if (durum === 'tek') {
      if (h === "'") durum = 'duz'
      continue
    }
    if (h === '\\') {
      i++ // sonraki karakter kaçışlı (düz ve çift tırnakta)
      continue
    }
    if (durum === 'duz') {
      if (h === "'") durum = 'tek'
      else if (h === '"') durum = 'cift'
      continue
    }
    // durum === 'cift'
    if (h === '"') durum = 'duz'
    else if (h === '`') bulgular.push({ ad: 'ters tirnak', konum: i, parca: k.slice(i, i + 40) })
    else if (h === '$' && k[i + 1] === '(') bulgular.push({ ad: 'komut ikamesi $(', konum: i, parca: k.slice(i, i + 40) })
  }
  return bulgular
}

module.exports = { govdeIkameBulgulari, TETIK }
