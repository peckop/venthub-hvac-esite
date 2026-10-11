# DÜZENLİ GÖREVLER: ALTYAPI

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri: `scripts/belge/rol-gorevleri.json`); elle düzenleme. Yöneten cetvel: `docs/standards/duzenli-gorevler-standard.md`. Rol kartı: `docs/roller/ALTYAPI.md`.

## Amaç
Siteye giren her değişikliğin otomatik kontrollerden geçmesini ve kullandığımız paketlerdeki bilinen güvenlik açıklarının zamanında kapanmasını sağlar; bozulursa hatalı kod canlıya girer ya da açık fark edilmeden kalır.

## Görevler
| Görev | Sıklık | Tetik | Bağlı mı | Çıktı | Eşik |
|---|---|---|---|---|---|
| PR kapıları: her pull request'te kayıt kapısı, lint, tip denetimi, edge korumaları, test ve derleme (ayrıca admin-smoke ve catalog-integrity) | olay | Actions: .github/workflows/ci.yml her pull request'te koşar (pull_request); admin-smoke ve catalog-integrity kapıları da iş akışlarında tanımlı | evet | PR kontrol durumu; kırmızı PR sahibine döner | Tüm kontroller yeşil olmadan birleşme yok (merge-ritueli.cjs bunu doğrular) |
| Bağımlılık denetimi: kilitli sürümlerde bilinen güvenlik kaydı var mı (`scripts/hijyen/bagimlilik-denetimi.cjs`) | haftalık | Actions: .github/workflows/bagimlilik-denetimi.yml haftalık schedule (pazartesi) ve kilit dosyası değişince pull_request | evet | Kırmızıda ALTYAPI kartı; kayıt docs/audits/bagimlilik-<tarih>.md ve kabul listesi | Kabul listesinde olmayan yüksek/kritik kayıt 0 ve listede kalıp kapanmış kayıt 0 (bagimlilik-kararlari.md §7, bagimlilik-guvenlik-yukseltme-standard.md §11) |
| Bağımlılık tarama tazeliği: son taramanın yaşı her mesajda görünür, eşik aşılınca uyarı satırı çıkar | haftalık | istem satırı tazelik: .claude/hooks/defter-tazelik-satiri.cjs son tarama yaşını okur ve eşik (BAGIMLILIK_ESIK_GUN) aşılınca ⚠BAGIMLILIK satırını basar | evet | ⚠BAGIMLILIK uyarı satırı; taramayı ALTYAPI koşar | 14 gün (karar 13, kancadaki BAGIMLILIK_ESIK_GUN) |
| Font ön yükleme ölçümü: derlemede beklenen fontun ön yüklendiği doğrulanır (`scripts/ci/font-preload-olc.cjs`) | olay | Actions: .github/workflows/e2e-smoke.yml (pull_request) font ölçümünü çağırır | evet | Kırmızıda PR durur | Kapalı kipte yalnız Inter; TASARIM Faz 2b'de Archivo beklenir, o PR'da eşik değişir |
| Dependabot PR'ları: haftalık açılan PR'ları gözden geçirip birleştir ya da gerekçeyle kapat | haftalık | Actions: Dependabot PR'ları haftalık açılıyor; bunları ele alan kendiliğinden bir tetik kurulu değil (kuracak: ALTYAPI) | hayır (kuracak: ALTYAPI) | Birleşme ya da gerekçeli kapatma (bagimlilik-kararlari.md §7 kaydı) | TASLAK: açık Dependabot PR'ı 7 günden eski kalmaz (eşik cetvelde yok, teyidi ALTYAPI'da) |
| Canlı adres matrisi: yayın ya da anahtar açılışı sonrası canlıda her adresin son durumu ve sıçrama sayısı (`scripts/adres/matris.cjs`) | olay | kart kapısı: Yayın ya da anahtar açılışı kartında matris koşusunu kendiliğinden isteyen kapı yok (kuracak: HARİTA, scripts/belge/kart-plan-kapisi.cjs) | hayır (kuracak: HARITA) | docs/audits/adres-matrisi-<tarih>.json ve kusur için Kanban kartı | TASLAK: hata satırı 0 ve dilsiz adreslerde --dilsiz-hop-en-cok değerinin altı (rota-dili-standard.md; ölçüt ALT-14 canlı ölçümünden) |

6 görev, tetiğe bağlı 4. Tetiğin kurulmasını bekleyen: ALTYAPI 1 · HARITA 1.
