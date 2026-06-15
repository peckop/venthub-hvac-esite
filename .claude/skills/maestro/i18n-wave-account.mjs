export const meta = {
  name: 'i18n-wave-account',
  description: 'i18n extraction wave — account surface (6 files). Agents edit own component + return dict keys; orchestrator merges dicts.',
  phases: [{ title: 'Migrate' }, { title: 'Judge' }],
}

const PATTERN = `
KURALLAR (i18n çıkarımı — VentHub):
- Motor: useI18n() -> { lang, t }. Import yoksa ekle (relative '../../i18n/I18nProvider' veya '@/i18n/I18nProvider' — dosyadaki mevcut import stiline uy). Bileşen gövdesinde 't' yoksa: const { t } = useI18n() ekle (lang gerekirse: const { lang, t }).
- Her KULLANICIYA GÖRÜNEN Türkçe JSX literali -> t('<namespace>.<key>'). Sadece react/jsx-no-literals tetikleyen metinleri çevir.
- Mevcut anahtarı YENİDEN KULLAN: src/i18n/dictionaries/tr.ts oku; verilen namespace altında metin BİREBİR eşleşen anahtar varsa onu kullan (yeni anahtar üretme), reusedKeys'e yaz.
- Interpolasyon: dict değeri '{{var}}' kullanır; çağrı t('key', { var }). (ör. 'Sipariş {{code}}' + t('...', { code }))
- Rich-text (metin + satır-içi JSX: <span>/<Link>/ikon): satır-içi öğenin etrafında AYRI t() çağrılarına böl; kelime sırası HEM TR HEM EN için geçerli kalsın.
- İZİNLİ semboller (DOKUNMA, oldukları gibi kalır): - + : / % x X • · © VH TR EN ESC "PCI DSS" "3D Secure" "256-bit SSL" ve tırnaklar.
- İzinli-OLMAYAN sembol/emoji (ör. 👋, #, ₺ metin olarak) -> sözlüğe koy (yeni key). DİKKAT: template literal de (\`...\`) kuralca yakalanır, KULLANMA.
- Kullanıcıya görünmeyen string'lere DOKUNMA: className, key=, route kodları, console.*, aria değerleri kod/sembolse.
YASAKLAR:
- SADECE kendi dosyanı düzenle. tr.ts/en.ts/başka bileşen/barrel'a DOKUNMA.
- İnternet/context7/web YOK. as any / as unknown as / @ts-ignore / eslint-disable YOK.
- pnpm/tsc/eslint KOŞMA. Yapısal sonuç döndür.
DÖNÜŞ: keys = SADECE yeni eklediğin anahtarlar; tr = orijinal Türkçe metin birebir; en = sadık İngilizce çeviri (uydurma değil). Her key'in tr VE en'i dolu olmalı.
`

const TARGETS = [
  { file: 'src/views/account/AccountAddressesPage.tsx', ns: 'account.addresses' },
  { file: 'src/views/account/OrderDetailPage.tsx', ns: 'account.orderDetail' },
  { file: 'src/views/account/AccountShipmentsPage.tsx', ns: 'account.shipments' },
  { file: 'src/views/account/AccountInvoicesPage.tsx', ns: 'account.invoices' },
  { file: 'src/views/account/AccountSecurityPage.tsx', ns: 'account.security' },
  { file: 'src/views/account/AccountReturnsPage.tsx', ns: 'account.returns' },
]

const MIGRATE_SCHEMA = {
  type: 'object',
  required: ['file', 'namespace', 'keys', 'literalsReplaced'],
  properties: {
    file: { type: 'string' },
    namespace: { type: 'string', description: 'parent dict path, e.g. account.addresses' },
    keys: {
      type: 'object',
      description: 'YENİ anahtarlar: { keyName: { tr, en } }. keyName namespace altında kısa ad.',
      additionalProperties: {
        type: 'object', required: ['tr', 'en'],
        properties: { tr: { type: 'string' }, en: { type: 'string' } },
      },
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
    file: { type: 'string' },
    pass: { type: 'boolean' },
    parityOk: { type: 'boolean', description: 'her reported key tr+en dolu mu' },
    missingKeys: { type: 'array', items: { type: 'string' }, description: 't() ile kullanılıp ne reported keys ne tr.ts içinde olan key yolları' },
    issues: { type: 'array', items: { type: 'string' } },
  },
}

function migratePrompt(t) {
  return `Bu dosyayı uluslararasılaştır (i18n): ${t.file}
Hedef namespace: ${t.ns}
${PATTERN}
Adımlar: (1) ${t.file} dosyasını oku. (2) src/i18n/dictionaries/tr.ts içinde "${t.ns}" namespace'ini oku (mevcut anahtarları gör). (3) react/jsx-no-literals tetikleyen her kullanıcı-metnini t('${t.ns}.<key>') ile değiştir; mevcut eşleşeni yeniden kullan. (4) Yeni anahtarları keys olarak döndür (tr birebir orijinal, en sadık çeviri).`
}

function judgePrompt(t, mr) {
  return `i18n göçünü ÇÜRÜT (adversaryal). Dosya: ${t.file}, namespace: ${t.ns}.
Göç ajanının raporladığı YENİ anahtarlar: ${JSON.stringify(mr && mr.keys || {})}
Kontrol et (emin değilsen FAIL/issue yaz):
1. ${t.file} dosyasını oku. Dosyadaki HER t('...') çağrısının key'i ya raporlanan keys içinde ya da tr.ts'te (src/i18n/dictionaries/tr.ts oku) MEVCUT olmalı. Olmayanları missingKeys'e yaz (bunlar ekranda ham key gösterir = bug).
2. parityOk: her raporlanan key'in tr VE en'i dolu ve anlamlı mı.
3. Kullanıcıya görünen Türkçe literal KALDI mı (izinli semboller hariç)? Kaldıysa issue.
4. JSX bozulmuş mu (dengesiz tag, geçersiz ifade)? meaning korunmuş mu (tr = orijinal, en sadık)?
5. Sadece ${t.file} mı değişmiş; yasak desen var mı?
pass = (missingKeys boş) ve (parityOk) ve (kalan literal yok) ve (JSX sağlam).`
}

const results = await pipeline(
  TARGETS,
  (t) => agent(migratePrompt(t), { label: 'migrate:' + t.ns, phase: 'Migrate', schema: MIGRATE_SCHEMA }),
  (mr, t) => agent(judgePrompt(t, mr), { label: 'judge:' + t.ns, phase: 'Judge', schema: JUDGE_SCHEMA })
    .then(v => ({ target: t, migrate: mr, verdict: v })),
)

return results.filter(Boolean)
