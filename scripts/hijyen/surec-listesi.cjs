'use strict'
/**
 * ÇALIŞAN SÜREÇLERİN KOMUT SATIRLARI (ARC-71) — `sage-yedek.cjs --geri` "dosyayı açık tutan MCP süreci var mı" sorusu.
 *
 * ⭐NİÇİN AYRI DOSYA: sage-yedek.cjs'in kapısı (INV-SAGE-YEDEK-1) o dosyada dış süreç çağrısı olmamasını ölçer
 * ("kaynakta dış servise çıkış izi yok"). Süreç listesi bir dış çağrıdır; burada yaşar, yedek betiği yalnız sonucu okur.
 *
 * ⛔FAIL-CLOSED: liste alınamazsa `null` döner; çağıran "kimse yok" SAYMAZ. Bakamamak, boş olduğunu göstermez
 * (pencereler açıkken yedekten geri yükleme WAL'ı bozar). Salt-okuma: hiçbir süreci sonlandırmaz.
 *
 * Windows: PowerShell + CIM (`wmic` Windows 11'de kaldırıldı). Diğerleri: `ps -eo args=`.
 */
const { execFileSync } = require('child_process')

/** @returns {string[]|null} komut satırları; alınamadıysa null */
function calisanSurecler() {
  const secenek = { encoding: 'utf8', timeout: 20_000, windowsHide: true, maxBuffer: 32 * 1024 * 1024 }
  try {
    const cikti =
      process.platform === 'win32'
        ? execFileSync(
            'powershell.exe',
            [
              '-NoProfile',
              '-NonInteractive',
              '-Command',
              'Get-CimInstance Win32_Process | Where-Object { $_.CommandLine } | ForEach-Object { $_.CommandLine }',
            ],
            secenek,
          )
        : execFileSync('ps', ['-eo', 'args='], secenek)
    const satirlar = String(cikti).split(/\r?\n/).filter(Boolean)
    return satirlar.length > 0 ? satirlar : null
  } catch {
    return null
  }
}

module.exports = { calisanSurecler }
