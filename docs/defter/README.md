# Departman defteri — "bu alanda ne yaptık, elimizde ne var, sırada ne var?" sorusunun cevabı

Sahibi: HARİTA (biçim ve manifest); her defterin içeriğinin sahibi o departmandır · Son doğrulama: 2026-11-09 · Cetvel: `docs/standards/departman-defter-standard.md` · Kaynak: OPS-258

Kanban işin durumunu tutar; Kanban'da yaşamayan şeyi, yani bir departmanın **alanının bugünkü hâlini**, defter tutar.
Ölçüm defterleriyle (`docs/olcum/README.md`, "bu konu ölçüldü mü") karıştırılmaz: oradaki konu başına tek ölçümdür,
buradaki departman başına alan haritasıdır. Kurallar cetvelde; bu sayfa dosya biçimini ve manifest şemasını verir.

## Kural (iki cümle)

1. **Kart Done olurken defter güncellenir:** işin bir satırı (1)'e, envanteri değiştiyse (2)'ye, açtığı iş ya da kapattığı
   madde (3)'e, çıkan karar (4)'e gider; kartın kapanış notu "defter güncellendi" der. İzlenen yolu değiştiren PR defteri de
   değiştirir; değiştirmiyorsa gövdede `Defter-gerekmez: <sebep>` yazar (PR kapısı, ALTYAPI).
2. **Yeni iş ya da emir önce deftere bakar:** emrin `ÖNCEKİ ÇALIŞMA:` satırı defteri anar (ne kapsıyor, ne kalıyor); defterde
   olan şey yeniden kurulmaz; defter bayatsa önce o düzeltilir.

## Dosya biçimi (dört sabit bölüm, bu sırayla)

| Bölüm | İçerik |
|---|---|
| 1. Ne yaptık | Geriye dönük: iş, neden, sonuç, kart no. Yeni satır en üste. |
| 2. Envanter | Alanın tablosu. Sütunları departman seçer. Her satırda son doğrulama tarihi ve dayandığı yol ya da komut. |
| 3. Sırada ve yapılabilecekler | Her madde: gerekçe + öncelik (yüksek/orta/düşük) + varsa kart no. |
| 4. Kararlar | Tarih + karar no + tek cümle. Sahip Recep ya da OPS ise yazılır; söz tırnaklanmaz (depo açık). |

Başlığın altında `Sahibi:` ve `Son doğrulama:` satırı. Arama verisi, maliyet ve tedarik verisi, sır deftere girmez; ölçümün
durduğu yere işaret edilir (cetvel D5).

## Manifest şeması: `docs/defter/manifest.json`

Tek liste; açılış satırı, önceki-çalışma taraması, PR kapısı, rol kartı satırı ve Recep sayfası bu dosyayı okur.

```json
{
  "sema": 1,
  "defterler": [
    {
      "ad": "urun-adres",
      "dosya": "docs/defter/urun-adres.md",
      "sahip": "URUN",
      "ozet": "Canlı adres şeması ve yönlendirmeler",
      "izlenen": ["next.config.mjs", "src/config/markaYonlendirmeleri.mjs"],
      "tazelikGun": 14,
      "tetik": ["kart-kapanisi", "sure"],
      "olcum": null,
      "disKaynak": null,
      "durum": "planli"
    }
  ]
}
```

| Alan | Anlam |
|---|---|
| `ad` | Kısa kimlik: küçük harf, rakam, tire; manifestte tekil. |
| `dosya` | Deftere giden depo yolu (`docs/defter/<ad>.md` ya da tanıtılan mevcut kayıt). `planli` dışındaki durumlarda dosya var olmalı. |
| `sahip` | Rol kodu (`docs/roller/<ROL>.md` var olan; örnek `URUN`, `GEO-SEO`). Tek sahip. |
| `ozet` | Tek cümle: defterin alanı. Rol kartı satırı ve Recep sayfası kullanır. |
| `izlenen` | PR kapısının baktığı yollar. Dar ve somut: depoda var olan dosya ya da dar glob; `docs/**` gibi geniş yol reddedilir. |
| `tazelikGun` | `Son doğrulama` eşiği (varsayılan 14). |
| `tetik` | `kart-kapanisi`, `sure`, `dis-kaynak` değerlerinden en az ikisi (cetvel D2.3). |
| `olcum` | Tutarlılık kontrol komutu (cetvel D2.4) ya da `null` (kontrolsüz). |
| `disKaynak` | Depo dışı kaynak adı (`gsc`, `unopim`, `design`) ya da `null`. Ham veri depoya girmez. |
| `durum` | `planli` (dosya henüz yok) · `pilot` · `aktif` (`olcum` dolu) · `kontrolsuz` · `emekli`. |

Kontroller (HRT-126, `manifest` yapı testi): dosya var (`planli` hariç), sahip geçerli rol, `izlenen` yolların her biri depoda
var, aynı dosya iki kayıtta yok, `aktif` kaydın `olcum`'u dolu, şema alanları tam.

## Defterler

| Defter | Sahip | Durum |
|---|---|---|
| urun-adres | URUN | Planlı: pilot, canlı adres şemasıyla başlar (URN-157 geçiş tablosu "Sırada"da) |
| geo-seo-dizin | GEO-SEO | Pilot (SEO-101): depo-güvenli özet, `olcum` = `node scripts/seo/dizin-defter-kontrol.mjs` (arşivdeki son anlık görüntüyle sayı karşılaştırır; ham veri depoya girmez) |

Yeni defter eklemek: önce manifest kaydı (`durum: planli`), sonra dosya, sonra `pilot`/`aktif`.
