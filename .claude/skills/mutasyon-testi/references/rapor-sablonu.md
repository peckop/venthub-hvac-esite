# Mutasyon testi raporu — şablon

Raporu bu sırayla ve bu başlıklarla yaz. Türkçe, akan cümle; sayı ve karşılaştırma tabloyla. Her sayı bir komut çıktısından gelir; çıktıyı yapıştır. Ölçmediğini "ölçülmedi" diye yaz.

```
## Özet
<2-4 cümle: kapsam, mutasyon skoru önce → sonra, eklenen/güçlendirilen test sayısı, bulunan üretim hatası sayısı (düzeltilmedi)>

## Taban
- Tam paket: <komut> → <geçen/kalan/atlanan, süre>
- Kapsam paketi: <komut> → <sayılar>
- Kapsam yüzdesi (depoda yapılandırılmışsa): <dosya başına>

## Test envanteri ve statik denetim
| Test dosyası | Test | Hüküm | Aşama 3 doğruladı mı |

## Mutasyon sonuçları (önce)
<koşucunun ürettiği tablo, olduğu gibi>

## Kaos yoklamaları
| ID | Yoklama | Girdi | Beklenen | Gerçekleşen | Sonuç (eksik test / üretim hatası / hiçbiri) |

## Bulgular
### T1 — <tür> — <şiddet> — <kısa başlık>
- Yer:
- Kanıt: <betik yolu> — <anahtar çıktı satırları>
- Neden önemli:
- Yapılan: <test eklendi/güçlendirildi: yol> | yalnız raporlandı (üretim hatası)

## Şüpheli, kanıtsız (eylem yok)
## Üretim hataları (DÜZELTİLMEDİ)
## Eklenen / güçlendirilen testler
| Test | Dosya | Öldürdüğü mutant | Özgünde geçiyor | 5 kez deterministik |

## Mutasyon sonuçları (sonra)
<`--karsilastir` çıktısı>

## Mutasyon skoru
- Önce: <killed>/<toplam> = <x%>
- Sonra: <killed>/<toplam> = <y%>
- Eşdeğer olabilecek mutantlar (paydadan ayrı): <kimlikler>

## Son doğrulama
- Tam paket sonra: <komut> → <sayılar> (taban sayıdan büyük)
- `git diff --stat`: <yalnız test dosyaları>
- Ağaç mutasyondan temiz: <`git status --porcelain` çıktısı>
- Bağımsız doğrulama: <yeniden koşulan mutantlar ve eşleşme>
- §10.3 mutasyon doğrulayıcısı istisnası: <cetvele işlendi / beklemede>

## Scratch'te bırakılanlar
## Sonraki adımlar (en çok 3)
```
