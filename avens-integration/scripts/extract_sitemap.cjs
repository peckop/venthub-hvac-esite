/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Avens Site Haritası Çıkarma Scripti
 */

const _fs = require('_fs');
const _path = require('_path');

// Ana kategoriler
const mainCategories = {
  "fanlar": {
    "name": "Fanlar",
    "url": "https://www.avensair.com/urunler#",
    "subcategories": [
      { name: "Konut Tipi Fanlar", url: "https://www.avensair.com/konut-tipi-fanlar" },
      { name: "Kanal Tipi Fanlar", url: "https://www.avensair.com/kanal-tipi-fanlar" },
      { name: "Çatı Tipi Fanlar", url: "https://www.avensair.com/cati-tipi-fanlar" },
      { name: "Ex-Proof Fanlar", url: "https://www.avensair.com/ex-proof-fanlar-patlama-karsi-atex-fanlar" },
      { name: "Duvar Tipi Kompakt Aksiyal Fanlar", url: "https://www.avensair.com/duvar-tipi-kompakt-aksiyal-fanlar" },
      { name: "Santrifüj Fanlar", url: "https://www.avensair.com/santrifuj-fanlar" },
      { name: "Duman Egzoz Fanları", url: "https://www.avensair.com/duman-egzoz-fanlari" },
      { name: "Basınçlandırma Fanları", url: "https://www.avensair.com/basinclandirma-fanlari" },
      { name: "Otopark Jet Fanları", url: "https://www.avensair.com/otopark-jet-fanlari" },
      { name: "Sığınak Havalandırma Fanları", url: "https://www.avensair.com/siginak-havalandirma-fanlari" },
      { name: "Nicotra Gebhardt Fanlar", url: "https://www.avensair.com/nicotra-gebhardt-fanlar" },
      { name: "Sessiz Kanal Tipi Fanlar", url: "https://www.avensair.com/sessiz-kanal-tipi-fanlar" }
    ]
  },
  "isi_geri_kazanim": {
    "name": "Isı Geri Kazanım Cihazları",
    "url": "https://www.avensair.com/urunler#",
    "subcategories": [
      { name: "Konut Tipi", url: "https://www.avensair.com/konut-tipi" },
      { name: "Ticari Tip", url: "https://www.avensair.com/ticari-tip" }
    ]
  },
  "nem_alma": {
    "name": "Nem Alma Cihazları",
    "url": "https://www.avensair.com/nem-alma-cihazlari"
  }
};

// Sitemap'i kaydet
function saveSitemap() {
  const outputPath = _path.join(__dirname, '../_data/sitemap.json');
  _fs.writeFileSync(outputPath, JSON.stringify(mainCategories, null, 2), 'utf8');
  console.warn(`✅ Sitemap kaydedildi: ${outputPath}`);
  
  // Özet bilgi
  let totalSubcategories = 0;
  Object.values(mainCategories).forEach(cat => {
    if (cat.subcategories) {
      totalSubcategories += cat.subcategories.length;
    }
  });
  
  console.warn(`📊 Toplam ana kategori: ${Object.keys(mainCategories).length}`);
  console.warn(`📊 Toplam alt kategori: ${totalSubcategories}`);
}

saveSitemap();
