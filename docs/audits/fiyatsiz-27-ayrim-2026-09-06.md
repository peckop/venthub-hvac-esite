# Fiyatsız ürünlerin ayrımı — içe alım boşluğu mu, ticari boşluk mu? (REC-168)

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Tarih:** 2026-09-06 · **Durum:** SALT OKUMA ölçüm; hiçbir fiyat yazılmadı.

## KAYNAK / CETVEL

* `docs/standards/pricing-standard.md` — fiyat/kur/marj otoritesi.
* `docs/standards/catalog-ingestion-standard.md` **§1** — köprü = model kodu; **kodun biçimi hakkında varsayım yok** (T119: yalnız beş haneli kod bekleyen bir çıkarım 74 ürünü düşürmüştü). **§6.3** — kaynak dizini; PDF doğrudan taranmaz.
* Emir: OPS → KATALOG, REC-168. **YÖNTEM:** şerit, alt ajan yok. Sapma yok.

---

## 0 · Niçin bu ayrım

Satış kipine geçince fiyatsız ürün vitrinde fiyatsız kalır. Ama **"fiyat yok" tek bir sorun değil**, iki bambaşka sorundur ve çözümleri de bambaşkadır:

| Sınıf | Ne demek | Kimin işi |
|---|---|---|
| **İÇE ALIM BOŞLUĞU** | fiyat AVenS listesinde **var**, biz içe almamışız | bizim — bir betik |
| **TİCARİ BOŞLUK** | fiyat listede **yok**, AVenS hiç vermemiş | Recep — AVenS'e sorulacak |

Ayrım yapılmadan "satış kipine geçelim" denirse hangisinin **bizim eksiğimiz** olduğu bilinmez.

## 1 · Ölçüm

| Ölçüt | Sayı |
|---|---|
| Ürün kaydı (ham) | 375 |
| Silinmiş (`deleted_at` dolu) — **evrenden çıkarıldı** | 0 |
| **Canlı ürün** | **375** |
| Fiyatlı (`gross_price` ya da `net_price` > 0) | 348 |
| **FİYATSIZ** | **27** |

**Ayrım: 27 = 1 içe alım + 26 ticari + 0 kod yok**

## 2 · ⭐ASIL BULGU — dağınık ürün değil, KOMPLE AİLE

27 sayısı yanıltıcı okunabilir. Ürün bazında dağınık değil: **4 aile TAMAMEN fiyatsız** (15 ürün). Satış kipine geçilince bu aileler vitrinde **tek bir fiyat bile göstermez** — eksik ürün değil, eksik aile.

| Aile | Fiyatsız | Toplam | Durum |
|---|---|---|---|
| `vortice-vort-qbk-sal-kc-evo` | 11 | 21 | kısmi (10 fiyatlı) |
| `vortice-radon-range-circular` | 5 | 5 | **TAMAMI FİYATSIZ** |
| `vortice-vortice-bravo-s` | 4 | 4 | **TAMAMI FİYATSIZ** |
| `vortice-radon-range-roof` | 3 | 3 | **TAMAMI FİYATSIZ** |
| `vortice-deumido-range` | 3 | 3 | **TAMAMI FİYATSIZ** |
| `avens-hucreli-aspiratorler` | 1 | 6 | kısmi (5 fiyatlı) |

Bu, tek tek ürün eksiği gibi görünen şeyin aslında **ticari kapsam sorusu** olduğunu söylüyor: AVenS bu aileler için hiç fiyat vermemiş. Soru "fiyatı girelim mi" değil, **"bunları satıyor muyuz"**.

## 3 · Tablo (ürün bazında)

| Ürün (slug) | Model kodu | Aile | Fiyat listesi s. | Sınıf |
|---|---|---|---|---|
| `avens-hf-fw-18-18-5-5kw-20150` | `20150` | avens-hucreli-aspiratorler | 28 | **ICE ALIM BOSLUGU** |
| `vort-qbk-sal-kc-evo-315-t2-1-5kw-43152` | `43152` | vortice-vort-qbk-sal-kc-evo | yok | **TICARI BOSLUK** |
| `vort-qbk-sal-kc-evo-315-t4-8-0-25-0-03kw-43165` | `43165` | vortice-vort-qbk-sal-kc-evo | yok | **TICARI BOSLUK** |
| `vort-qbk-sal-kc-evo-355-t4-8-0-25-0-03kw-43166` | `43166` | vortice-vort-qbk-sal-kc-evo | yok | **TICARI BOSLUK** |
| `vort-qbk-sal-kc-evo-400-t4-8-0-75-0-12kw-43167` | `43167` | vortice-vort-qbk-sal-kc-evo | yok | **TICARI BOSLUK** |
| `vort-qbk-sal-kc-evo-450-t4-8-1-1-0-18kw-43168` | `43168` | vortice-vort-qbk-sal-kc-evo | yok | **TICARI BOSLUK** |
| `vort-qbk-sal-kc-evo-500-t4-8-1-5-0-25kw-43169` | `43169` | vortice-vort-qbk-sal-kc-evo | yok | **TICARI BOSLUK** |
| `vort-qbk-sal-kc-evo-500-t6-0-55kw-43160` | `43160` | vortice-vort-qbk-sal-kc-evo | yok | **TICARI BOSLUK** |
| `vort-qbk-sal-kc-evo-560-t4-8-3-0-55kw-43170` | `43170` | vortice-vort-qbk-sal-kc-evo | yok | **TICARI BOSLUK** |
| `vort-qbk-sal-kc-evo-560-t6-1-1kw-43162` | `43162` | vortice-vort-qbk-sal-kc-evo | yok | **TICARI BOSLUK** |
| `vort-qbk-sal-kc-evo-630-t4-8-5-5-1-1kw-43171` | `43171` | vortice-vort-qbk-sal-kc-evo | yok | **TICARI BOSLUK** |
| `vort-qbk-sal-kc-evo-630-t6-1-5kw-43164` | `43164` | vortice-vort-qbk-sal-kc-evo | yok | **TICARI BOSLUK** |
| `vortice-bra-vo-s1-13147` | `13147` | vortice-vortice-bravo-s | yok | **TICARI BOSLUK** |
| `vortice-bra-vo-s2-13148` | `13148` | vortice-vortice-bravo-s | yok | **TICARI BOSLUK** |
| `vortice-bra-vo-s3-13149` | `13149` | vortice-vortice-bravo-s | yok | **TICARI BOSLUK** |
| `vortice-bra-vo-s4-13150` | `13150` | vortice-vortice-bravo-s | yok | **TICARI BOSLUK** |
| `vortice-ca-rm-100-es-16277` | `16277` | vortice-radon-range-circular | yok | **TICARI BOSLUK** |
| `vortice-ca-rm-125-es-16278` | `16278` | vortice-radon-range-circular | yok | **TICARI BOSLUK** |
| `vortice-ca-rm-150-es-16279` | `16279` | vortice-radon-range-circular | yok | **TICARI BOSLUK** |
| `vortice-ca-rm-150-rf-es-16257` | `16257` | vortice-radon-range-roof | yok | **TICARI BOSLUK** |
| `vortice-ca-rm-160-es-16280` | `16280` | vortice-radon-range-circular | yok | **TICARI BOSLUK** |
| `vortice-ca-rm-160-rf-es-16258` | `16258` | vortice-radon-range-roof | yok | **TICARI BOSLUK** |
| `vortice-ca-rm-200-es-16281` | `16281` | vortice-radon-range-circular | yok | **TICARI BOSLUK** |
| `vortice-ca-rm-200-rf-es-16259` | `16259` | vortice-radon-range-roof | yok | **TICARI BOSLUK** |
| `vortice-deumido-ng-10-26020` | `26020` | vortice-deumido-range | yok | **TICARI BOSLUK** |
| `vortice-deumido-ng-16-26021` | `26021` | vortice-deumido-range | yok | **TICARI BOSLUK** |
| `vortice-deumido-ng-20-26022` | `26022` | vortice-deumido-range | yok | **TICARI BOSLUK** |

## 4 · Pozitif kontrol — ölçüt gerçekten arıyor mu

"26 ürün listede yok" iddiası, eşleştirici **bozuksa da** aynı sonucu verirdi. Ayırt edici sınav: **fiyatlı** ürünlerin kodu listede geçmeli.

| Sınav | Sonuç |
|---|---|
| Fiyatlı üründen rastgele örnek (tohum 7) | 40 |
| Kodu fiyat listesinde **geçen** | **40** |

Yani ölçüt körü körüne "yok" demiyor: olması gereken yerde **buluyor**, olmaması gereken yerde bulmuyor. Bu sınav geçmeseydi rapor yayımlanmazdı.

## 5 · Bu ölçümün sınırı — adıyla

Eşleme ölçütü: **model kodu, fiyat listesi sayfasında geçiyor mu.** Geçmek, o sayfadaki fiyatın **bu ürüne ait olduğunu kanıtlamaz** — kod başka bir bağlamda da geçebilir. Bu yüzden sınıf adı "fiyat bulundu" değil **İÇE ALIM BOŞLUĞU**: iddia "fiyat listede duruyor olabilir, bakılmalı"dır, "fiyat şudur" değil.

Ters yön daha güçlü: kod **hiç geçmiyorsa** o ürün fiyat listesinde yoktur — **TİCARİ BOŞLUK** iddiası bu yüzden daha sağlamdır.

Ayrıca `model_code` boş olan ürün **ölçülemez**, ayrı sınıfta tutulur; kanıtsızla karıştırılmaz.

## 6 · Sıradaki

* **İçe alım boşlukları** → REC önerisi (açmayı OPS yapar).
* **Ticari boşluklar** → Recep'e OPS taşır; AVenS'ten istenecek kalem.
* Fiyat **yazılmadı**; bu iş yalnız sınıflandırmadır.
