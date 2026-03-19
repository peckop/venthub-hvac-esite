# Plan: Skills Factory Infrastructure (Full Implementation)
1. **Mimari Tasarım:** Skill Adapter altyapısını Python sınıfı olarak tasarla. Bu sınıf, harici komutları sarmalayacak.
2. **Superpowers Entegrasyonu:** Mevcut superpowers komutlarını (brainstorm, plan, review) bu sınıfa dinamik metodlar olarak bağla.
3. **Veritabanı Şeması:** SQLite üzerinde 'available_skills' tablosunu oluştur ve yeteneklerin sürümlerini takip et.
4. **Doğrulama (Verify):** 'python manage_registry.py skills' komutunun tüm yetenekleri doğru listelediğini manuel testlerle teyit et.
5. **Loglama:** Bir görev için herhangi bir skill tetiklendiğinde SQLite audit log tablosunda 'SKILL_EXEC' kaydı oluştuğunu gör.
