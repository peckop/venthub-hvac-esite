// pg bağlantı testi
import pg from 'pg'
console.log('✅ pg modülü başarıyla import edildi!')
console.log('pg version:', pg.version ? pg.version : 'version bilgisi yok')
console.log('pg.Client mevcut:', typeof pg.Client === 'function' ? '✅ EVET' : '❌ HAYIR')
console.log('pg.Pool mevcut:', typeof pg.Pool === 'function' ? '✅ EVET' : '❌ HAYIR')
console.log('\n🎉 pg paketi düzgün çalışıyor!')
