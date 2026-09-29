# Ölçüm defteri: CRM / ERP / iş kuralları — alan alan "yaz, bağla ya da örnek al"

Sahibi: OPS · Son doğrulama: 2026-09-29 · Kaynak: Recep 09-29 "önceki ve şimdiki ölçümleri bir md'de birleştir"
Son ölçüm: 2026-09-29. Önceki ölçümler tarihli, hepsi burada.

| Tarih | Ölçüm | Sonuç | Kaynak |
|---|---|---|---|
| 08-20 | ERP ekran deseni: Odoo 19 + Frappe/ERPNext KODU okundu | Tek kabuk + 5 ekran deseni, kendi kodumuzla | docs/standards/erp-workspace-design-standard.md |
| 08-20 | Kendi satınalma modülü karnesi | Model/RLS/servis/bekçi VAR, **SIFIR KULLANIM**, DB geçiş tetiği yok | docs/audits/t128-erp-satinalma-karne-2026-08-20.md |
| 08-20 | Kendi stok modülü karnesi | Depo modeli yok, set_stock çağıranı yok, yetki user_profiles.role | docs/audits/t129-erp-stok-gerceklesme-karnesi-2026-08-20.md |
| 08-20 | CRM: Twenty, EspoCRM, Odoo crm, Frappe CRM kodu | Hesap=organizations; Kişi tablosu yok; tek Etkileşim defteri | docs/standards/crm-standard.md |
| 08-20 | Teklif kuralları ERPNext/Odoo/Dolibarr'dan | Revizyon/onay quote-standard'a girdi | docs/standards/quote-standard.md |
| ~09 | wacrm (WhatsApp CRM) | Örnek kaynağı, yanına kurulmaz; "örnek rafı" (wacrm+Medusa+Atomic CRM) KARARSIZ | konuşma kaydı |
| 09-25 | Vizyon (ERP+teknik servis+IoT+CFD), ilke açık kaynak | NLM 4edeb29e | hafıza venthub-vizyonu-acik-kaynakla |
| 09-29 | ERP/ön muhasebe/e-fatura | bkz. e-fatura-muhasebe-erp.md | — |

## Alan haritası (karar 181 önerisi, Recep cevabı BEKLENİYOR; şirket kurulmadı bilgisiyle)
| Alan | Öneri |
|---|---|
| Seçim zinciri, hesaplayıcı, teknik içerik, vitrin, müşteri teklif deneyimi | BİZ yazarız (farklılaştıran) |
| Sipariş, ödeme, vitrin fiyatı, kupon, iade | BİZ + hazır kütüphane (179) |
| Ürün bilgisi | UnoPIM yerel tezgâh |
| Muhasebe, e-Arşiv iletimi | Dışarıdan (kontörlü entegratör) |
| Stok, satınalma, CRM, teknik servis | Şimdilik Supabase'deki basit yapı, GENİŞLETİLMEZ; tetikleyicide ERPNext |
Ölçülmedi: fiyat/stok/satınalma için olgun sistem↔bizim kural kıyası; CRM rafı kararı; teknik servis seçimi.
Yeniden ölçme tetikleyicisi: şirket kuruluşu, ilk gerçek satınalma, 2. kullanıcı, ilk gerçek CRM kaydı ihtiyacı.
