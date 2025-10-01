/**
 * Avens Site Haritası Çıkarma Scripti
 * Tüm kategorileri, alt kategorileri ve ürün linklerini toplar
 */

const fs = require('fs');
const path = require('path');

// Ana kategoriler (önceki Firecrawl çıktısından)
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
  "hava_perdeleri": {
    "name": "Hava Perdeleri",
    "url": "https://www.avensair.com/urunler#",
    "subcategories": [
      { name: "Elektrikli Isıtıcılı", url: "https://www.avensair.com/elektrikli-isiticili" },
      { name: "Ortam Havalı", url: "https://www.avensair.com/ortam-havali" }
    ]
  },
  "nem_alma": {
    "name": "Nem Alma Cihazları",
    "url": "https://www.avensair.com/nem-alma-cihazlari"
  },
  "hava_temizleyiciler": {
    "name": "Hava Temizleyiciler Anti-Viral Ürünler",
    "url": "https://www.avensair.com/urunler#",
    "subcategories": [
      { name: "Depuro Pro", url: "https://www.avensair.com/depuro-pro" },
      { name: "Uv Logika", url: "https://www.avensair.com/uv-logika" },
      { name: "Vort Super Dry", url: "https://www.avensair.com/vort-super-dry" },
      { name: "S&G Dispenser", url: "https://www.avensair.com/s-g-dispenser" }
    ]
  },
  "flexible_kanallar": {
    "name": "Flexible Hava Kanalları",
    "url": "https://www.avensair.com/flexible-hava-kanallari"
  },
  "hiz_kontrolu": {
    "name": "Hız Kontrolü Cihazları",
    "url": "https://www.avensair.com/urunler#",
    "subcategories": [
      { name: "Hız Anahtarı", url: "https://www.avensair.com/hiz-anahtari" },
      { name: "DANFOSS", url: "https://www.avensair.com/danfoss" }
    ]
  },
  "aksesuarlar": {
    "name": "Aksesuarlar",
    "url": "https://www.avensair.com/urunler#",
    "subcategories": [
      { name: "Gemici Anemostadı", url: "https://www.avensair.com/gemici-anemostadi" },
      { name: "Bağlantı Konnektörü", url: "https://www.avensair.com/baglanti-konnektoru" },
      { name: "Plastik Kelepçeler", url: "https://www.avensair.com/plastik-kelepceler" },
      { name: "Alüminyom Folyo Bantlar", url: "https://www.avensair.com/aluminyum-folyo-bantlar" }
    ]
  }
};

// Sitemap'i kaydet
function saveSitemap() {
  const outputPath = path.join(__dirname, '../data/sitemap.json');
  fs.writeFileSync(outputPath, JSON.stringify(mainCategories, null, 2), 'utf8');
  console.log(`✅ Sitemap kaydedildi: ${outputPath}`);
  
  // Özet bilgi
  let totalSubcategories = 0;
  Object.values(mainCategories).forEach(cat => {
    if (cat.subcategories) {
      totalSubcategories += cat.subcategories.length;
    }
  });
  
  console.log(`📊 Toplam ana kategori: ${Object.keys(mainCategories).length}`);
  console.log(`📊 Toplam alt kategori: ${totalSubcategories}`);
}

if (require.main === module) {
  saveSitemap();
}

module.exports = { mainCategories, saveSitemap };