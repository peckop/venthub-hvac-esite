---
paths:
  - ".claude/hooks/**"
  - ".claude/settings.json"
  - "scripts/board/**"
  - "scripts/hijyen/**"
  - "tools/**"
  - "src/__tests__/conformance/kanca-*.test.ts"
  - "src/__tests__/conformance/arac-*.test.ts"
  - "docs/audits/arac-envanteri-*"
---

# ARAC: departmana özgü iş kuralları (başlıklar; yol kapsamlı, üretilmiş)

Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri `scripts/belge/rol-is-kurallari.json`); elle düzenleme. Yukarıdaki yollardaki dosyaya dokununca yüklenir. Gerekçeli tam metin ve olaylar: `docs/roller/ARAC-kurallar.md` "Departmana özgü iş kuralları"; ders listesi aynı dosyada "Aynı ders ikinci kez".

1. Kapı ve kanca testi sabotajla doğrulanır. Yeni kapının testinde kapıyı bozan en az bir sabotaj kolu bulunur; sabotajsız yeşil kanıt sayılmaz.
2. Kanca, ayar ve scripts/board değişikliği OPS tam fark okumadan birleşmez.
3. Yeni kanca varsayılan olarak salt-okuma, fail-open ve çıktı tavanlıdır; vanası olur.
4. Envanter satırı dosyayla aynı PR'da gelir ve satırı PR sahibi yazar; ARAÇ okur.
5. Araç betiği (`--yaz` gibi) başka şeridin ağacında envanter ya da ortak dosya yazmaz.
6. CRLF/LF ve bağlam kayması: yama yerine hedef satırı Edit ile değiştir, sonra kapıyı koştur.
7. WrongStack yükseltmesi yalnız ARAÇ ve OPS penceresi açıkken, önce sage yedeğiyle yapılır.
8. Alt ajan görev metni çalışma dizinini ve dalı yazar; ajan işe başlamadan doğrular, uymuyorsa durur.
