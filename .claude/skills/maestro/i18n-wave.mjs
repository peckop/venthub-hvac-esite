export const meta = {
  name: 'i18n-wave',
  description: 'Generic i18n extraction wave. args = { surface, targets:[{file, ns}] }. Agents edit own component + return dict keys; orchestrator merges dicts centrally.',
  phases: [{ title: 'Migrate' }, { title: 'Judge' }],
}

const PATTERN = `
KURALLAR (i18n çıkarımı — VentHub):
- Motor: useI18n() -> { lang, t }. Import yoksa ekle (dosyadaki mevcut import stiline uy: relative '../../i18n/I18nProvider' veya '@/i18n/I18nProvider'). Bileşen gövdesinde 't' yoksa: const { t } = useI18n() ekle (lang gerekirse const { lang, t }).
- Her KULLANICIYA GÖRÜNEN Türkçe JSX literali -> t('<ns>.<key>'). Sadece react/jsx-no-literals tetikleyen metinleri çevir. YENİ anahtarları verilen namespace altında oluştur.
- YENİ anahtar adı TEK PARÇA (flat) olsun: t('<ns>.pageTitle') gibi — '<ns>' sub-namespace KÖKÜNE düz ekle. 'form.x' / 'results.x' gibi NOKTALI alt-yol AÇMA (merge'i bozar). Mevcut nested bir anahtarı yeniden KULLANMAK serbest (reusedKeys'e yaz), ama YENİ anahtar daima düz.
- Mevcut anahtarı YENİDEN KULLAN: src/i18n/dictionaries/tr.ts oku; metin BİREBİR eşleşen anahtar varsa (bu yüzey altında) onu kullan, reusedKeys'e yaz, keys'e EKLEME.
- Interpolasyon: dict değeri '{{var}}'; çağrı t('key', { var }).
- Rich-text (metin + satır-içi JSX <span>/<Link>/ikon): satır-içi öğenin etrafında AYRI t() çağrılarına böl; kelime sırası HEM TR HEM EN için geçerli kalsın.
- İZİNLİ semboller (DOKUNMA): - + : / % x X • · © VH TR EN ESC "PCI DSS" "3D Secure" "256-bit SSL" ve tırnaklar.
- İzinli-OLMAYAN sembol/emoji/marka (ör. 👋, #, ₺, "DEMO", "Google") -> sözlüğe key olarak koy. DİKKAT: template literal (\`...\`) de kuralca yakalanır, KULLANMA.
- Kullanıcıya görünmeyen string'e DOKUNMA: className, key=, route kodu, console.*, kod-sembol aria.
YASAKLAR:
- SADECE kendi dosyanı düzenle. tr.ts/en.ts/başka bileşen/barrel'a DOKUNMA.
- İnternet/context7/web YOK. as any / as unknown as / @ts-ignore / eslint-disable YOK. pnpm/tsc/eslint KOŞMA.
DÖNÜŞ: keys = SADECE yeni eklediğin anahtarlar { keyName: { tr, en } } (keyName = ns altında kısa TEK-PARÇA ad, NOKTASIZ); tr = orijinal Türkçe birebir; en = sadık İngilizce. Her key'in tr VE en'i dolu.
`

const SURFACE = 'tail' // etiket; gerçek yüzey her hedefin ns'inden türetilir (çoklu-yüzey destekli)
const TARGETS = [
  // Wave E1 — tail metin dosyaları (mevcut top-level ns'lere map; navigation/authority/layout YOK → megamenu/pdp/header)
  { file: 'src/components/products/AddToProjectModal.tsx', ns: 'products.addToProject' },
  { file: 'src/components/navigation/CategoryHubOverlay.tsx', ns: 'megamenu.categoryHub' },
  { file: 'src/components/authority/ThreeDAuthority.tsx', ns: 'pdp.threeDAuthority' },
  { file: 'src/views/support/FAQPage.tsx', ns: 'support.contactCta' },
  { file: 'src/views/OrdersPage.tsx', ns: 'orders.page' },
  { file: 'src/components/products/BlueprintCanvas.tsx', ns: 'products.blueprint' },
  { file: 'src/components/MegaMenu.tsx', ns: 'megamenu.classic' },
  { file: 'src/components/layout/MainLayout.tsx', ns: 'header.adminBar' },
  { file: 'src/views/knowledge/TopicPage.tsx', ns: 'knowledge.topic' },
  { file: 'src/views/BrandsPage.tsx', ns: 'brands.page' },
  { file: 'src/views/BrandDetailPage.tsx', ns: 'brands.detail' },
  { file: 'src/components/navigation/EliteMegaMenu.tsx', ns: 'megamenu.elite' },
  { file: 'src/components/authority/AuthorityRenderer.tsx', ns: 'pdp.authorityRenderer' },
  { file: 'src/components/authority/VideoAuthority.tsx', ns: 'pdp.videoAuthority' },
  { file: 'src/components/SearchOverlay.tsx', ns: 'search.overlay' },
  { file: 'src/components/product/ProductSmartInference.tsx', ns: 'products.smartInference' },
  { file: 'src/components/products/Category3DIcon.tsx', ns: 'products.category3DIcon' },
  { file: 'src/components/products/OrbitalProductsShowcase.tsx', ns: 'products.orbital' },
  { file: 'src/components/navigation/CategoryCard3D.tsx', ns: 'products.categoryCard' },
]

const MIGRATE_SCHEMA = {
  type: 'object',
  required: ['file', 'namespace', 'keys', 'literalsReplaced'],
  properties: {
    file: { type: 'string' },
    namespace: { type: 'string' },
    keys: {
      type: 'object',
      additionalProperties: { type: 'object', required: ['tr', 'en'], properties: { tr: { type: 'string' }, en: { type: 'string' } } },
    },
    reusedKeys: { type: 'array', items: { type: 'string' } },
    literalsReplaced: { type: 'number' },
    notes: { type: 'string' },
  },
}
const JUDGE_SCHEMA = {
  type: 'object',
  required: ['file', 'pass', 'issues', 'parityOk', 'missingKeys'],
  properties: {
    file: { type: 'string' }, pass: { type: 'boolean' }, parityOk: { type: 'boolean' },
    missingKeys: { type: 'array', items: { type: 'string' } }, issues: { type: 'array', items: { type: 'string' } },
  },
}

function migratePrompt(t) {
  const surface = t.ns.split('.')[0]
  return `Bu dosyayı uluslararasılaştır (i18n): ${t.file}
Yeni anahtarların namespace'i: ${t.ns}  (üst-yüzey: ${surface})
${PATTERN}
Adımlar: (1) ${t.file} oku. (2) src/i18n/dictionaries/tr.ts içinde "${surface}" üst-yüzeyini oku (mevcut anahtarları gör, birebir eşleşeni yeniden kullan; reusedKeys'e yaz). (3) react/jsx-no-literals tetikleyen her kullanıcı-metnini t() ile değiştir; YENİ anahtarları "${t.ns}.<key>" altında DÜZ topla. (4) keys döndür.`
}
function judgePrompt(t, mr) {
  return `i18n göçünü ÇÜRÜT (adversaryal). Dosya: ${t.file}, namespace: ${t.ns}.
Göç ajanının raporladığı YENİ anahtarlar: ${JSON.stringify((mr && mr.keys) || {})}
(1) ${t.file} oku. Dosyadaki HER t('...') key'i ya raporlanan keys'te ya da tr.ts'te (oku) MEVCUT olmalı. Olmayanı missingKeys'e (ham key gösterir = bug). (2) parityOk: her raporlanan key tr+en dolu mu. (3) Kullanıcıya görünen Türkçe literal kaldı mı (izinli sembol hariç)? (4) JSX sağlam mı, anlam korunmuş mu (tr=orijinal, en sadık)? (5) Sadece ${t.file} mı değişti, yasak desen var mı?
pass = missingKeys boş && parityOk && kalan literal yok && JSX sağlam.`
}

const results = await pipeline(
  TARGETS,
  (t) => agent(migratePrompt(t), { label: 'migrate:' + t.ns, phase: 'Migrate', schema: MIGRATE_SCHEMA }),
  (mr, t) => agent(judgePrompt(t, mr), { label: 'judge:' + t.ns, phase: 'Judge', schema: JUDGE_SCHEMA })
    .then(v => ({ target: t, migrate: mr, verdict: v })),
)
return results.filter(Boolean)
