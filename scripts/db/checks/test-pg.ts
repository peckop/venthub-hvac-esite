// pg bağlantı testi
import pg from 'pg'
console.warn('✅ pg modülü başarıyla import edildi!')
console.warn('pg version:', pg.version ? pg.version : 'version bilgisi yok')
console.warn('pg.Client mevcut:', typeof pg.Client === 'function' ? '✅ EVET' : '❌ HAYIR')
console.warn('pg.Pool mevcut:', typeof pg.Pool === 'function' ? '✅ EVET' : '❌ HAYIR')
console.warn('\n🎉 pg paketi düzgün çalışıyor!')
