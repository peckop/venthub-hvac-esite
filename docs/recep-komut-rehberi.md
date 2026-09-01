# Recep'in Komut Rehberi

> Bu sayfa Recep içindir. Terminaldeki `/` ile başlayan komutların neredeyse tamamı
> Claude'un kendi alet çantasıdır — Claude bunları işin türüne göre kendisi çağırır,
> ezberlenmesi gerekmez. Aşağıda yalnız **senin elinle çalışması gerekenler** ve
> merak edersen diye **Claude'un sık kullandıkları** var.
>
> **Altın kural:** Bir komut gerektiğinde Claude tam yazımını o anda söyler; sen
> kopyalayıp Enter'a basarsın. Bu sayfa ezber için değil, "bu neydi?" anları için.

## Senin komutların (elle yazılanlar)

| Komut | Ne yapar | Ne zaman |
| --- | --- | --- |
| `/compact` | Konuşma hafızası dolunca sıkıştırır; kaldığımız yerden devam ederiz. | Claude "compact hazırlığı tamam, serbestsin" dediğinde. |
| `/design-consent` | Claude'a claude.ai/design projelerini okuma izni verir (tek seferlik). | Design-sync günü geldiğinde — 15A'nın kod tarafı bitince Claude hatırlatacak. |
| `/design-revoke` | Yukarıdaki izni geri alır. | İstersen, herhangi bir zaman. |
| `/resume` | Kapanmış bir oturumu kaldığı yerden açar. | Terminali yeniden açtığında eski konuşmaya dönmek için. |
| `/mcp` | Dış bağlantıların (NotebookLM, Supabase, Linear...) durum ekranı. | "Bağlantı koptu" şüphesinde bakmak için. |
| `/config` | Görünüm/model gibi arayüz ayarları. | Nadiren; ayar değiştirmek istersen. |

## Claude'un sık kullandıkları (bilgi için — sana iş düşmez)

| Komut | Tek cümleyle |
| --- | --- |
| `/loop` | Filonun düzenli kontrol turlarını kurar (pano, PR'lar, canlılık). |
| `/design` | Tasarım tuvali üretir (dünkü "Aydınlık Vitrin" bununla yapıldı). |
| `/plan-challenger` | Bir planı uygulamadan önce çürütmeye çalışır (migration'larda zorunlu). |
| `/diff-review` | Kod değişikliklerini tehlikeli örüntülere karşı tarar. |
| `/create-migration` | Veritabanı değişikliğini güvenli ritüelle hazırlar. |
| `/venthub-20-eksen-denetimi` | Siteye 20 eksenli kalite karnesi çıkarır. |
| `/notebooklm-sync` | Proje belgelerini NotebookLM dijital ikizine yükler. |
| `/code-review` | PR'lara yapay zekâ kod incelemesi koşar. |

Geri kalan ~70 komut: eklenti paketleriyle gelen başvuru rehberleri (Vercel, CodeRabbit
vb.) ve Claude'un iç araçları. Durmaları maliyetsizdir; Claude ihtiyaç anında açar.

## Kısa tarihçe / niçin bu sayfa var

2026-09-01: Recep "o kadar çok / komutu var ki hiçbirini kullanmıyoruz, ne zaman nasıl
kullanılacağını bilen yok" dedi. Cevap: bilmesi gereken tek liste yukarıdaki ilk tablo
(6 satır); gerisi Claude'un işi. Bu sayfa o günün kaydıdır — yeni bir "senin komutun"
doğarsa bu tabloya eklenir.
