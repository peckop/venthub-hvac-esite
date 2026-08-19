#!/usr/bin/env bash
# apt-hardening.sh — koşucudaki apt'yi "sessizce asılmak" yerine "sınırlı sürede
# başarısız olmak" davranışına geçirir. Paket KURMAZ; yalnız yapılandırma yazar.
#
# NİÇİN VAR (2026-08-19, ölçüldü — varsayılmadı)
# ---------------------------------------------
# admin-smoke işi üç bağımsız koşumda (32225114226 · 32225609438 · 32224496574)
# "Install Playwright Chromium" adımında ~24,5 dakika asılı kaldı ve 25 dakikalık
# iş bütçesini yiyip bitirdi. Günlük kökü açıkça gösteriyor: asılan şey tarayıcı
# indirmesi DEĞİL, `--with-deps` bayrağının çağırdığı apt.
#
#   Ign: http://azure.archive.ubuntu.com/ubuntu noble InRelease      (tekrar tekrar)
#   Hit: https://archive.ubuntu.com/ubuntu noble InRelease
#   Get:5 https://archive.ubuntu.com/ubuntu noble-security InRelease
#   ...  07:25:16'dan iptal anına kadar 24 dakika TEK SATIR ÇIKTI YOK
#
# Sağlıklı koşumda (32229863553) aynı adım 1 dakika 18 saniye sürüyor; içindeki
# ayrışma apt ~70 saniye, tarayıcı indirmesi ~8 saniye. Yani `ms-playwright`
# önbelleği toplam sürenin yalnız 8 saniyesine dokunur ve ASILMAYI ENGELLEMEZ —
# bu betik onun için var.
#
# AYNI SINIF BAŞKA İŞLERDE DE YAŞIYOR: supabase-migrate 2026-08-19'da
# "Install PostgreSQL client" adımında 27 dakika asılı kaldı ve prod migration'ı
# geciktirdi. Kusur bir iş akışının değil, KOŞUCUDAKİ apt'nin varsayılan
# davranışının: zaman aşımı yok, IPv6 önce deneniyor, tekrar yok.
set -Eeuo pipefail

AYAR_DOSYASI=/etc/apt/apt.conf.d/99-venthub-ci

sudo tee "$AYAR_DOSYASI" >/dev/null <<'AYAR'
// VentHub CI — apt asılmasın, sınırlı sürede başarısız olsun (scripts/ci/apt-hardening.sh)
Acquire::ForceIPv4 "true";
Acquire::Retries "3";
Acquire::http::Timeout "20";
Acquire::https::Timeout "20";
Acquire::ftp::Timeout "20";
AYAR

echo "apt-hardening: $AYAR_DOSYASI yazildi"
sudo cat "$AYAR_DOSYASI"
