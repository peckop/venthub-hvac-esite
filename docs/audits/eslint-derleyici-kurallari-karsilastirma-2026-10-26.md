# ESLint: `eslint-plugin-react-compiler` (rc) ile `eslint-plugin-react-hooks` 7 derleyici kuralları — karşılaştırma (ALT-108)

Tarih: 2026-10-26 · Ölçen: ALTYAPI · Cetvel: `eslint.config.cjs`, `.githooks/README.md` · Kart: ALT-108 (OPS-181 toparlama turu).

## Soru

Depoda iki paket var: `eslint-plugin-react-compiler` 19.1.0-rc.2 (deneme sürümü, `eslint.config.cjs:5,71,77,208`)
ve `eslint-plugin-react-hooks` ^7.1.1 (yüklü). React Hooks 7 derleyici kurallarını kararlı olarak taşır; ikisi aynı
sonucu veriyorsa eski paket kaldırılır.

## Yöntem

Aynı 488 dosya (`src/components`, `src/views`, `src/hooks`, `src/app`, `src/contexts`, `src/providers`; test dosyaları hariç),
iki ayrı geçici yapılandırma, `typescript-eslint` ayrıştırıcısı, depo yapılandırmasındaki "kapalı" listesi UYGULANMADAN:

- **eski:** yalnız `react-compiler/react-compiler: error`.
- **yeni:** `react-hooks` 7.1.1 `recommended-latest` içindeki derleyici kuralları (`rules-of-hooks` ve `exhaustive-deps` HARİÇ),
  hepsi `error` (uyarı düzeyi farkı gizlemesin diye).

## Sonuç — EŞİT DEĞİL

| | eski (react-compiler rc) | yeni (react-hooks 7) |
|---|---|---|
| Etkilenen dosya | 4 | 75 |
| İhlal | 6 (+1 bilgi) | 114 |
| Ortak konum (dosya:satır) | 5 | 5 |

Yeni küme, eskinin bulduğu sınıfların hepsini kapsıyor (değiştirme/mutasyon: `immutability`; eskinin tek "yalnız eski" satırı
`OrbitalProductsShowcase.tsx:212` aynı dosyada yeni kuralın başka satırlarında yakalanıyor) ama **çok daha geniş**:
`set-state-in-effect` 81, `refs` 11, `purity` 7, `immutability` 7, `preserve-manual-memoization` 3, `static-components` 2,
`incompatible-library` 2.

Eski paketin 6 bulgusunun hepsi `eslint.config.cjs:208` ile "kapalı" listedeki 5 dosyada: depo yapılandırmasıyla eski paket bugün
**0 ihlal** veriyor. Yeni kuralları `error` açmak ise ~75 dosyada lint'i kırmızı yakar.

## Yan bulgu

`eslint-config-next` (15.5.27) kendi içinde `eslint-plugin-react-hooks` **5** getiriyor (`rules-of-hooks`, `exhaustive-deps`);
`package.json`'daki ^7.1.1 `eslint.config.cjs` tarafından HİÇ kullanılmıyor. Yani 7.1.1 yüklü ama etkisiz.

## Hüküm ve öneri

- Eski paket **kaldırılmadı** (eşit değil; kaldırmak sessizce kuralı gevşetmek olurdu: derleyici tanılarının bir kısmı o paketten geliyor).
- Öneri A (düşük risk): bugünkü durum kalır; `react-hooks` 7'yi etkinleştirmek ayrı kart olur ve `set-state-in-effect` gibi 81 satırlık
  sınıf önce `warn` + ratchet ile açılır (sayı artamaz), sonra dosya dosya `error`'a çekilir.
- Öneri B: `react-hooks` 7'yi `package.json`'dan çıkar (kullanılmıyor) — ama bu A'dan sonra; çıkarırsan yeni kurallar da gider.

Ham çıktı: oturum karalama dizininde (`sonuc-eski.json`, `sonuc-yeni.json`); değer taşımaz, yalnız dosya:satır ve kural adı.
