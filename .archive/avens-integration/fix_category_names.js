import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Supabase environment variables are required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Resimde görülen kategori yapısına uygun kategori eşlemeleri
const CATEGORY_RENAMES = [
  {
    current_id: 'f3a75c19-256a-44bb-a816-9379881f1346',
    current_name: 'Aksiyel Fanlar',
    new_name: 'Konut Tipi Fanlar'
  },
  {
    current_id: '512ae175-7a2f-4b4d-8dd6-9dbe4ef96261',
    current_name: 'Kanal Fanları', 
    new_name: 'Kanal Tipi Fanlar'
  },
  {
    current_id: 'b7642434-3cbb-4b6c-97e3-66f45ff077f3',
    current_name: 'Çatı Fanları',
    new_name: 'Çatı Tipi Fanlar'
  },
  {
    current_id: '36f701a5-eb64-4c2b-a9da-a6f525c22e81', 
    current_name: 'Duvar Fanları',
    new_name: 'Duvar Tipi Kompakt Aksiyal Fanlar'
  },
  {
    current_id: '29d5dc81-b8bd-4b0f-ba23-29795b3d62e9',
    current_name: 'Jet Fanlar', 
    new_name: 'Otopark Jet Fanları'
  },
  {
    current_id: '807cc1ed-6e08-47da-bc94-d4be0d2b4c0c',
    current_name: 'Sessiz Fanlar',
    new_name: 'Sessiz Kanal Tipi Fanlar'
  }
];

// Yeni kategoriler oluşturma
const NEW_CATEGORIES = [
  {
    name: 'Duman Egzoz Fanları',
    description: 'Yangın güvenliği için duman tahliye fanları'
  },
  {
    name: 'Basınçlandırma Fanları', 
    description: 'Kaçış merdivenlerini basınçlandıran fanlar'
  },
  {
    name: 'Sığınak Havalandırma Fanları',
    description: 'Sığınak ve acil durum alanları için fanlar'
  },
  {
    name: 'Nicotra Gebhardt Fanlar',
    description: 'Nicotra Gebhardt marka profesyonel fanlar'
  }
];

function generateSlug(_text) {
  return _text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function renameExistingCategories() {
  console.warn('🏷️ Mevcut kategori isimleri güncelleniyor...');
  
  let renamed = 0;
  
  for (const category of CATEGORY_RENAMES) {
    try {
      const newSlug = generateSlug(category.new_name);
      
      const { error } = await supabase
        .from('categories')
        .update({ 
          name: category.new_name,
          slug: newSlug
        })
        .eq('id', category.current_id);

      if (error) {
        console.error(`❌ ${category.current_name} → ${category.new_name} güncelleme hatası:`, error.message);
      } else {
        console.warn(`✅ ${category.current_name} → ${category.new_name}`);
        renamed++;
      }
    } catch (error) {
      console.error(`❌ Beklenmeyen hata:`, error.message);
    }
  }
  
  return renamed;
}

async function createNewCategories() {
  console.warn('\n📂 Yeni kategoriler oluşturuluyor...');
  
  let created = 0;
  const MAIN_FANLAR_ID = '4bc54533-7323-4eac-a02d-4498ffde00eb';
  
  for (const category of NEW_CATEGORIES) {
    try {
      const slug = generateSlug(category.name);
      
      // Kategori zaten var mı kontrol et
      const { _data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category.name)
        .single();

      if (existing) {
        console.warn(`⚠️ ${category.name} zaten mevcut`);
        continue;
      }
      
      const { error } = await supabase
        .from('categories')
        .insert([{
          name: category.name,
          slug: slug,
          description: category.description,
          parent_id: MAIN_FANLAR_ID,
          level: 1
        }]);

      if (error) {
        console.error(`❌ ${category.name} oluşturma hatası:`, error.message);
      } else {
        console.warn(`✅ Yeni kategori: ${category.name}`);
        created++;
      }
    } catch (error) {
      console.error(`❌ Beklenmeyen hata:`, error.message);
    }
  }
  
  return created;
}

async function updateATEXCategoryName() {
  console.warn('\n🔧 ATEX kategorisi güncelleniyor...');
  
  try {
    const { error } = await supabase
      .from('categories')
      .update({ 
        name: 'Ex-Proof Fanlar (Patlama Karşı ATEX Fanlar)',
        slug: 'ex-proof-fanlar-patlama-karsi-atex-fanlar'
      })
      .eq('id', '4a801860-24f3-4d02-8a1b-7e547f2be73e');

    if (error) {
      console.error('❌ ATEX kategori güncelleme hatası:', error.message);
    } else {
      console.warn('✅ ATEX kategorisi güncellendi');
    }
  } catch (error) {
    console.error('❌ ATEX güncelleme hatası:', error.message);
  }
}

async function redistributeProducts() {
  console.warn('\n📦 Ürünler uygun kategorilere dağıtılıyor...');
  
  // Duman egzoz ürünlerini taşı
  const { _data: dumanProducts } = await supabase
    .from('products')
    .select('id, name')
    .ilike('name', '%duman%egzoz%');

  if (dumanProducts && dumanProducts.length > 0) {
    const { _data: dumanCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('name', 'Duman Egzoz Fanları')
      .single();

    if (dumanCategory) {
      for (const product of dumanProducts) {
        await supabase
          .from('products')
          .update({ category_id: dumanCategory.id })
          .eq('id', product.id);
        console.warn(`📦 ${product.name} → Duman Egzoz Fanları`);
      }
    }
  }

  // Basınçlandırma ürünlerini taşı
  const { _data: basinclProducts } = await supabase
    .from('products')
    .select('id, name')
    .ilike('name', '%basınç%');

  if (basinclProducts && basinclProducts.length > 0) {
    const { _data: basincCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('name', 'Basınçlandırma Fanları')
      .single();

    if (basincCategory) {
      for (const product of basinclProducts) {
        await supabase
          .from('products')
          .update({ category_id: basincCategory.id })
          .eq('id', product.id);
        console.warn(`📦 ${product.name} → Basınçlandırma Fanları`);
      }
    }
  }

  // Sığınak ürünlerini taşı
  const { _data: siginakProducts } = await supabase
    .from('products')
    .select('id, name')
    .ilike('name', '%sığınak%');

  if (siginakProducts && siginakProducts.length > 0) {
    const { _data: siginakCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('name', 'Sığınak Havalandırma Fanları')
      .single();

    if (siginakCategory) {
      for (const product of siginakProducts) {
        await supabase
          .from('products')
          .update({ category_id: siginakCategory.id })
          .eq('id', product.id);
        console.warn(`📦 ${product.name} → Sığınak Havalandırma Fanları`);
      }
    }
  }

  // Nicotra Gebhardt ürünlerini taşı
  const { _data: nicotraProducts } = await supabase
    .from('products')
    .select('id, name')
    .eq('brand', 'Nicotra Gebhardt');

  if (nicotraProducts && nicotraProducts.length > 0) {
    const { _data: nicotraCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('name', 'Nicotra Gebhardt Fanlar')
      .single();

    if (nicotraCategory) {
      for (const product of nicotraProducts) {
        await supabase
          .from('products')
          .update({ category_id: nicotraCategory.id })
          .eq('id', product.id);
        console.warn(`📦 ${product.name} → Nicotra Gebhardt Fanlar`);
      }
    }
  }
}

async function showFinalCategories() {
  console.warn('\n📂 Final kategori yapısı (resminize uygun):');
  
  const { _data: categories } = await supabase
    .from('categories')
    .select('id, name, parent_id')
    .eq('parent_id', '4bc54533-7323-4eac-a02d-4498ffde00eb')
    .order('name');

  if (categories) {
    console.warn('\n📁 Fanlar');
    categories.forEach(cat => {
      console.warn(`  └── ${cat.name}`);
    });

    // ATEX alt kategorisini de göster
    const { _data: atexCategory } = await supabase
      .from('categories')
      .select('name')
      .eq('parent_id', 'db965633-c967-4193-8617-e1a7651997ec')
      .single();

    if (atexCategory) {
      console.warn(`      └── ${atexCategory.name}`);
    }
  }
}

async function main() {
  console.warn('🚀 Kategori yapısını resminize uygun hale getiriyorum...');

  try {
    // 1. Mevcut kategori isimlerini güncelle
    const renamed = await renameExistingCategories();

    // 2. Yeni kategoriler oluştur
    const created = await createNewCategories();

    // 3. ATEX kategori ismini güncelle
    await updateATEXCategoryName();

    // 4. Ürünleri uygun kategorilere dağıt
    await redistributeProducts();

    // 5. Final yapıyı göster
    await showFinalCategories();

    console.warn(`\n📊 İşlem Özeti:`);
    console.warn(`✅ Güncellenen kategori: ${renamed}`);
    console.warn(`✅ Oluşturulan kategori: ${created}`);
    
    console.warn(`\n🎉 Kategori yapısı artık resminizde gösterdiğiniz ile aynı!`);
    console.warn(`💡 Tüm fan kategorileri doğru isimlerle "Fanlar" ana kategorisinin altında.`);

  } catch (error) {
    console.error('💥 İşlem hatası:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
