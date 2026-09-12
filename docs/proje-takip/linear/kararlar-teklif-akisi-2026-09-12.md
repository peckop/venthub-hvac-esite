# Kararlar — Teklif Akışı ve Müşteri Paneli (Linear belgesinin TAM dışa aktarımı · 2026-09-12 ayna: K1–K6)

<!-- kaynak_id: 52206cde-64f5-4517-b80b-0bffa9cbcdb4 · kaynak_updatedAt: 2026-09-03T13:34:09.174Z · kopya: 2026-09-12T10:10Z -->
<!-- Tazelik yalnız yukarıdaki damgayla ölçülür (kaynak_updatedAt > kopya ise bayat). Tek kopya kuralı: bu dosyanın başka yerde ikinci kopyası tutulmaz. -->

> Karar SSOT'u Linear'dır; bu dosya NotebookLM defteri ve Design projeleri için kopyadır. Çelişkide Linear kazanır.

Tek kaynak; karar buraya yazılmadan verilmiş sayılmaz.

## K1 · Teklif kipi (2026-08-31 → 09-03, Recep)

Bugün site fiyatsız, sepetsiz; her ürün teklif listesine eklenir, teklif talebi gönderilir. Sepet, fiyat, ödeme, fatura, kargo ücreti ŞİRKET KURULUNCA açılır (Satış kipi). Faz 2 multi-tenant PARK (REC-88); öncelik kendi şirket + tek operatör.

## K2 · Misafir teklif (Recep kararı, REC-117)

Teklif için üyelik zorunlu değil; anon INSERT/RLS migration → Recep kapısı.

## K3 · Teklif kaydı kanıt taşır (2026-08-25 v11, 09-04 teyit)

Teklif kalemi seçimin kaynağını (sistem önerisi / kullanıcı seçimi + o anki öneri), girdileri, dayanak standardı ve zamanı taşır; itiraz halinde ispat. Satış kipinde aynı kayıt sipariş satırına gider.

## K4 · Proje kavramı (2026-09-04, Recep)

Proje = ad + mahal listesi + kalemler. Header "Teklif" panelinde Tekliflerim / Projelerim / Yeni proje / Favorilerim. Canlıda `/account/projects`, `/account/quotes` altyapısı var; 15A Faz 4'te tasarım diline geçer.

## K5 · Satış kipi kalemleri "Beklemede"

iyzico self-iade (REC-57), fatura üretimi (REC-48), kargo ücreti (REC-47), admin tehlikeli butonlar, satınalma v2: şirket kuruluşuna kadar başlatılmaz; öncelik sırası o gün Recep'le.

## K6 · Ticari kararlar Recep'te

Fiyat, ödeme, iade, bayi segmenti, marka: her zaman Recep sorusu; OPS hüküm vermez.

---

*2026-09-04 ilk sürüm (OPS).*
