# İş J10 — AdminInventorySettings refactor (§5 iki-kolon düzen · X8 token)

> `docs/standards/collaboration-protocol.md` kurallarına tabidir. Şerit sahibi: **Controller #1 (admin)**.
> Worker üretir → push → **DURUR**. Cetvel: `admin-standard.md §8` (Settings arketipi, §5 düzen).
> Gold (settings düzen): `AdminInventorySettingsPage` zaten settings; referans yerleşim için diğer settings sayfası.

## Worktree (K0)
```bash
git fetch origin
git worktree add ../vh-invsettings -b feat/admin-invsettings-refactor origin/master
cd ../vh-invsettings && pnpm install
```

## Açık (audit — AdminInventorySettingsPage %72, settings arketip)
1. **§5 annotasyonlu iki-kolon düzen değil** → settings arketipi: solda açıklama/annotation, sağda alanlar (kart/bölüm bileşimi).
2. **X8 arbitrary token** → `tokens.js` / standart sınıf.

## Yapılacak (yalnız InventorySettings dosyası/dosyaları)
- Düzen: bölümleri (kart) iki-kolon annotated-section yerleşimine getir (başlık+açıklama | alanlar). Sticky Savebar varsa koru.
- Token: arbitrary Tailwind/HEX → tasarım token'ı.
- Mevcut kaydetme mantığı (`mutateWithAudit`/`canWrite`) korunur — **sahte-success YASAK (INV-6)**.

## Sınırlar (ihlal = ret)
- `any` yok · design-token (arbitrary YASAK) · i18n fallback'siz (parity).
- Form davranışı/validasyonu bozulmaz; yalnız düzen + token.
- Yalnız InventorySettings dosyalarına dokun.

## Hızlı kapı (worker — build YAPMA): type-check 0 · lint 0 · test geçer
## Bitince: commit `feat(admin): InventorySettings iki-kolon düzen + token (§8)` · yalnız .tsx/.ts commit'le (.md churn EKLEME) · push · **DUR**
