# İzin Kapıları Standardı

> **Sahibi:** ARAÇ · **Durum:** v0.1 · **Kaynak:** REC-410 (OPS izin denetimi 09-28)
> **Son doğrulama:** 2026-09-28.
> **Niçin var:** Recep 09-28: "beş kapı kâğıtta değil gerçekten korunsun" — hata için, güven için değil.
> İzin listesi (`permissions.allow/ask/deny`) aracın ADINA bakar, çağrının İÇERİĞİNE bakamaz. İçeriğe
> göre ayrılması gereken her kapı bir PreToolUse kancasıyla korunur ve bu belgede satır alır.

## Kural

1. Her kapı için **ne korunur / hangi kanca / hangi test / canlı ölçüm** satırı bu belgede yazılıdır.
   Satırı olmayan kapı "kâğıtta" sayılır.
2. Kanca emin olamadığında **sorar** (`ask`), geçirmez. Yanlış pozitif = fazladan bir onay sorusu;
   yanlış negatif = sessiz prod yazması. İkincisi her zaman daha pahalıdır.
3. Kabul ölçütü: yasak çağrı **araç izinliyken** denenir ve kancanın durdurduğu görülür. Araç zaten
   izinsizken alınan red kanıt değildir (red izin listesinden de gelebilir).
4. İzin listesindeki araç adları güncel adlarla yazılır; eski ad (ör. `mcp__supabase__*`) hiçbir
   çağrıyı tutmaz ve kapıyı sessizce açık bırakır.

## Kapılar

| # | Korunan | Kanca | Test | Canlı ölçüm | Durum |
|---|---|---|---|---|---|
| S1 | Canlı veritabanına SQL ile yazma (execute_sql) + apply_migration / deploy_edge_function / dal işlemleri | `.claude/hooks/sql-yazma-kapisi.cjs` | `sql-yazma-kapisi.test.ts` | 09-28 `claude -p`, araç `--allowedTools` ile izinli: `select 1` → sonuç; `begin; create temp table …; rollback;` → kanca durdurdu, çağrı gitmedi | KAPALI |
| S2 | `gh api` ile yazma (yalnız GET serbest) | — | — | — | AÇIK |
| S3 | `.env` ailesine Bash ile yazma | — | — | — | AÇIK |
| S4 | settings.local `git push --force-with-lease*` allow ↔ global deny çelişkisi | — | — | — | AÇIK |
| S5 | `ask` listesindeki eski `mcp__supabase__*` adları | S1 kancası bu araçları adından bağımsız yakalar | S1 testi | — | KISMEN (liste düzeltmesi ayrı) |

## S1 ayrıntı

**Ölçülen boşluk (09-28):** `mcp__claude_ai_Supabase__execute_sql` proje `settings.local.json`'da,
`mcp__plugin_supabase_supabase__execute_sql` kullanıcı `settings.json`'da **allow**. Bu makinedeki
kayıtlarda bu araçla 2.024 farklı sorgu çalışmış; aralarında UPDATE/INSERT/DELETE/DDL var, hiçbiri sorulmamış.

**Okuma sayılan:** her deyim SELECT / WITH / SHOW / EXPLAIN / VALUES / TABLE ile başlar (BEGIN, ROLLBACK
ve rol/istek/zaman aşımı/arama yolu SET'leri zararsız), yorum ve metin sabiti dışında yazma sözcüğü yok,
çağrılan proje fonksiyonu migration'daki son tanımında STABLE/IMMUTABLE. Postgres STABLE/IMMUTABLE
fonksiyonda yazmayı çalışma anında reddettiği için bu ölçüt beyan değil motor kuralıdır.

**Ölçülen isabet (2.024 gerçek sorgu):** 1.933 okuma sorusuz geçer; 91 sorulur — hepsi yazma, DDL,
DO bloğu, geri alınan deneme ya da VOLATILE fonksiyon çağrısı. Okuma sayılıp yazma kelimesi taşıyan: 0.

**Bilinen sınır:** migration dışında (panelden) yaratılmış bir `public` fonksiyon adı şema önekiyle
çağrılırsa sorulur; öneksiz çağrılırsa tanınmaz ve geçer. Proje fonksiyonları migration'la yazılır
(kural 13); panelden fonksiyon yaratmak zaten kural dışıdır.
