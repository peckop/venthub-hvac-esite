# Oturum Açılış Ritüeli — Loop Komutları (SSOT)

> **Ne zaman:** Bilgisayar/oturumlar yeniden açıldığında. Loop zincirleri (ScheduleWakeup) ve
> gözcüler oturum-içi yaşar — kapanışta ölürler. Pano/registry/PR'lar ise kalıcıdır; hiçbir iş
> kaybolmaz, yalnız "motorlar" durur. Bu dosya motorları yeniden çalıştırmanın tek kaynağıdır.
>
> **Ritüel (3 adım):** (1) Tüm pencereleri aç. (2) Bu dosyayı aç. (3) Her pencereye aşağıdaki
> İLGİLİ komutu yapıştır — OPS-AUDIT penceresine KOMUT-A, diğer HERKESE KOMUT-B (aynı metin).
>
> Oturum→rol eşlemesi panodadır (`node scripts/board/board.cjs who`); şerit adları akışkandır,
> komut metni şerit adı İÇERMEZ — şerit, atanan işle gelir.

---

## KOMUT-A — Orkestratör (yalnız OPS-AUDIT penceresi, `cb0467f1`)

```
/loop Orkestratör turu: (1) panoyu ve bana adresli notları oku, gerekeni işle/yönlendir;
(2) açık PR'ların check durumunu ölç — kendi şeridimdeki migration'sız yeşil PR'ı merge et,
başka oturumun canlı PR'ına ve migration'lı PR'a ASLA dokunma; (3) oturum/filo canlılığı
ölç — "koptu" hükmü ÇİFT sinyal ister (nabız VE not sessizliği); ana dizinin master'da
park olduğunu kontrol et; boş oturumları ve tamamlanan şeritleri tespit edip Recep'e raporla;
(4) registry ve hafızayı güncel tut; (5) Recep kararı gereken şeyleri biriktir, tek toplu
mesajda sor. Migration / prod yazımı / geri-alınamaz işlem = her zaman Recep kapısı.
Recep'e cevap her zaman mesajın EN BAŞINDA, tur raporundan ayrı; her girdisine açık kapanış.
İlk turda: gelen-kutusu gözcüsünü yeniden kur (notlar GÖNDERENİN events dosyasına yazılır).
```

## KOMUT-B — İşçi (diğer TÜM pencereler, tek ortak metin)

```
/loop İşçi turu: (1) Panodan bana adresli notları oku — OPS-AUDIT'ten (cb0467f1) gelen atama
birincil talimattır; notlar GÖNDERENİN events dosyasına yazılır, kendi dosyana bakma; şerit
adım son atanan işten gelir, panodan doğrula. (2) Elimdeki işi sürdür: ölç → plan → uygula →
kapılar → PR; migration'lı PR'ı YALNIZ Recep merge eder; kendi şeridimdeki migration'sız
yeşil PR'ı kendim alırım. (3) Durum değişince (bitti/tıkandı/PR açıldı/kuyruğum boş)
OPS-AUDIT'e adresli not bırak; Recep kararı gereken şeyi kendim çözmem, OPS-AUDIT'e iletirim.
(4) DEMİR KURALLAR: ana çalışma dizinine DOKUNMA (iş = kendi worktree'm) · pano notunda
backtick YOK · monitor kurarken kullandığım aracın VARLIĞINI önce doğrula (jq bu makinede
YOK) · Recep'le konuştuğum HER turun sonunda — istisnasız — loop'u (ScheduleWakeup) yeniden
kur, yoksa zincir sessizce ölür. İşim varken sık (5-10dk), boşken seyrek (30dk) tur atarım.
```

---

## Notlar

- **Gece kesintisiz otonomi** isteniyorsa bu ritüel yetmez (makine kapanınca durur) →
  `/schedule` ile bulut rutini ayrı kurulur (Recep kararı).
- Bu dosya SSOT'tur: komut metni değişecekse ÖNCE burada değişir, sonra pencerelere girilir.
- Kaynak kararlar: `docs/standards/collaboration-protocol.md` (şerit sahipliği, tek-giriş
  kuralı, ana-dizin parkı) · memory `autonomy-ladder-and-loop` (tasarım gerekçesi).
