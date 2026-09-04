# Olay kaydı — sır değeri ekrana basıldı (2026-09-04, ALTYAPI)

> **Bu dosya PAROLASIZDIR ve öyle kalacak.** Sızan değer burada, PR gövdelerinde, commit
> mesajlarında ya da pano notlarında **yazılmadı**. Olayın kaydı, olayın tekrarı değildir.

## Ne oldu

REC-138 kapsamında yazdığım `anon-yazma-nobetcisi.mjs`'in **fail-closed** yolunu ölçüyordum:
"`SUPABASE_DB_URL` yoksa nöbetçi kırmızı veriyor mu?" Bunu ölçmek için değişkenin boş mu
dolu mu olduğunu görmek istedim ve şu kalıbı yazdım:

```
${VAR:+VAR (uzunluk ${#VAR})}${VAR:-YOK}
```

İkinci yarı hatalı: `${VAR:-YOK}`, değişken **dolu** olduğunda "YOK" basmaz — **değerin
kendisini** basar. Yani boş/dolu ölçmek isterken prod veritabanı bağlantı dizesinin tamamı
(host + kullanıcı + **parola**) komut çıktısına düştü.

## Kapsam (ölçüldü, tahmin değil)

| soru | cevap |
|---|---|
| repoya yazıldı mı? | **HAYIR** — commit yok, PR yok, takipli dosyada iz yok |
| takipli dosyalarda gerçek dize var mı? | **HAYIR** — 3 dosyada bağlantı dizesi *deseni* var (`.env.example`, `ci.yml`, `.scripts/migrate.ps1`), gerçek host izi **0** |
| dalımın commit'lerinde? | **0** |
| scratchpad dosyalarımda gerçek dize? | **0** (3 dosyada yalnız placeholder deseni) |
| nerede kaldı? | oturum çıktısı + yerel transkript (jsonl) |
| yayıldı mı? | **HAYIR** — dışarıya giden hiçbir yüzeye (repo, PR, artifact) değmedi |

**Sınıf bugünden eski:** OPS yerel transkriptleri taradı — benim oturumumda **2**, iki
**ESKİ** oturumda **37** eşleşme. Yani bu tek seferlik bir dikkatsizlik değil, tekrar eden
bir kalıp. Kapının gerekçesi budur.

## Karar ve müdahale

- **Recep kararı: parola DÖNDÜRÜLMEDİ.** Makine kendisinin, sızıntı sayılmadı, **kabul
  edilen risk** olarak kayda geçti. (Benim önerim döndürmekti; karar sahibinin.)
- **Yerel temizlik yapıldı** (OPS): transkriptlerdeki gerçek görünümlü bağlantı dizeleri
  `[SIR-KALDIRILDI]` ile değiştirildi, yedekler silindi, kalan **0**.
- **Kapı yazıldı** (bu işin asıl çıktısı) — aşağıda.

## Kapı: INV-SIR-BASMA-1

`.claude/hooks/sir-basan-kalip.cjs` — saf fonksiyon, `bash-write-guard.cjs`'den çağrılır.

**Niçin yeni kanca değil:** yeni kanca kaydetmek `.claude/settings.json` düzenlemek demek,
yani **config** — ve config'e ajan eli değmez. Bash komutlarını gören tek kayıtlı kanca
`bash-write-guard`; `sensitive-path-guard` yalnız `Edit|Write|MultiEdit` matcher'ında ve
`file_path` okuyor, komutu hiç görmüyor.

**Ayırt edici, değişkenin ADI değil KULLANIM BİÇİMİ.** Aynı değişken güvenli de kullanılır:

| biçim | karar | sebep |
|---|---|---|
| `${SIR:-YOK}` | ⛔ | dolu ise **değeri** basar (olayın kendisi) |
| `${SIR-YOK}` | ⛔ | aynı |
| `echo $SIR` | ⛔ | doğrudan basar |
| `echo "${SIR:+$SIR}"` | ⛔ | varlık kalıbı ama içinde değeri basıyor |
| `[ -z "${SIR:-}" ]` | ✅ | boş varsayılan — yaygın ve güvenli deyim |
| `${#SIR}` | ✅ | yalnız uzunluk |
| `${SIR:+VAR}` | ✅ | yalnız varlık bildirir |
| `$NEXT_PUBLIC_*` | ✅ | tanımı gereği public (anon key prod bundle'ında zaten açık) |

**Kapı ilk koşumunda kendi testini engelledi** — bu, kapının canlı olduğunun kanıtı. Aynı
koşum bir **yanlış pozitif** de gösterdi (`${SIR:+VAR}` tehlikeli sayılıyordu) ve düzeltildi:
meşru kullanımı reddeden bir kapı kısa sürede kapatılır ve hiçbir şey ölçmez.

## Ölçümler

birim 13/13 · konformans kolu 16/16 · kapı canlıda bir komutu **gerçekten reddetti**

## Ders (cetvele giden hâli)

**Bir sırrın boş mu dolu mu olduğunu ölçerken DEĞERİ değil OLGUYU bas.** Uzunluk
(`${#VAR}`) ya da varlık (`${VAR:+VAR}`) yeterlidir; varsayılan-değer kalıbı (`${VAR:-...}`)
ölçüm için **yanlış araçtır** ve dolu durumda tam tersini yapar.
