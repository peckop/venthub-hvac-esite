# Ölçüm defteri: "Satış olsa her şey çalışır mı" — uçtan uca

Sahibi: OPS · Son doğrulama: 2026-09-29 · Kaynak: Recep 09-29 "önceki ve şimdiki ölçümleri bir md'de birleştir"
Son ölçüm: 2026-09-29 (OPS, Sonnet, salt okuma + canlı SELECT; sipariş/ödeme denemesi YOK). Satış BİLEREK kapalı (şirket yok); İyzico sandbox. Recep 09-29: "şirket/İyzico canlı anahtarını sormuyoruz, genel kod tabanı hazır mı?" → aşağıda KOD tarafı ayrıldı.

| # | Adım | Durum | Kanıt |
|---|---|---|---|
| 1 | Satış kipi anahtarı | Kod var, DB tarafı yok | satis_kipi_oku RPC prod'da yok (REC-168/REC-298 migration inmedi); 31/31 kategori hide_price; kod fail-closed |
| 2 | Sepet→İyzico | Kod hazır (sandbox) | iyzico-payment 930 satır; REC-358 düzelmiş (kayıt bayat) |
| 3 | Ödeme→sipariş | Kısmen | KRİTİK: authenticated rolü venthub_orders payment_status/status/total_amount UPDATE edebiliyor → #1454 (REC-355 VULN-002, gölge bekliyor); durum monotonluğu DB'de yok = 2. paket |
| 4 | Stok düşümü | Kod hazır, hiç sınanmadı | RPC idempotent; inventory_movements 0 |
| 5 | Müşteri e-postası | Belirsiz | DKIM var, send. alt alanı yanlış CNAME; Resend doğrulaması ölçülmedi; REC-368 |
| 6 | Fatura | Otomatik yok | order_invoices manuel defter (0 satır); entegratör bağlantısı yazılacak — bkz. e-fatura-muhasebe-erp.md |
| 7 | Kargo | Manuel (yeterli) | admin-update-shipping + bildirim; legal.ts kargo alanı boş |
| 8 | İade | Kısmen | iyzico-refund var; REC-159 kalem şeması, REC-57 self-iade Backlog |
| 9 | Yasal | Şirket bekliyor + kapı yok | canlıda ham [SATICI_UNVAN]; checkout'ta yer tutucu kapısı yok |
| 10 | Yönetici | Ölçülmedi (canlı) | sayfalar var |

## Kod tabanı hazırlığı (şirketten bağımsız yapılabilecekler)
1. #1454 + durum monotonluğu tetiği (güvenlik). 2. Satış anahtarı migration (REC-168/298). 3. Checkout yasal yer tutucu kapısı. 4. Fatura bağlantısı (entegratör API katmanı, sandbox). 5. İade kalem şeması + self-iade (REC-159/57). 6. E-posta alan doğrulaması (ayar). 7. İyzico SANDBOX ile önizlemede uçtan uca deneme siparişi (ödeme→callback→stok→e-posta→yönetici→iade) — hiç yapılmadı.
## Yeniden ölçme tetikleyicisi
Her madde kapanınca ilgili satır; satış açılışından hemen önce tam denetim.

**Otomatik açılış önkoşulları (REC-168 C, 2026-09-29):** yukarıdaki maddelerden makinece ölçülebilenler `node scripts/kip/satis-kipine-gec.mjs --onkosul` ile ölçülür (salt okuma; çıkış 0 = hepsi geçti, 2 = geçmeyen var); `--yon ac` kuru koşumda da 9 kalemlik tabloyu basar (K1 yasal sayfalar, K2 ödeme ortamı, K3 edge satış kapısı, K4 site_settings politikası, K5 sipariş bekçileri, K6 e-posta gönderici, K7 fatura katmanı, K8 tutarlılık, K9 e-posta gönderim kanıtı) ve `--yon ac --uygula` bunlar geçmeden canlıya yazmaz; ölçülemeyen kalem RET sayılır. Kalemler ve sahipleri: `docs/standards/satis-kipi-gecis-standard.md` §8.1 (INV-SATIS-KIPI-7). Satır 5 (müşteri e-postası) için K9: son 30 günde gerçekten gönderilmiş e-posta kaydı (`*_email_events`, sahibi ALTYAPI/REC-368) ve K6 (Resend alanı doğrulanmış) aranır. "Tam denetim" bu komutun çıktısıyla başlar.
