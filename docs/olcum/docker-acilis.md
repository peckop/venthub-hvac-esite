# Ölçüm defteri: Docker Desktop açılış kalıntısı (ALT-130)

Sahibi: ALTYAPI · Son doğrulama: 2026-11-03 · Cetvel: yok (bu not yerel çalıştırma notudur)

## Sorun (ölçüldü)
Makine Docker açıkken kapanınca `%LOCALAPPDATA%\Docker\run` altında AF_UNIX soketleri kalır
(`dockerInference`, `userAnalyticsOtlpHttp.sock`). Docker Desktop 4.43.2 açılışta bunları silemez
("The file cannot be accessed by the system", Error 1920), arka uç çöker, motor hiç açılmaz.
Tekrar: `run.bozuk-2026-10-11`, `-10-12`, `-10-12b`, `run.bayat-20261102-222328`, `run.bayat-20261103-091642` (5 kez).

Ölçüm tuzakları: `Test-Path` / `test -e` bu dosyalarda YANLIŞ NEGATİF verir (dosya "yok" görünür);
kanıt `[IO.Directory]::GetFileSystemEntries`. `Remove-Item`, `del`, `fsutil` aynı Error 1920 ile reddeder.
Çalışan yol: `wsl --shutdown` + `run` klasörünü `[IO.Directory]::Move` ile kenara taşı + boş `run` aç.

## Kalıcı önlem
`scripts/ci/docker-acilis.ps1` oturum açılışında Docker'dan ÖNCE koşar:
Docker zaten çalışıyorsa hiçbir şeye dokunmaz; `run` doluysa `wsl --shutdown` + taşıma + boş `run`;
7 günden eski `run.bayat-*` / `run.bozuk-*` klasörlerini günlüğe yazar (silmez);
taşıma başarısızsa Docker'ı BAŞLATMAZ (çıkış 1), başarılıysa başlatır.
Günlük: `%LOCALAPPDATA%\Docker\docker-acilis.log`.

Docker'ın kendi açılış kaydı (`HKCU\...\Run` altında `Docker Desktop`) kaldırılır; yoksa Docker betikten
önce açılır, betik "zaten çalışıyor" deyip çekilir ve çökme sürer. Ayarlardaki `AutoStart` zaten `false`
(2026-11-03 ölçüldü), yani Run kaydı ayardan bağımsız duruyordu.

## Kurulum (yönetici yetkisi gerekmez; hepsi HKCU ve kullanıcı dizini)
```powershell
$h = Join-Path $env:LOCALAPPDATA 'VentHub'; New-Item -ItemType Directory -Force $h | Out-Null
Copy-Item C:\Users\alize\venthub-hvac\scripts\ci\docker-acilis.ps1 $h -Force
$k = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
Remove-ItemProperty -Path $k -Name 'Docker Desktop'
Set-ItemProperty -Path $k -Name 'VentHub Docker acilis' -Value ('powershell.exe -NoProfile -WindowStyle Hidden -File "' + (Join-Path $h 'docker-acilis.ps1') + '"')
```

## Geri alma
```powershell
$k = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
Remove-ItemProperty -Path $k -Name 'VentHub Docker acilis'
Set-ItemProperty -Path $k -Name 'Docker Desktop' -Value 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
```

## Sınama (2026-11-03, sahte dizinde; gerçek Docker'a dokunulmadı)
| Durum | Sonuç |
|---|---|
| `run` içinde kalıntı | taşındı, yeni `run` 0 öğe, çıkış 0 |
| `run` temiz | "run temiz", çıkış 0 |
| `-Kuru` + kalıntı | yalnız yazdı, `run` değişmedi |
| `run` kilitli (taşıma başarısız) | Docker başlatılmadı, çıkış 1 |
| 20 günlük `run.bozuk-*` | günlüğe yazıldı, silinmedi |
| gerçek dizin, Docker çalışıyor, `-Kuru` | "zaten çalışıyor; dokunulmadı" |

Kabul ölçümü (ALT-130): makine Docker açıkken kapatılıp açılır, `docker info` elle müdahalesiz çıkış 0 verir.
