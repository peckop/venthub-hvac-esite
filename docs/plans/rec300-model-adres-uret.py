"""REC-300 · 442 model adresinin (slug_tr / slug_en) Design kuralıyla üretimi — SALT OKUMA.

Kural: docs/plans/rec300-design-slug-uretim-kurali-2026-09-11.md (§3 şablon, §3 kurallar 1-8).
Girdi: canlı DB (ziyaretçi anahtarıyla REST, yalnız okuma) → veri.json (bu betiğin yanındaki
`--veri` yolu). Çıktı: CSV (sku · bugünkü slug · slug_tr · slug_en · adres_tr · adres_en · not).
Veritabanına HİÇBİR ŞEY yazmaz. Yazım ayrı veri migration'ıyla (kural 13) ve Recep'in tek
bakışından sonra yapılır.

Kararlar (kaynaklarıyla):
- Dal: K17 + EK sonrası dal (plug / hücreli / iki hava perdesi dalı) — ürün tipi kelimesi yeni daldan.
- Marka: K17 — KENTALFAN, ENKELFAN, NIMAX, NIMUS aileleri Casals.
- Kural 2 (model adı bir değeri zaten taşıyorsa tekrar yazılmaz) örneklerden ÖNCE gelir: Design
  örnek #2 `lineo-250-…-250mm` bu kuralla çelişiyor; kural uygulandı, fark not kolonunda.
- Değer yoksa yazılmaz (K7). 73 ürünün teknik özelliği boş → ad marka + model + tip.
"""
import argparse, csv, json, re, unicodedata, pathlib

TR_HARF = str.maketrans({'ğ': 'g', 'Ğ': 'g', 'ü': 'u', 'Ü': 'u', 'ş': 's', 'Ş': 's', 'ı': 'i', 'İ': 'i',
                         'ö': 'o', 'Ö': 'o', 'ç': 'c', 'Ç': 'c', '°': ''})

# K17 + EK: aile → yeni dal (kategori-agaci-sql-hazirligi §3.3)
YENI_DAL = {
    'b4ad9135-206a-40bb-b133-a550b7838db2': 'plug-fans', '4b81f44f-bb67-4ac7-8bac-b7f3f6e9e733': 'plug-fans',
    '196d7854-5b06-4870-96ed-55ec742c880b': 'cabinet-fans', '362cd0ae-9352-4626-a8fc-978dafd3052b': 'cabinet-fans',
    'b5c120f1-6416-49a2-9de2-dee732204680': 'ambient-air-curtains',
    '08e5834b-7935-4ff0-970e-3c2ba8149284': 'electric-heated-air-curtains',
}
# K17: Casals aileleri
CASALS = {'b4ad9135-206a-40bb-b133-a550b7838db2', '4b81f44f-bb67-4ac7-8bac-b7f3f6e9e733',
          '25dfd5ad-4378-47f7-8e3e-974a9819294c', 'ced432da-9b30-4407-a224-6b2ff9306ad7'}

# dal → (TR tip, EN tip, değer sırası, addan silinecek tip kelimeleri)
FAN_RAD = ['debi', 'basinc', 'cap']
FAN_KAN = ['cap', 'basinc', 'debi']
TIP = {
    'centrifugal-fans': ('radyal fan', 'centrifugal fan', FAN_RAD, []),
    'plug-fans': ('plug fan', 'plug fan', FAN_RAD, []),
    'cabinet-fans': ('hucreli aspirator', 'cabinet fan', FAN_RAD, []),
    # Dal saf değil (SEAT + JET + STORM, plan v1 §2.5): gövde tipi iddia edilmez, yalnız korozyon.
    'acid-resistant-fans': ('korozyon dayanimli fan', 'corrosion resistant fan', FAN_RAD, []),
    'duct-fans': ('kanal tipi fan', 'inline duct fan', FAN_KAN, []),
    # Tip kelimeleri rakip taramasıyla düzeltildi: rec300-rakip-slug-taramasi-2026-09-22.md
    'bathroom-toilet-fans': ('banyo aspiratoru', 'bathroom fan', FAN_KAN, []),
    'roof-fans': ('cati tipi fan', 'roof fan', FAN_KAN, []),
    'axial-industrial-fans': ('aksiyel fan', 'axial fan', ['cap', 'debi', 'basinc'], []),
    'smoke-exhaust-fans': ('duman egzoz fani', 'smoke exhaust fan', ['cap', 'debi'], []),
    'industrial-ceiling-fans': ('endustriyel tavan vantilatoru', 'industrial ceiling fan', ['cap', 'debi'], []),
    'chimney-fans': ('baca fani', 'chimney fan', ['cap', 'debi'], ['somine ve baca fani']),
    'frequency-converters': ('frekans invertoru', 'frequency converter', ['guc_kw', 'gerilim', 'faz'], ['frekans konvertoru']),
    'speed-controllers': ('hiz anahtari', 'speed controller', [], ['hiz anahtari']),
    'ambient-air-curtains': ('isiticisiz hava perdesi', 'ambient air curtain', ['uzunluk'], []),
    'electric-heated-air-curtains': ('elektrikli isiticili hava perdesi', 'electric heated air curtain', ['uzunluk'], []),
    'air-curtains': ('hava perdesi', 'air curtain', ['uzunluk'], []),
    'ducted-central-hrv': ('isi geri kazanim cihazi', 'heat recovery unit', ['debi'], ['isi geri kazanim cihazi']),
    'single-room-hrv': ('oda tipi isi geri kazanim cihazi', 'single room heat recovery unit', ['debi'], []),
    'dehumidifiers': ('nem alma cihazi', 'dehumidifier', ['nem', 'guc_kw'], []),
    'electric-duct-heaters': ('kanal tipi elektrikli isitici', 'electric duct heater', ['isitma_kw', 'debi'], ['elektrikli isitici']),
    'water-coil-duct-heaters': ('kanal tipi sulu isitici batarya', 'duct water coil', ['isitma_kw', 'debi'], ['sulu batarya', 'kanal tipi']),
    'spare-parts-sensors': ('yedek parca', 'spare part', [], []),
    'shelter-ventilation': ('siginak havalandirma unitesi', 'shelter ventilation unit', ['debi', 'guc_w'], []),
}
# Uzunluk aşılınca sıfatlar düşer ama tip YARIM kelimeye inmez ("perdesi", "cihazi" olmaz):
# dal başına anlamlı kısa ad. Verilmeyen dal için tip olduğu gibi kalır.
KISA = {
    'acid-resistant-fans': ('korozyon dayanimli fan', 'corrosion resistant fan'),
    'bathroom-toilet-fans': ('banyo aspiratoru', 'bathroom fan'),
    'smoke-exhaust-fans': ('duman egzoz fani', 'smoke exhaust fan'),
    'industrial-ceiling-fans': ('tavan vantilatoru', 'ceiling fan'),
    'ambient-air-curtains': ('hava perdesi', 'air curtain'),
    'electric-heated-air-curtains': ('hava perdesi', 'air curtain'),
    'ducted-central-hrv': ('isi geri kazanim', 'heat recovery'),
    'single-room-hrv': ('isi geri kazanim', 'heat recovery'),
    'shelter-ventilation': ('siginak unitesi', 'shelter unit'),
    'electric-duct-heaters': ('elektrikli isitici', 'duct heater'),
    'water-coil-duct-heaters': ('sulu batarya', 'water coil'),
    'centrifugal-fans': ('radyal fan', 'centrifugal fan'),
    'cabinet-fans': ('hucreli aspirator', 'cabinet fan'),
    'duct-fans': ('kanal fani', 'duct fan'),
}
MARKA_KISA = {'vortice': 'vortice', 'seat': 'seat', 'avens': 'avens', 'danfoss': 'danfoss',
              'nicotra-gebhardt': 'nicotra-gebhardt', 'casals': 'casals'}


def slugla(s):
    s = (s or '').translate(TR_HARF)
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    s = s.replace('&', ' ve ').replace('%', ' yuzde ').replace('m³/h', 'm3h').replace('m3/h', 'm3h')
    s = re.sub(r'(\d),(\d)', r'\1-\2', s)          # ondalık virgül → tire (1,1 kw → 1-1kw kuralı)
    s = re.sub(r'(\d)\.(\d)', r'\1-\2', s)
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return re.sub(r'-+', '-', s).strip('-')


def ilk(sp, *anahtar):
    for k in anahtar:
        v = sp.get(k)
        if isinstance(v, (int, float)) and v > 0:
            return v
        if isinstance(v, str) and re.fullmatch(r'\d+([.,]\d+)?', v.strip()):
            return float(v.replace(',', '.'))
    return None


def kw(v):
    s = ('%.2f' % v).rstrip('0').rstrip('.')
    return s.replace('.', '-') + 'kw'


def deger(ad, sp):
    if ad == 'debi':
        v = ilk(sp, 'max_delivery_m3h', 'nominal_delivery_m3h'); return v and f'{round(v)}m3h'
    if ad == 'basinc':
        v = ilk(sp, 'max_static_pressure_pa', 'nominal_static_pressure_pa', 'max_total_pressure_pa'); return v and f'{round(v)}pa'
    if ad == 'cap':
        v = ilk(sp, 'diameter_mm', 'blade_diameter_mm'); return v and f'{round(v)}mm'
    if ad == 'uzunluk':
        v = ilk(sp, 'length_mm', 'width_mm'); return v and f'{round(v)}mm'
    if ad == 'guc_w':
        v = ilk(sp, 'max_absorbed_power_w', 'rated_power_w'); return v and f'{round(v)}w'
    if ad == 'guc_kw':
        v = ilk(sp, 'rated_power_w', 'max_absorbed_power_w'); return v and kw(v / 1000)
    if ad == 'isitma_kw':
        v = ilk(sp, 'heating_power_w'); return v and kw(v / 1000)
    if ad == 'gerilim':
        v = ilk(sp, 'max_voltage_v', 'voltage_v'); return v and f'{round(v)}v'
    if ad == 'faz':
        v = ilk(sp, 'phase'); return v and f'{round(v)}faz'
    if ad == 'nem':
        v = ilk(sp, 'humidity_removed_l_24h'); return v and f'{round(v)}l-gun'
    return None


def model_parcasi(ad, marka, silinecek):
    s = re.split(r'\s+·\s+', ad or '')[0]                     # "JET 20 · 1400 d/dk · …" → "JET 20"
    m = slugla(s)
    for w in silinecek:
        m = re.sub(r'(^|-)' + re.escape(slugla(w)) + r'(-|$)', '-', m).strip('-')
    for b in {marka, marka.split('-')[0]}:                   # marka adın başındaysa tekrar etme
        if m == b or m.startswith(b + '-'):
            m = m[len(b):].strip('-')
    m = re.sub(r'(\d)-(kw|w|v|a|mm)(?=-|$)', r'\1\2', m)     # "6-kw" → "6kw" (kural 5: birim bitişik)
    return re.sub(r'-+', '-', m).strip('-')


def model_tasiyor(model, dv):
    """Kural 2: model adı değeri zaten taşıyor mu (birimli ya da çıplak sayı)."""
    m = '-' + model + '-'
    if '-' + dv + '-' in m:
        return True
    sayi = re.match(r'[0-9-]+', dv).group(0).strip('-')
    birim = dv[len(re.match(r'[0-9-]+', dv).group(0)):]
    # Aynı birimden bir değer adda zaten varsa (ör. "fc-51-230v" varken 240v; "1000-230w" varken 230w)
    # ikinci değer yazılmaz: iki farklı sayı yan yana okuyanı yanıltır.
    if birim in ('v', 'w', 'kw', 'faz') and re.search(r'-[0-9-]+' + birim + '-', m):
        return True
    return '-' + sayi + '-' in m


def uret(marka, model, tip, kisa, degerler, notlar):
    secili = []
    for dv in degerler:
        if not dv:
            continue
        if model_tasiyor(model, dv):
            notlar.add('kural2')
            continue
        secili.append(dv)
        if len(secili) == 3:
            break
    tip_s, kisa_s = slugla(tip), slugla(kisa or tip)

    def birlestir(ds, t):
        return '-'.join(x for x in [marka, model, t, *ds] if x)

    def asti(s):
        return len(s) > 70 or len(s.split('-')) > 10

    s = birlestir(secili, tip_s)
    while asti(s) and secili:                              # sıra: 3. değer → 2. değer → …
        secili.pop(); notlar.add('deger-dustu')
        s = birlestir(secili, tip_s)
    # … → tipin sıfatları. SAPMA (2026-09-22): tip yalnız 70 KARAKTER aşılınca kısalır; 10 kelime
    # sınırı için kısalmaz — rakip taraması aranan kelimenin tam tip olduğunu gösterdi
    # ("elektrikli ısıtıcılı hava perdesi", "oda tipi ısı geri kazanım"); kısaltmak onu siliyordu.
    if len(s) > 70 and kisa_s != tip_s:
        s = birlestir(secili, kisa_s); notlar.add('tip-kisaldi')
    # Model adı kısaltılmaz (Recep 11-09: "kısaltma istemiyorum"); aşım işaretlenir, kırpılmaz.
    if len(s) > 70:
        notlar.add('UZUN>70')
    if len(s.split('-')) > 10:
        notlar.add('KELIME>10')
    if re.search(r'(^|-)p(-|$)', s):
        notlar.add('P-KELIMESI')
    return s


def eski_config_sluglari(next_config):
    """next.config.mjs'teki elle yazılmış ürün yönlendirmeleri: eski slug → sku."""
    t = pathlib.Path(next_config).read_text(encoding='utf-8')
    return {m.group(2): m.group(1) for m in re.finditer(
        r"source:\s*'/:lang\(tr\|en\)/products/([a-z0-9-]+)'[\s\S]{0,300}?\?sku=([A-Z0-9-]+)'", t)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--veri', required=True)
    ap.add_argument('--aile-seo', required=True, help='Design-Katalog aile-foyu seo_slug eşlemesi (json)')
    ap.add_argument('--next-config', required=True)
    ap.add_argument('--cikti', required=True)
    a = ap.parse_args()
    d = json.loads(pathlib.Path(a.veri).read_text(encoding='utf-8'))
    aile_seo = json.loads(pathlib.Path(a.aile_seo).read_text(encoding='utf-8'))
    eski = eski_config_sluglari(a.next_config)
    cat = {c['id']: c for c in d['categories']}
    fam = {f['id']: f for f in d['families']}
    brands = {b['id']: b for b in d['brands']}
    satirlar = []
    for p in sorted(d['products'], key=lambda x: x['sku']):
        f = fam.get(p['family_id']) or {}
        notlar = set()
        dal = YENI_DAL.get(p['family_id']) or (cat.get(p['subcategory_id'] or p['category_id']) or {}).get('slug')
        marka = 'casals' if p['family_id'] in CASALS else (brands.get(f.get('brand_id')) or {}).get('slug') or slugla(p['brand'])
        marka = MARKA_KISA.get(marka, marka)
        tip_tr, tip_en, sira, sil = TIP.get(dal, ('', '', [], []))
        if not tip_tr:
            notlar.add('DAL-YOK')
        sp = p['technical_specs'] or {}
        if not sp:
            notlar.add('specs-bos')
        model = model_parcasi(p['name'], marka, sil)
        if not model:
            notlar.add('model-bos')
        vals = [deger(x, sp) for x in sira]
        k_tr, k_en = KISA.get(dal, (tip_tr, tip_en))
        slug_tr = uret(marka, model, tip_tr, k_tr, vals, notlar)
        slug_en = uret(marka, model, tip_en, k_en, vals, set())
        sku = p['sku'].lower()
        # Ayırt edici değer önce ÜRÜN ADINDAN (müşterinin gördüğü değer): SEAT adları
        # "· 1400 d/dk · 0,06 kW · 380V" taşıyor, teknik özellik ise ölçülen tüketimi (0,09 kW) ve
        # 400 V'u tutuyor — adreste addakinden farklı sayı durmaz. Adda yoksa teknik özellik.
        parca = ' '.join(re.split(r'\s+·\s+', p['name'] or '')[1:])
        ad_v = re.search(r'(\d+)\s*V\b', parca)
        ad_kw = re.search(r'(\d+(?:,\d+)?)\s*kW', parca)
        ad_dk = re.search(r'(\d+)\s*d/dk', parca)
        ayirt = [(ad_v and f'{ad_v.group(1)}v') or deger('gerilim', sp),
                 (ad_kw and kw(float(ad_kw.group(1).replace(',', '.')))) or deger('guc_kw', sp),
                 deger('faz', sp),
                 (ad_dk and f'{ad_dk.group(1)}dk') or (lambda v: v and f'{round(v)}dk')(ilk(sp, 'rpm_max'))]
        seo_aile = aile_seo.get(f.get('slug', ''), '')
        satirlar.append({
            'sku': p['sku'], 'ad': p['name'], 'dal': dal, 'marka': marka,
            'aile_bugun': f.get('slug', ''), 'aile_yeni': seo_aile,
            'slug_bugun': p['slug'],
            'eski_ek_slug': eski.get(p['sku'], ''),
            'slug_tr': slug_tr, 'slug_en': slug_en,
            'adres_tr': f'/tr/urun/{slug_tr}-p-{sku}', 'adres_en': f'/en/products/{slug_en}-p-{sku}',
            'uzunluk_tr': len(slug_tr), 'not': ' '.join(sorted(notlar)), '_ayirt': ayirt,
        })
    # Aynı slug metni iki üründe: adres SKU ile yine tekil, ama iki sayfa aynı metni taşımasın.
    # Ayırt edici değer (gerilim → faz → devir) sırayla eklenir; biterse işaretlenir.
    # Grup düzeyinde: üyeler arasında GERÇEKTEN farklı olan ilk ayırt edici değer bulunur ve
    # yalnız o eklenir. Hiçbiri farklı değilse metin olduğu gibi kalır (adres SKU ile yine tekil).
    for dil in ('tr', 'en'):
        for _tur in range(4):                              # alt gruplar kalabilir: tekrar dene
            gruplar = {}
            for r in satirlar:
                gruplar.setdefault(r['slug_' + dil], []).append(r)
            degisti = False
            for g in (g for g in gruplar.values() if len(g) > 1):
                for i in range(len(g[0]['_ayirt'])):
                    vals = [r['_ayirt'][i] for r in g]
                    if None not in vals and len(set(vals)) > 1 and not any(
                            model_tasiyor(r['slug_' + dil], v) and v in r['slug_' + dil] for r, v in zip(g, vals)):
                        for r, v in zip(g, vals):
                            r['slug_' + dil] += '-' + v
                            if dil == 'tr':
                                r['not'] = (r['not'] + ' ayirt-eklendi').strip()
                        degisti = True
                        break
            if not degisti:
                break
        for r in satirlar:
            if sum(1 for x in satirlar if x['slug_' + dil] == r['slug_' + dil]) > 1:
                r['not'] = (r['not'] + ' AYNI-METIN-' + dil.upper()).strip()
            if len(r['slug_' + dil]) > 70 and 'UZUN>70' not in r['not']:
                r['not'] = (r['not'] + ' UZUN>70').strip()
    for r in satirlar:
        sku = r['sku'].lower()
        r['adres_tr'] = f"/tr/urun/{r['slug_tr']}-p-{sku}"
        r['adres_en'] = f"/en/products/{r['slug_en']}-p-{sku}"
        r['uzunluk_tr'] = len(r['slug_tr'])
        del r['_ayirt']
    with open(a.cikti, 'w', encoding='utf-8-sig', newline='') as fh:
        w = csv.DictWriter(fh, fieldnames=list(satirlar[0].keys()), delimiter=';')
        w.writeheader(); w.writerows(satirlar)
    say = lambda k: sum(1 for r in satirlar if k in r['not'])
    print(len(satirlar), 'satir ·', 'UZUN>70', say('UZUN>70'), '· KELIME>10', say('KELIME>10'), '· AYNI-METIN', say('AYNI-METIN'), '· ayirt', say('ayirt-eklendi'),
          '· specs-bos', say('specs-bos'), '· model-bos', say('model-bos'), '· DAL-YOK', say('DAL-YOK'),
          '· kural2', say('kural2'), '· deger-dustu', say('deger-dustu'), '· eski_ek', sum(1 for r in satirlar if r['eski_ek_slug']))


if __name__ == '__main__':
    main()
