# CLAUDE.md Kural Gerekçeleri

> **Ne yönetir:** `CLAUDE.md`'deki mutlak kuralların ve notların **niçin** var olduğu — her kuralı doğuran
> ölçülmüş olay. Kuralın kendisi `CLAUDE.md`'dedir; burası yalnız gerekçedir ve kuralı değiştirmez.
> **Niçin var:** `CLAUDE.md` her oturumda yüklenir; hikâyeler orada dururken dosya 15 KB'a çıktı ve harita
> olmaktan çıkıp hata defterine döndü (`belge-yonetimi-standard.md` B1: çekirdekte hikâye durmaz, en fazla bir
> satırlık adres). Gerekçeler kaybolmasın diye buraya **aynen** taşındı (REC-400 D3, 2026-09-27).
> **Sahibi:** HARİTA (REC-400). Kural değişirse gerekçesi burada güncellenir.
> **Son doğrulama:** 2026-09-27 (metinler CLAUDE.md'den birebir taşındı; olayların kendisi yeniden ölçülmedi).
> **Kayıt:** REC-400.

Her başlık `CLAUDE.md`'deki kural numarasıyla eşleşir.

## Kural 1 — No-Plan-No-Code ve iş emrindeki KAYNAK/CETVEL bloğu

- **İş emri de aynı kurala tabidir (2026-08-20).** Niçin: 2026-08-20'de ERP yetenek çerçeveleri zaten
  yazılıyken "yazılmadı" sanılıp sıfırdan emirler açıldı — belge vardı, emre bağlanmamıştı; el kitabı
  "hatırlanan" değil "emre yazılan" şey olmalı.
- **Planın cetvelini söylemesi.** Niçin: 2026-08-15'te 1044 fiyat satırı prod'a yazıldı ve vitrin değişmedi;
  sebebi render/önbellek cetvelinin hiç yazılmamış olmasıydı — hata tam o boşlukta yaşadı ve hiçbir kapı görmedi.

## Kural 5 — Suspense sınırı yalnız uç bileşeni sarar

2026-09-05 ölçümü, REC-150 Adım 0: hrv ve hava-perdesi sayfalarında sınır sayfa kökündeydi → sunucu gövdeyi
0 kelime verdi, dört hesaplayıcı istemcide açıldı; kanal sayfasında sınır uçtaydı → 400+ kelime.

## Migration dosya adı — damga 14 hane

8 haneli `YYYYMMDD_` biçimi INV-MIGRATION-2 kapısında KIRMIZI verir, 2026-08-31'de sahada ölçüldü.

## Teknoloji — PPR kullanılmıyor

`next.config.mjs`'te `experimental.ppr` yok; 2026-08-15 ölçüldü.

## Not — Lokal `deno check`

`--node-modules-dir=auto` pnpm node_modules yerleşimini BOZAR (build "Module not found" ile patlar; onarım
`pnpm install`). CI etkilenmez.

## Not — Repo PUBLIC

Repo 2026-08-15'ten beri PUBLIC (öncesi private'tı). Karar ölçüme dayandı:
`docs/audits/secret-exposure-audit-2026-08-15.md` — 18 sır imzası × tüm geçmiş tarandı, bulunan 4 kalemin 3'ü
**API çağrılarak** ölü doğrulandı (401/403). Sebep: private repoda Actions dakikası ücretli ve hesap iş başlatmayı
reddetti; public'te ücretsiz/sınırsız.

- Self-hosted runner yasağının niçini: public repoda fork PR'ı yabancı kodu makinede çalıştırır.
- `permissions:` bloğunda `contents: read` zorunluluğunun niçini: varsayılanlar düşer, checkout
  "Repository not found" verir.

## Not — Worktree `node_modules` (karar 88, 2026-09-23)

`pnpm install --frozen-lockfile --offline`: pnpm sabit bağlantı kullanır → disk maliyeti ~0, ölçüldü.
Junction/symlink yasağının niçini: 09-23'te `git worktree remove` junction'dan geçip ana deponun
node_modules'unu sildi.

## Not — Git kancaları (2026-08-15)

`pre-commit` artık bloklamaz. Eskisi rastgele reddediyordu (aynı dosya 80/100 ↔ 100/100) ve 3 dalından 2'si
sessizce ölüydü. Yedekler: `*.oncesi-2026-08-15`.

## Bilgi kaynağı — katalog PDF'i açılmaz

PDF'i doğrudan tarayan her iş, aynı kataloğu üçüncü kez okur — patinajın sebebi buydu.

## NotebookLM — 2026-08-17 ürün değişikliği

Paket `notebooklm-py`, CLI `notebooklm`, MCP sunucusu `notebooklm-py`; çözüm `notebooklm login`. 08-17'ye kadar
sorgu aracı `notebook_query` idi, sonra `chat_ask`. `auth check` tek başına kanıt DEĞİL — `notebooklm list` ile ölç.

---

## Değişiklik kaydı

- **2026-09-27 (REC-400 D3):** CLAUDE.md harita hâline getirilirken gerekçe paragrafları buraya birebir taşındı.
