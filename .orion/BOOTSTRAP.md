# Orion Federation — Bootstrap

> Bu proje **Orion Federation**'ın parçasıdır.
> Aşağıdaki talimatları oku ve uygula.

## 🆔 Proje Kimliği
- **Proje Adı:** `venthub`
- **Rol:** Ana Ürün — HVAC e-ticaret platformu (Next.js + Supabase)
- **ROADMAP:** `../orion-registry/docs/ROADMAP.md` (SSOT)

## 🚀 İlk Adım
Oturum başında şu komutu çalıştır:
```
or_recall(project_name="venthub")
```

## 📋 Görev Alma
```
or_triage_briefing()       → Stratejik brifing
or_triage()                → Skorlanmış görev listesi
or_list_tasks(status="active") → Aktif görevler
```

## ✅ Görev Bitirme
```
or_task_finalize(task_dir="...") → Test et, doğrula, mühürle
cc_seal_session(summary="...", next_action="...") → Oturumu kapat
```

## 🧠 Hafıza
```
cc_search(query="...", cross_project=True) → Tüm projelerde ara
cc_remember(content="...", intent_layer="N1_NE") → Bilgi kaydet
```

## ⚠️ Kurallar
- Dosya silme yetkisi YOK
- `npm run build` başarılı olmalı her değişiklik sonrası
- Supabase migration'ları `mcp_supabase_apply_migration` ile yapılmalı
- Security-critical dosyalar: `middleware.ts`, `auth/`, `sanitize/`
- PR merge'den önce Mimar onayı gerekir
