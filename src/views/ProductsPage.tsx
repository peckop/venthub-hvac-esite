'use client'

import React from 'react'

import ProductsDiscoveryView from './ProductsDiscoveryView'

/**
 * @page ProductsPage
 * @description ProductsDiscoveryView için ÖN YÜKLEME sarmalayıcısı.
 *
 * ⚠NE OLDUĞUNU OLDUĞU GİBİ YAZIYORUM (REC-213-A'da ölçüldü): bu bileşeni uygulama
 * ağacında hiçbir yer ÇİZMİYOR. Tek tüketicisi `src/utils/prefetch.ts`, o da onu
 * `import()` ile yalnız paketi ısıtmak için çağırıyor. Gerçek `/[lang]/products`
 * rotası `CategoryMasterView` üzerinden gidiyor.
 *
 * `initialCategories` prop'u BURADAN KALKTI: aşağıdaki görünümde karşılığı olan ölü
 * prop kaldırıldı (yerine gerçekten çizilen `kategoriler` geldi) ve bu sarmalayıcıya
 * hiç kimse prop geçmiyordu — geçseydi bile çizilmiyordu.
 *
 * Dosya SİLİNMEDİ: silmek `prefetch.ts`i ve testini kırardı. Ön yüklemenin GERÇEK
 * rotanın paketini ısıtıp ısıtmadığı ayrı bir soru ve bu işin kapsamı değil.
 */
const ProductsPage: React.FC = () => {
  return <ProductsDiscoveryView />
}

export default ProductsPage
