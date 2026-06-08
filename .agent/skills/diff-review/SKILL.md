---
name: diff-review
description: Git diff çıktılarını analiz ederek yıkıcı ve tehlikeli kod örüntülerini
  (pattern) tespit eder. Sadece kod değişikliklerini (git diff veya commit öncesi)
  incelemek için kullanın. Yeni git branch'i oluşturma, kod commit'leme veya genel
  git işlemleri için KULLANMAYIN.
category: audit
metadata:
  triggers:
  - diff review
  - commit check
  - git diff check
  inputs:
  - git diff output
  outputs:
  - checks verdict (pass/fail)
---


# Diff-Review Skill (Değişiklik Güvenliği Kontrolü)

## Ne Zaman Kullanılır
- Kod değişiklikleri commitlemeye (örn: `/bitir`) gönderilmeden *hemen önce*.
- Bir fonksiyonun silindiği veya tip güvenliğinden şüphelenilen değişikliklerde.

## Çalışma Prensibi
Ajanın insiyatifine ("Baktım, her şey yolunda" halüsinasyonuna) bırakılmamış bir `Guardrail` (Duvar) sistemidir. Doğrudan `git diff HEAD` çağrısını Python üzerinden parse eder.
Eğer riskli bir hareket tespit ederse `Exit Code 1` döner ve süreci bloklar.

## Kapsanan Kurallar (Siyah Liste)
1. **Type Any (`+.*: any`, vb.):** Sıkı TS kurallarına göre bir şeye `any` atamak bir zayıflıktır.
2. **Yıkıcı DB İşlemleri (`+.*DROP TABLE`, vb.):** Supabase migrate sırasında kazara bir verisinin düşmesi engellenir.
3. **Kritik İhracatları Kesmek (`-.*export function` vb.):** Varolan bir servisin public methodunun silinmesine `[MAJOR]` uyarı fırlatır, dikkat çeker.

## Nasıl Çalıştırılır
Terminale (veya `SafeToAutoRun` workflowuna) şu komut girilerek otonom denetim sağlanır:
```bash
python .agent/skills/diff-review/scripts/check_diff_rules.py
```

Eğer haklı bir gerekçe (Örn: Veritabanı masayı *bilerek* drop etmeli) varsa, kod satırının yanına `// diff-ignore` comment'i eklenerek kural aşılır.
Örn:
```ts
const foo: any = parseUnknownData(); // diff-ignore: Dış API'den gelen veriye Type uygulanamadı.
```
4. **Console.log kalıntısı:** Geliştirme çöpünün production'a sızması engellenir.
5. **Hardcoded URL sızıntısı (localhost:3000):** Geliştirme ortamı URL'si production bundle'a gitmemeli.
6. **Mock data sızıntısı:** app/ path'lerinde inline object array kalıntıları (geçici test verisi).
7. **Secret sızıntısı (service_role):** Supabase service_role anahtarının client bundle'a sızması.
8. **useSearchParams Suspense İhlali:** Git diff'te yeni eklenen veya değiştirilen bir dosyada `useSearchParams` hook'unun kullanıldığı, ancak dosya içerisinde `<Suspense>` sarmalının veya wrapper'ının yer almadığı durumlar riskli kabul edilerek uyarılır.
