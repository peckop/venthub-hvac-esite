import { DollarSign,Leaf, RotateCcw, Snowflake, ThermometerSun, TrendingUp, Users } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import React, { Suspense, useCallback, useEffect,useMemo, useState } from 'react'

import {
  CalculatorLayout,
  InputField,
  RadioGroup,
  Recommendations,
  ResultCard,
  ResultGrid} from '../../components/calculators'
import UrlParametreOkuyucu from '../../components/calculators/UrlParametreOkuyucu'
import { useCalculatorUsage } from '../../hooks/useCalculatorUsage'
import { useI18n } from '../../i18n/I18nProvider'
import {
  type BuildingType,
  calculateHRV,
  type ClimateZone,
  type RecoveryType} from '../../lib/hvacCalculations'

const HRVCalcPage: React.FC = () => {
  const { t } = useI18n()
  const router = useRouter()
  const pathname = usePathname()

  // Dynamic Options
  const systemOptions = useMemo(() => [
    {
      value: 'hrv',
      label: t('calculators.hrv.form.hrv'),
      description: t('calculators.hrv.form.hrvDesc'),
      icon: <ThermometerSun size={24} />
    },
    {
      value: 'erv',
      label: t('calculators.hrv.form.erv'),
      description: t('calculators.hrv.form.ervDesc'),
      icon: <Snowflake size={24} />
    }
  ], [t])

  const buildingOptions = useMemo(() => [
    { value: 'residential', label: t('common.homeLabel'), description: 'Domestic' },
    { value: 'office', label: t('calculators.hrv.form.office'), description: 'Workplace' },
    { value: 'commercial', label: t('calculators.hrv.form.commercial'), description: 'Retail/Mall' }
  ], [t])

  const climateOptions = useMemo(() => [
    { value: 'cold', label: t('calculators.hrv.form.cold'), description: 'North/Mountain' },
    { value: 'temperate', label: t('calculators.hrv.form.temperate'), description: 'Central' },
    { value: 'hot', label: t('calculators.hrv.form.hot'), description: 'South/Coast' }
  ], [t])

  /**
   * FORM DURUMU VARSAYILANLA BAŞLAR — URL parametreleri BAĞLANDIKTAN SONRA uygulanır
   * (REC-150 PR-0, 2026-09-05).
   *
   * ESKİDEN: `useState(searchParams?.get('...'))` ile render sırasında okunuyordu. O okuma
   * bileşeni CSR bailout'una sokuyordu ve sayfa SUNUCUDA HİÇ RENDER EDİLMİYORDU — canlıda
   * ölçüldü: bu sayfa arama motoruna 0 kelime gövde ve jenerik açıklama veriyordu.
   *
   * ŞİMDİ: varsayılanlar sunucuda çizilir; `UrlParametreOkuyucu` bağlandıktan sonra bir kez
   * okuyup değerleri uygular. "Hesabımı paylaş" yeteneği KORUNUR — yalnız okumanın ZAMANI
   * değişti, kendisi değil.
   */
  const [recoveryType, setRecoveryType] = useState<RecoveryType>('hrv')
  const [buildingType, setBuildingType] = useState<BuildingType>('office')
  const [climateZone, setClimateZone] = useState<ClimateZone>('temperate')
  const [area, setArea] = useState('100')
  const [occupancy, setOccupancy] = useState('10')
  const [operatingHours, setOperatingHours] = useState('10')
  const [sensibleEfficiency, setSensibleEfficiency] = useState('75')
  const [latentEfficiency, setLatentEfficiency] = useState('65')
  const [electricityCost, setElectricityCost] = useState('3.5')

  /**
   * ⚠GERİ-YAZMA KİLİDİ — sessiz veri kaybını önler.
   *
   * URL sync effect'i, gelen parametreler OKUNMADAN çalışırsa varsayılanları URL'e yazar ve
   * paylaşılan bağlantıyı okumadan SİLER. Kullanıcı linke tıklar, adres çubuğu bir anda
   * boşalır, hesap varsayılanlara döner — ve hiçbir test bunu görmez.
   * Bu bayrak, okuma bitmeden yazmayı yasaklar.
   */
  const [parametrelerOkundu, setParametrelerOkundu] = useState(false)

  const urlParametreleriniUygula = useCallback((p: URLSearchParams) => {
    const kur = <T,>(anahtar: string, ata: (deger: T) => void) => {
      const deger = p.get(anahtar)
      if (deger) ata(deger as T)
    }
    kur<RecoveryType>('recoveryType', setRecoveryType)
    kur<BuildingType>('buildingType', setBuildingType)
    kur<ClimateZone>('climateZone', setClimateZone)
    kur<string>('area', setArea)
    kur<string>('occupancy', setOccupancy)
    kur<string>('operatingHours', setOperatingHours)
    kur<string>('sensibleEfficiency', setSensibleEfficiency)
    kur<string>('latentEfficiency', setLatentEfficiency)
    kur<string>('electricityCost', setElectricityCost)
    setParametrelerOkundu(true)
  }, [])

  // T021-VH · `calculator_used`. Taban çizgisi mount anıdır — paylaşılmış bir bağlantıyı
  // (?area=120) açıp hiçbir şeye dokunmayan ziyaretçi olay üretmez. Bkz. hook.
  useCalculatorUsage('hrv', {
    recoveryType,
    buildingType,
    climateZone,
    area,
    occupancy,
    operatingHours,
    sensibleEfficiency,
    latentEfficiency,
    electricityCost,
  })

  // URL Sync Effect
  useEffect(() => {
    if (typeof window === 'undefined') return
    // ⚠GELEN BAĞLANTI OKUNMADAN YAZMA (REC-150 PR-0): bu koruma olmasa, bileşen bağlandığı
    // anda varsayılanlar URL'e yazılır ve paylaşılan bağlantı OKUNMADAN silinirdi.
    // Kullanıcı linke tıklar, adres çubuğu boşalır, hesap varsayılana döner.
    if (!parametrelerOkundu) return
    const params = new URLSearchParams()
    if (recoveryType !== 'hrv') params.set('recoveryType', recoveryType)
    if (buildingType !== 'office') params.set('buildingType', buildingType)
    if (climateZone !== 'temperate') params.set('climateZone', climateZone)
    if (area !== '100') params.set('area', area)
    if (occupancy !== '10') params.set('occupancy', occupancy)
    if (operatingHours !== '10') params.set('operatingHours', operatingHours)
    if (sensibleEfficiency !== '75') params.set('sensibleEfficiency', sensibleEfficiency)
    if (latentEfficiency !== '65') params.set('latentEfficiency', latentEfficiency)
    if (electricityCost !== '3.5') params.set('electricityCost', electricityCost)

    const query = params.toString()
    router.replace(`${pathname}${query ? `?${query}` : ''}` as import('next').Route, { scroll: false })
  }, [
    parametrelerOkundu,
    recoveryType, buildingType, climateZone, area, occupancy,
    operatingHours, sensibleEfficiency, latentEfficiency, electricityCost,
    pathname, router
  ])

  // Real-time calculation
  const result = useMemo(() => {
    const areaVal = parseFloat(area) || 0
    const occVal = parseFloat(occupancy) || 0
    const hoursVal = parseFloat(operatingHours) || 0
    const sensEff = parseFloat(sensibleEfficiency) || 0
    const latEff = parseFloat(latentEfficiency) || 0
    const elecCost = parseFloat(electricityCost) || 0

    if (areaVal <= 0 || occVal < 0 || hoursVal <= 0 || sensEff <= 0) return null

    return calculateHRV({
      recoveryType,
      buildingType,
      climateZone,
      area: areaVal,
      occupancy: occVal,
      operatingHoursPerDay: hoursVal,
      sensibleEfficiency: sensEff,
      latentEfficiency: latEff,
      electricityCostPerKWh: elecCost
    })
  }, [recoveryType, buildingType, climateZone, area, occupancy, operatingHours, sensibleEfficiency, latentEfficiency, electricityCost])

  const reset = () => {
    setRecoveryType('hrv')
    setBuildingType('office')
    setClimateZone('temperate')
    setArea('100')
    setOccupancy('10')
    setOperatingHours('10')
    setSensibleEfficiency('75')
    setLatentEfficiency('65')
    setElectricityCost('3.5')
  }

  return (
    <CalculatorLayout
      title={t('calculators.hrv.title')}
      description={t('calculators.hrv.description')}
      icon={<Leaf size={32} />}
      infoText={t('calculators.hrv.infoText')}
    >
      {/* ⭐SUSPENSE SINIRI BURADA — sayfanın tamamında DEĞİL (REC-150 PR-0).
          Parametreyi okuyan tek uç bu bileşen; bailout yalnız onu kapsıyor ve o da
          hiçbir şey çizmiyor. Sayfanın geri kalanı sunucuda render edilmeye devam eder.
          Eskiden sınır `page.tsx`'te sayfanın TAMAMINI sarıyordu ve sonuç, bu sayfanın
          arama motoruna 0 kelime gövdeyle görünmesiydi (canlıda ölçüldü). */}
      <Suspense fallback={null}>
        <UrlParametreOkuyucu onOku={urlParametreleriniUygula} />
      </Suspense>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-light-gray shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-success-green/10 rounded-lg">
                <Leaf className="text-success-green" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-industrial-gray">{t('calculators.hrv.form.type')}</h2>
                <p className="text-sm text-steel-gray">{t('calculators.airCurtain.form.applicationPurpose')}</p>
              </div>
            </div>

            <RadioGroup
              label={t('calculators.hrv.form.type')}
              value={recoveryType}
              onChange={(v) => setRecoveryType(v as RecoveryType)}
              options={systemOptions}
              columns={2}
            />

            <div className="grid grid-cols-2 gap-4 mt-4">
              <InputField
                label={t('calculators.hrv.form.sensibleEfficiency')}
                value={sensibleEfficiency}
                onChange={setSensibleEfficiency}
                unit="%"
                min={40}
                max={95}
                step={1}
              />
              {recoveryType === 'erv' && (
                <InputField
                  label={t('calculators.hrv.form.latentEfficiency')}
                  value={latentEfficiency}
                  onChange={setLatentEfficiency}
                  unit="%"
                  min={30}
                  max={85}
                  step={1}
                />
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-light-gray shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-navy/10 rounded-lg">
                <Users className="text-primary-navy" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-industrial-gray">{t('calculators.hrv.form.usage')}</h2>
                <p className="text-sm text-steel-gray">{t('calculators.airCurtain.steps.dimensionsDesc')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <RadioGroup
                label={t('calculators.hrv.form.usage')}
                value={buildingType}
                onChange={(v) => setBuildingType(v as BuildingType)}
                options={buildingOptions}
                columns={3}
              />

              <RadioGroup
                label={t('calculators.hrv.form.climate')}
                value={climateZone}
                onChange={(v) => setClimateZone(v as ClimateZone)}
                options={climateOptions}
                columns={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label={t('calculators.hrv.form.area')}
                  value={area}
                  onChange={setArea}
                  unit="m²"
                  min={10}
                  max={10000}
                  step={10}
                />
                <InputField
                  label={t('calculators.hrv.form.occupancy')}
                  value={occupancy}
                  onChange={setOccupancy}
                  unit="people"
                  min={0}
                  max={1000}
                  step={1}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label={t('calculators.hrv.form.workingHours')}
                  value={operatingHours}
                  onChange={setOperatingHours}
                  unit="h"
                  min={1}
                  max={24}
                  step={1}
                />
                <InputField
                  label={t('calculators.hrv.form.electricityPrice')}
                  value={electricityCost}
                  onChange={setElectricityCost}
                  unit="₺/kWh"
                  min={0.1}
                  max={20}
                  step={0.1}
                />
              </div>
            </div>

            <button
              onClick={reset}
              className="flex items-center gap-2 text-sm text-steel-gray hover:text-industrial-gray transition-colors mt-4"
              aria-label={t('common.reset')}
            >
              <RotateCcw size={16} />
              {t('common.reset')}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-light-gray shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-success-green/10 rounded-lg">
              <TrendingUp className="text-success-green" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-industrial-gray">{t('calculators.airCurtain.results.title')}</h2>
              <p className="text-sm text-steel-gray">{t('calculators.airCurtain.results.subtitle')}</p>
            </div>
          </div>

          {result ? (
            <>
              <div className="mb-6">
                <ResultGrid>
                  <ResultCard
                    title={t('calculators.hrv.results.heatingGain')}
                    value={result.heatingRecovery}
                    unit="W"
                    status="optimal"
                  />
                  <ResultCard
                    title={t('calculators.hrv.results.coolingGain')}
                    value={result.coolingRecovery}
                    unit="W"
                    status="optimal"
                  />
                </ResultGrid>
              </div>

              <div className="mb-6 p-4 bg-success-green/10 rounded-xl border border-success-green/20">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="text-success-green" size={24} />
                  <h3 className="font-semibold text-industrial-gray">{t('cart.itemTotal')}</h3>
                </div>
                <ResultGrid>
                  <ResultCard
                    title="Annual Energy Saving"
                    value={result.annualEnergySaving}
                    unit="kWh/y"
                    status="optimal"
                    large
                  />
                  <ResultCard
                    title="Annual Cost Saving"
                    value={result.annualCostSaving}
                    unit="₺/y"
                    status="optimal"
                    large
                  />
                </ResultGrid>
              </div>

              <div className="mb-6">
                <ResultGrid>
                  <ResultCard
                    title={t('calculators.hrv.results.co2Reduction')}
                    value={result.co2Reduction}
                    unit="kg/y"
                    status="optimal"
                    description={t('calculators.hrv.results.co2Desc')}
                  />
                  <ResultCard
                    title={t('calculators.hrv.results.payback')}
                    value={result.paybackPeriod}
                    unit="years"
                    status={result.paybackPeriod <= 3 ? 'optimal' : 'acceptable'}
                    description={t('calculators.hrv.results.paybackDesc')}
                  />
                </ResultGrid>
              </div>

              <Recommendations items={result.recommendations} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Leaf className="text-steel-gray" size={32} />
              </div>
              <p className="text-steel-gray">{t('common.notFound')}</p>
            </div>
          )}
        </div>
      </div>
    </CalculatorLayout>
  )
}

export default HRVCalcPage
