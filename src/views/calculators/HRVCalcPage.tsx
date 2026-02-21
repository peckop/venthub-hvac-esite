import React, { useState, useMemo } from 'react'
import { Leaf, Users, RotateCcw, TrendingUp, ThermometerSun, Snowflake, DollarSign } from 'lucide-react'
import {
  CalculatorLayout,
  ResultCard,
  ResultGrid,
  Recommendations,
  InputField,
  RadioGroup
} from '../../components/calculators'
import {
  calculateHRV,
  type RecoveryType,
  type BuildingType,
  type ClimateZone
} from '../../lib/hvacCalculations'

// Sistem tipi seçenekleri
const SYSTEM_OPTIONS = [
  {
    value: 'hrv',
    label: 'HRV',
    description: 'Sadece ısı geri kazanımı',
    icon: <ThermometerSun size={24} />
  },
  {
    value: 'erv',
    label: 'ERV',
    description: 'Isı + Nem geri kazanımı',
    icon: <Snowflake size={24} />
  }
]

// Bina tipi seçenekleri
const BUILDING_OPTIONS = [
  { value: 'residential', label: 'Konut', description: 'Ev, daire' },
  { value: 'office', label: 'Ofis', description: 'İş yeri, büro' },
  { value: 'commercial', label: 'Ticari', description: 'Mağaza, AVM' }
]

// İklim bölgesi seçenekleri
const CLIMATE_OPTIONS = [
  { value: 'cold', label: 'Soğuk', description: 'Kuzey, dağlık' },
  { value: 'temperate', label: 'Ilıman', description: 'Orta Anadolu' },
  { value: 'hot', label: 'Sıcak', description: 'Güney, kıyı' }
]

const HRVCalcPage: React.FC = () => {
  // Form durumu
  const [recoveryType, setRecoveryType] = useState<RecoveryType>('hrv')
  const [buildingType, setBuildingType] = useState<BuildingType>('office')
  const [climateZone, setClimateZone] = useState<ClimateZone>('temperate')
  const [area, setArea] = useState('100')
  const [occupancy, setOccupancy] = useState('10')
  const [operatingHours, setOperatingHours] = useState('10')
  const [sensibleEfficiency, setSensibleEfficiency] = useState('75')
  const [latentEfficiency, setLatentEfficiency] = useState('65')
  const [electricityCost, setElectricityCost] = useState('3.5')

  // Gerçek zamanlı hesaplama
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
      title="HRV/ERV Hesap Makinesi"
      description="Isı geri kazanım cihazı verimlilik ve enerji tasarruf hesabı"
      icon={<Leaf size={32} />}
      infoText="Isı geri kazanım cihazlarının (HRV) veya entalpik geri kazanım cihazlarının (ERV) yıllık tasarruf potansiyelini hesaplar."
    >
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Sol Panel - Girdiler */}
        <div className="space-y-6">
          {/* Sistem Tipi */}
          <div className="bg-white rounded-2xl border border-light-gray shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-success-green/10 rounded-lg">
                <Leaf className="text-success-green" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-industrial-gray">Sistem Tipi</h2>
                <p className="text-sm text-steel-gray">Geri kazanım türünü seçin</p>
              </div>
            </div>

            <RadioGroup
              label="Cihaz Tipi"
              value={recoveryType}
              onChange={(v) => setRecoveryType(v as RecoveryType)}
              options={SYSTEM_OPTIONS}
              columns={2}
            />

            <div className="grid grid-cols-2 gap-4 mt-4">
              <InputField
                label="Sensible Verimlilik"
                value={sensibleEfficiency}
                onChange={setSensibleEfficiency}
                unit="%"
                min={40}
                max={95}
                step={1}
                tooltip="Isı geri kazanım verimi (40-95%)"
              />
              {recoveryType === 'erv' && (
                <InputField
                  label="Latent Verimlilik"
                  value={latentEfficiency}
                  onChange={setLatentEfficiency}
                  unit="%"
                  min={30}
                  max={85}
                  step={1}
                  tooltip="Nem geri kazanım verimi (30-85%)"
                />
              )}
            </div>
          </div>

          {/* Bina ve Ortam */}
          <div className="bg-white rounded-2xl border border-light-gray shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-navy/10 rounded-lg">
                <Users className="text-primary-navy" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-industrial-gray">Bina Bilgileri</h2>
                <p className="text-sm text-steel-gray">Mekan özelliklerini girin</p>
              </div>
            </div>

            <div className="space-y-4">
              <RadioGroup
                label="Bina Tipi"
                value={buildingType}
                onChange={(v) => setBuildingType(v as BuildingType)}
                options={BUILDING_OPTIONS}
                columns={3}
              />

              <RadioGroup
                label="İklim Bölgesi"
                value={climateZone}
                onChange={(v) => setClimateZone(v as ClimateZone)}
                options={CLIMATE_OPTIONS}
                columns={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Alan"
                  value={area}
                  onChange={setArea}
                  unit="m²"
                  min={10}
                  max={10000}
                  step={10}
                />
                <InputField
                  label="Kişi Sayısı"
                  value={occupancy}
                  onChange={setOccupancy}
                  unit="kişi"
                  min={0}
                  max={1000}
                  step={1}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Günlük Çalışma"
                  value={operatingHours}
                  onChange={setOperatingHours}
                  unit="saat"
                  min={1}
                  max={24}
                  step={1}
                />
                <InputField
                  label="Elektrik Birim Fiyatı"
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
            >
              <RotateCcw size={16} />
              Değerleri Sıfırla
            </button>
          </div>
        </div>

        {/* Sağ Panel - Sonuçlar */}
        <div className="bg-white rounded-2xl border border-light-gray shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-success-green/10 rounded-lg">
              <TrendingUp className="text-success-green" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-industrial-gray">Analiz Sonuçları</h2>
              <p className="text-sm text-steel-gray">Tahmini tasarruf ve çevresel etki</p>
            </div>
          </div>

          {result ? (
            <>
              {/* Debi Sonuçları */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-steel-gray mb-3">Hava Debisi Hesabı</h3>
                <ResultGrid>
                  <ResultCard
                    title="Gerekli Taze Hava"
                    value={result.requiredAirflow}
                    unit="m³/h"
                    status="optimal"
                    large
                  />
                  <ResultCard
                    title="Toplam Verimlilik"
                    value={result.totalEfficiency}
                    unit="%"
                    status={result.totalEfficiency >= 70 ? 'optimal' : result.totalEfficiency >= 50 ? 'acceptable' : 'warning'}
                  />
                </ResultGrid>
              </div>

              {/* Enerji Sonuçları */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-steel-gray mb-3">Enerji Geri Kazanımı</h3>
                <ResultGrid>
                  <ResultCard
                    title="Isıtma Kazanımı"
                    value={result.heatingRecovery}
                    unit="W"
                    status="optimal"
                  />
                  <ResultCard
                    title="Soğutma Kazanımı"
                    value={result.coolingRecovery}
                    unit="W"
                    status="optimal"
                  />
                </ResultGrid>
              </div>

              {/* Yıllık Tasarruf */}
              <div className="mb-6 p-4 bg-success-green/10 rounded-xl border border-success-green/20">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="text-success-green" size={24} />
                  <h3 className="font-semibold text-industrial-gray">Yıllık Tasarruf</h3>
                </div>
                <ResultGrid>
                  <ResultCard
                    title="Enerji Tasarrufu"
                    value={result.annualEnergySaving}
                    unit="kWh/yıl"
                    status="optimal"
                    large
                  />
                  <ResultCard
                    title="Maliyet Tasarrufu"
                    value={result.annualCostSaving}
                    unit="₺/yıl"
                    status="optimal"
                    large
                  />
                </ResultGrid>
              </div>

              {/* Çevresel Etki */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-steel-gray mb-3">Çevresel Etki</h3>
                <ResultGrid>
                  <ResultCard
                    title="CO₂ Azaltımı"
                    value={result.co2Reduction}
                    unit="kg/yıl"
                    status="optimal"
                    description="Yıllık karbon emisyon azaltımı"
                  />
                  <ResultCard
                    title="Geri Ödeme Süresi"
                    value={result.paybackPeriod}
                    unit="yıl"
                    status={result.paybackPeriod <= 3 ? 'optimal' : result.paybackPeriod <= 5 ? 'acceptable' : 'warning'}
                    description="Tahmini yatırım geri dönüşü"
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
              <p className="text-steel-gray">
                Geçerli değerler girerek<br />sonuçları görüntüleyin
              </p>
            </div>
          )}
        </div>
      </div>
    </CalculatorLayout>
  )
}

export default HRVCalcPage



