import React, { useState, useEffect } from 'react'
import { Wind, Thermometer, DoorOpen, Zap, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react'
import {
  CalculatorLayout,
  StepIndicator,
  ResultCard,
  ResultGrid,
  Recommendations,
  InputField,
  RadioGroup
} from '../../components/calculators'
import {
  calculateAirCurtain,
  type AirCurtainApplication,
  type WindCondition,
  type TrafficIntensity
} from '../../lib/hvacCalculations'

// Adımlar
const STEPS = [
  { id: 1, label: 'Kapı Boyutları', description: 'Genişlik ve yükseklik' },
  { id: 2, label: 'Uygulama', description: 'Kullanım amacı' },
  { id: 3, label: 'Koşullar', description: 'Rüzgar ve trafik' },
  { id: 4, label: 'Sonuçlar', description: 'Hesaplama sonuçları' }
]

// Uygulama seçenekleri
const APPLICATION_OPTIONS = [
  {
    value: 'comfort',
    label: 'Konfor / Enerji',
    description: 'Genel ticari alanlar, mağazalar',
    icon: <Thermometer size={24} />
  },
  {
    value: 'insect',
    label: 'Böcek Kontrolü',
    description: 'Gıda işletmeleri, restoranlar',
    icon: <Wind size={24} />
  },
  {
    value: 'coldRoom',
    label: 'Soğuk Oda',
    description: 'Soğuk hava depoları, frigorifik',
    icon: <Thermometer size={24} />
  }
]

// Rüzgar seçenekleri
const WIND_OPTIONS = [
  { value: 'none', label: 'Yok', description: 'İç mekan veya korunaklı' },
  { value: 'light', label: 'Hafif', description: '< 5 m/s' },
  { value: 'moderate', label: 'Orta', description: '5-10 m/s' },
  { value: 'strong', label: 'Güçlü', description: '> 10 m/s' }
]

// Trafik seçenekleri  
const TRAFFIC_OPTIONS = [
  { value: 'low', label: 'Düşük', description: '< 50 geçiş/saat' },
  { value: 'medium', label: 'Orta', description: '50-200 geçiş/saat' },
  { value: 'high', label: 'Yüksek', description: '> 200 geçiş/saat' }
]

const AirCurtainCalcPage: React.FC = () => {
  // Adım durumu
  const [currentStep, setCurrentStep] = useState(1)

  // Form durumu
  const [doorWidth, setDoorWidth] = useState('1.5')
  const [doorHeight, setDoorHeight] = useState('2.5')
  const [application, setApplication] = useState<AirCurtainApplication>('comfort')
  const [windCondition, setWindCondition] = useState<WindCondition>('none')
  const [trafficIntensity, setTrafficIntensity] = useState<TrafficIntensity>('medium')

  // Sonuç durumu
  const [result, setResult] = useState<ReturnType<typeof calculateAirCurtain> | null>(null)

  // Hesaplama
  useEffect(() => {
    if (currentStep === 4) {
      const width = parseFloat(doorWidth) || 0
      const height = parseFloat(doorHeight) || 0

      if (width > 0 && height > 0) {
        const calculationResult = calculateAirCurtain({
          doorWidth: width,
          doorHeight: height,
          application,
          windCondition,
          trafficIntensity
        })
        setResult(calculationResult)
      }
    }
  }, [currentStep, doorWidth, doorHeight, application, windCondition, trafficIntensity])

  // Validasyon
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return parseFloat(doorWidth) >= 0.5 &&
          parseFloat(doorWidth) <= 10 &&
          parseFloat(doorHeight) >= 1.5 &&
          parseFloat(doorHeight) <= 6
      case 2:
        return !!application
      case 3:
        return !!windCondition && !!trafficIntensity
      default:
        return true
    }
  }

  // Navigasyon
  const nextStep = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const reset = () => {
    setCurrentStep(1)
    setDoorWidth('1.5')
    setDoorHeight('2.5')
    setApplication('comfort')
    setWindCondition('none')
    setTrafficIntensity('medium')
    setResult(null)
  }

  // Verimlilik durumu rengi
  const getEfficiencyStatus = (eff: string | undefined): 'optimal' | 'acceptable' | 'warning' => {
    switch (eff) {
      case 'optimal': return 'optimal'
      case 'acceptable': return 'acceptable'
      default: return 'warning'
    }
  }

  return (
    <CalculatorLayout
      title="Hava Perdesi Hesap Makinesi"
      description="Kapı boyutlarına ve kullanım koşullarına göre ideal hava perdesi seçimi"
      icon={<DoorOpen size={32} />}
      infoText="Bu araç, mühendislik standartlarına (ISO 27327-1) uygun ön boyutlandırma yapar. Gerekli hava debisi, nozül hızı ve motor gücünü hesaplar."
    >
      {/* Step Indicator */}
      <StepIndicator
        steps={STEPS}
        currentStep={currentStep}
        onStepClick={(id) => id < currentStep && setCurrentStep(id)}
      />

      {/* Form Container */}
      <div className="bg-white rounded-2xl border border-light-gray shadow-sm p-6 md:p-8">

        {/* Step 1: Kapı Boyutları */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-navy/10 rounded-lg">
                <DoorOpen className="text-primary-navy" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-industrial-gray">Kapı Boyutları</h2>
                <p className="text-sm text-steel-gray">Hava perdesi monte edilecek kapının ölçülerini girin</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="Kapı Genişliği"
                value={doorWidth}
                onChange={setDoorWidth}
                unit="m"
                min={0.5}
                max={10}
                step={0.1}
                tooltip="Kapının iç açıklık genişliği (0.5 - 10 m)"
                placeholder="1.5"
              />
              <InputField
                label="Kapı Yüksekliği"
                value={doorHeight}
                onChange={setDoorHeight}
                unit="m"
                min={1.5}
                max={6}
                step={0.1}
                tooltip="Kapının iç açıklık yüksekliği (1.5 - 6 m)"
                placeholder="2.5"
              />
            </div>

            {/* SVG Diagram */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
              <div className="flex justify-center">
                <svg viewBox="0 0 200 160" className="w-full max-w-xs">
                  {/* Door Frame */}
                  <rect x="40" y="20" width="120" height="120" fill="none" stroke="#1C3D5A" strokeWidth="3" />

                  {/* Air Curtain Unit */}
                  <rect x="50" y="20" width="100" height="8" fill="#0EA5E9" rx="2" />
                  <text x="100" y="16" textAnchor="middle" className="text-[8px] fill-primary-navy font-medium">
                    Hava Perdesi
                  </text>

                  {/* Air Flow Lines */}
                  {[60, 80, 100, 120, 140].map((x, i) => (
                    <g key={i}>
                      <line x1={x} y1="30" x2={x} y2="130" stroke="#0EA5E9" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
                      <polygon points={`${x - 3},125 ${x + 3},125 ${x},135`} fill="#0EA5E9" opacity="0.5" />
                    </g>
                  ))}

                  {/* Dimensions */}
                  <line x1="35" y1="20" x2="35" y2="140" stroke="#6B7280" strokeWidth="1" />
                  <line x1="30" y1="20" x2="40" y2="20" stroke="#6B7280" strokeWidth="1" />
                  <line x1="30" y1="140" x2="40" y2="140" stroke="#6B7280" strokeWidth="1" />
                  <text x="20" y="85" textAnchor="middle" className="text-[10px] fill-steel-gray" transform="rotate(-90, 20, 85)">
                    {doorHeight || '?'} m
                  </text>

                  <line x1="40" y1="150" x2="160" y2="150" stroke="#6B7280" strokeWidth="1" />
                  <line x1="40" y1="145" x2="40" y2="155" stroke="#6B7280" strokeWidth="1" />
                  <line x1="160" y1="145" x2="160" y2="155" stroke="#6B7280" strokeWidth="1" />
                  <text x="100" y="158" textAnchor="middle" className="text-[10px] fill-steel-gray">
                    {doorWidth || '?'} m
                  </text>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Uygulama */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-navy/10 rounded-lg">
                <Wind className="text-primary-navy" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-industrial-gray">Uygulama Tipi</h2>
                <p className="text-sm text-steel-gray">Hava perdesinin kullanım amacını seçin</p>
              </div>
            </div>

            <RadioGroup
              label="Uygulama Seçin"
              value={application}
              onChange={(v) => setApplication(v as AirCurtainApplication)}
              options={APPLICATION_OPTIONS}
              columns={3}
            />

            {/* Application Info */}
            <div className="mt-6 p-4 bg-secondary-blue/5 rounded-xl">
              <h4 className="font-medium text-industrial-gray mb-2">
                {APPLICATION_OPTIONS.find(o => o.value === application)?.label}
              </h4>
              <p className="text-sm text-steel-gray">
                {application === 'comfort' && 'Genel ticari alanlar için enerji tasarrufu sağlar. Nozül hızı: 8-12 m/s'}
                {application === 'insect' && 'Gıda işletmeleri ve restoranlar için böcek girişini engeller. Nozül hızı: 12-15 m/s'}
                {application === 'coldRoom' && 'Soğuk hava depolarında sıcaklık kaybını minimize eder. Nozül hızı: 15-18 m/s'}
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Koşullar */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-navy/10 rounded-lg">
                <Zap className="text-primary-navy" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-industrial-gray">Çevresel Koşullar</h2>
                <p className="text-sm text-steel-gray">Rüzgar ve trafik yoğunluğunu belirtin</p>
              </div>
            </div>

            <RadioGroup
              label="Rüzgar Durumu"
              value={windCondition}
              onChange={(v) => setWindCondition(v as WindCondition)}
              options={WIND_OPTIONS}
              columns={4}
              tooltip="Kapının dışında beklenen rüzgar şiddeti"
            />

            <RadioGroup
              label="Trafik Yoğunluğu"
              value={trafficIntensity}
              onChange={(v) => setTrafficIntensity(v as TrafficIntensity)}
              options={TRAFFIC_OPTIONS}
              columns={3}
              tooltip="Saatlik geçiş sayısı tahmini"
            />
          </div>
        )}

        {/* Step 4: Sonuçlar */}
        {currentStep === 4 && result && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-success-green/10 rounded-lg">
                <Zap className="text-success-green" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-industrial-gray">Hesaplama Sonuçları</h2>
                <p className="text-sm text-steel-gray">Önerilen hava perdesi özellikleri</p>
              </div>
            </div>

            {/* Input Summary */}
            <div className="p-4 bg-gray-50 rounded-xl mb-6">
              <h4 className="text-sm font-medium text-steel-gray mb-2">Girdi Özeti</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="px-3 py-1 bg-white rounded-full border border-light-gray">
                  Kapı: {doorWidth}m × {doorHeight}m
                </span>
                <span className="px-3 py-1 bg-white rounded-full border border-light-gray">
                  {APPLICATION_OPTIONS.find(o => o.value === application)?.label}
                </span>
                <span className="px-3 py-1 bg-white rounded-full border border-light-gray">
                  Rüzgar: {WIND_OPTIONS.find(o => o.value === windCondition)?.label}
                </span>
                <span className="px-3 py-1 bg-white rounded-full border border-light-gray">
                  Trafik: {TRAFFIC_OPTIONS.find(o => o.value === trafficIntensity)?.label}
                </span>
              </div>
            </div>

            {/* Results Grid */}
            <ResultGrid title="Hesaplanan Değerler">
              <ResultCard
                title="Gerekli Hava Debisi"
                value={result.requiredAirflow}
                unit="m³/h"
                status="optimal"
                large
                description="Etkili hava bariyeri için gereken toplam debi"
              />
              <ResultCard
                title="Nozül Hızı"
                value={result.nozzleVelocity}
                unit="m/s"
                status={getEfficiencyStatus(result.efficiency)}
                description="Hava perdesi çıkışındaki hava hızı"
              />
              <ResultCard
                title="Zemin Hızı (Tahmini)"
                value={result.floorVelocity}
                unit="m/s"
                status={getEfficiencyStatus(result.efficiency)}
                description="Zemin seviyesinde beklenen hava hızı"
              />
              <ResultCard
                title="Önerilen Motor Gücü"
                value={result.suggestedPower}
                unit="W"
                status="info"
                description="Minimum motor gücü gereksinimi"
              />
              <ResultCard
                title="Nozül Genişliği"
                value={result.nozzleWidth * 1000}
                unit="mm"
                status="info"
              />
              <ResultCard
                title="Nozül Yüksekliği"
                value={result.nozzleHeight}
                unit="mm"
                status="info"
              />
            </ResultGrid>

            {/* Efficiency Badge */}
            <div className={`
              mt-6 p-4 rounded-xl border-2 flex items-center gap-4
              ${result.efficiency === 'optimal' ? 'bg-success-green/10 border-success-green/30' :
                result.efficiency === 'acceptable' ? 'bg-secondary-blue/10 border-secondary-blue/30' :
                  'bg-warning-orange/10 border-warning-orange/30'}
            `}>
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${result.efficiency === 'optimal' ? 'bg-success-green text-white' :
                  result.efficiency === 'acceptable' ? 'bg-secondary-blue text-white' :
                    'bg-warning-orange text-white'}
              `}>
                <Wind size={24} />
              </div>
              <div>
                <div className="font-semibold text-industrial-gray">
                  Verimlilik: {result.efficiency === 'optimal' ? 'Optimal' : result.efficiency === 'acceptable' ? 'Kabul Edilebilir' : 'Sınırda'}
                </div>
                <div className="text-sm text-steel-gray">
                  {result.efficiency === 'optimal'
                    ? 'Hesaplanan parametreler ideal performans sağlayacaktır'
                    : result.efficiency === 'acceptable'
                      ? 'Performans kabul edilebilir seviyede, gerekirse iyileştirme düşünülebilir'
                      : 'Daha güçlü bir model veya ek önlemler gerekebilir'}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <Recommendations items={result.recommendations} />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-light-gray">
          <button
            onClick={currentStep === 4 ? reset : prevStep}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
              ${currentStep === 1
                ? 'text-steel-gray cursor-not-allowed opacity-50'
                : 'text-steel-gray hover:text-industrial-gray hover:bg-gray-100'}
            `}
            disabled={currentStep === 1}
          >
            {currentStep === 4 ? (
              <>
                <RotateCcw size={18} />
                Yeni Hesaplama
              </>
            ) : (
              <>
                <ArrowLeft size={18} />
                Geri
              </>
            )}
          </button>

          {currentStep < 4 && (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                ${canProceed()
                  ? 'bg-primary-navy text-white hover:bg-secondary-blue'
                  : 'bg-gray-200 text-steel-gray cursor-not-allowed'}
              `}
            >
              {currentStep === 3 ? 'Hesapla' : 'Devam'}
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </CalculatorLayout>
  )
}

export default AirCurtainCalcPage



