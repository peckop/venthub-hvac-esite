---
name: diff-review
description: Statik Git diff analizi yoluyla yıkıcı pattern'leri tespit eder.
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
