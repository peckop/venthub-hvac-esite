import React, { useState, useMemo } from 'react'
import { Wind, Car, RotateCcw, Gauge, ArrowDownUp, MapPin } from 'lucide-react'
import {
  CalculatorLayout,
  ResultCard,
  ResultGrid,
  Recommendations,
  InputField,
  RadioGroup
} from '../../components/calculators'
import {
  calculateJetFan,
  type JetFanApplicationType
} from '../../lib/hvacCalculations'

// Uygulama tipi seçenekleri
const APPLICATION_OPTIONS = [
  {
    value: 'parking',
    label: 'Otopark',
    description: 'Kapalı otopark havalandırma',
    icon: <Car size={24} />
  },
  {
    value: 'tunnel',
    label: 'Tünel',
    description: 'Yol veya metro tüneli',
    icon: <ArrowDownUp size={24} />
  }
]

// Havalandırma modu seçenekleri
const VENTILATION_MODE_OPTIONS = [
  { value: 'normal', label: 'Normal', description: 'Günlük havalandırma' },
  { value: 'smoke', label: 'Duman Tahliye', description: 'Yangın senaryosu' }
]

const JetFanCalcPage: React.FC = () => {
  // Form durumu
  const [applicationType, setApplicationType] = useState<JetFanApplicationType>('parking')
  const [ventilationMode, setVentilationMode] = useState<'normal' | 'smoke'>('normal')
  const [length, setLength] = useState('100')
  const [width, setWidth] = useState('30')
  const [height, setHeight] = useState('3')
  const [carCapacity, setCarCapacity] = useState('100')
  const [trafficFlow, setTrafficFlow] = useState('50')

  // Gerçek zamanlı hesaplama
  const result = useMemo(() => {
    const lenVal = parseFloat(length) || 0
    const widVal = parseFloat(width) || 0
    const heiVal = parseFloat(height) || 0
    const carVal = parseFloat(carCapacity) || 0
    const trafficVal = parseFloat(trafficFlow) || 0

    if (lenVal <= 0 || widVal <= 0 || heiVal <= 0) return null
    if (applicationType === 'parking' && carVal <= 0) return null

    return calculateJetFan({
      applicationType,
      ventilationMode,
      length: lenVal,
      width: widVal,
      height: heiVal,
      carCapacity: carVal,
      trafficFlowPerHour: trafficVal
    })
  }, [applicationType, ventilationMode, length, width, height, carCapacity, trafficFlow])

  const reset = () => {
    setApplicationType('parking')
    setVentilationMode('normal')
    setLength('100')
    setWidth('30')
    setHeight('3')
    setCarCapacity('100')
    setTrafficFlow('50')
  }

  // ACH durumu
  const getACHStatus = (ach: number): 'optimal' | 'acceptable' | 'warning' | 'critical' => {
    if (applicationType === 'parking') {
      if (ach >= 6 && ach <= 10) return 'optimal'
      if (ach >= 4 && ach <= 12) return 'acceptable'
      return 'warning'
    } else {
      // Tunnel
      if (ach >= 20) return 'optimal'
      if (ach >= 15) return 'acceptable'
      return 'warning'
    }
  }

  return (
    <CalculatorLayout
      title="Jet Fan Hesap Makinesi"
      description="Otopark ve tünel jet fan itki ve havalandırma hesabı"
      icon={<Wind size={32} />}
      infoText="Kapalı otopark veya tünellerde gerekli jet fan sayısı, itki kuvveti ve havalandırma debisini hesaplar. NFPA 502 ve BS 7346 standartlarına uygun."
      warningText={ventilationMode === 'smoke' ? 'Duman tahliye hesabı ön tasarım amaçlıdır. Profesyonel yangın mühendisi danışmanlığı gereklidir.' : undefined}
    >
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Sol Panel - Girdiler */}
        <div className="space-y-6">
          {/* Uygulama Tipi */}
          <div className="bg-white rounded-2xl border border-light-gray shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-navy/10 rounded-lg">
                <MapPin className="text-primary-navy" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-industrial-gray">Uygulama Tipi</h2>
                <p className="text-sm text-steel-gray">Mekan türünü seçin</p>
              </div>
            </div>

            <div className="space-y-4">
              <RadioGroup
                label="Uygulama"
                value={applicationType}
                onChange={(v) => setApplicationType(v as JetFanApplicationType)}
                options={APPLICATION_OPTIONS}
                columns={2}
              />

              <RadioGroup
                label="Havalandırma Modu"
                value={ventilationMode}
                onChange={(v) => setVentilationMode(v as 'normal' | 'smoke')}
                options={VENTILATION_MODE_OPTIONS}
                columns={2}
              />
            </div>
          </div>

          {/* Mekan Boyutları */}
          <div className="bg-white rounded-2xl border border-light-gray shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-navy/10 rounded-lg">
                <Gauge className="text-primary-navy" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-industrial-gray">Mekan Bilgileri</h2>
                <p className="text-sm text-steel-gray">Boyut ve kapasite değerleri</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <InputField
                  label="Uzunluk"
                  value={length}
                  onChange={setLength}
                  unit="m"
                  min={10}
                  max={2000}
                  step={5}
                />
                <InputField
                  label="Genişlik"
                  value={width}
                  onChange={setWidth}
                  unit="m"
                  min={5}
                  max={200}
                  step={1}
                />
                <InputField
                  label="Yükseklik"
                  value={height}
                  onChange={setHeight}
                  unit="m"
                  min={2}
                  max={15}
                  step={0.1}
                />
              </div>

              {applicationType === 'parking' && (
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Araç Kapasitesi"
                    value={carCapacity}
                    onChange={setCarCapacity}
                    unit="araç"
                    min={1}
                    max={5000}
                    step={1}
                    tooltip="Toplam park yeri sayısı"
                  />
                  <InputField
                    label="Saatlik Trafik"
                    value={trafficFlow}
                    onChange={setTrafficFlow}
                    unit="araç/sa"
                    min={0}
                    max={1000}
                    step={5}
                    tooltip="Pik saatteki araç hareketi"
                  />
                </div>
              )}
            </div>

            <button
              onClick={reset}
              className="flex items-center gap-2 text-sm text-steel-gray hover:text-industrial-gray transition-colors mt-4"
            >
              <RotateCcw size={16} />
              Değerleri Sıfırla
            </button>
          </div>

          {/* SVG Diagram */}
          <div className="bg-white rounded-2xl border border-light-gray shadow-sm p-6">
            <h3 className="text-sm font-medium text-steel-gray mb-4">Yerleşim Şeması</h3>
            <div className="flex justify-center">
              <svg viewBox="0 0 280 120" className="w-full max-w-md">
                {/* Parking/Tunnel outline */}
                <rect x="20" y="20" width="240" height="80" fill="#f3f4f6" stroke="#1C3D5A" strokeWidth="2" rx="4" />

                {/* Jet Fans */}
                {result && Array.from({ length: Math.min(result.fanCount, 8) }).map((_, i) => {
                  const x = 40 + (i * 28)
                  return (
                    <g key={i}>
                      <ellipse cx={x} cy="40" rx="10" ry="6" fill="#0EA5E9" stroke="#0284C7" strokeWidth="1" />
                      <line x1={x} y1="46" x2={x} y2="75" stroke="#0EA5E9" strokeWidth="2" strokeDasharray="4,2" opacity="0.6" />
                    </g>
                  )
                })}

                {/* Dimensions */}
                <text x="140" y="110" textAnchor="middle" className="text-[9px] fill-steel-gray">
                  {length}m × {width}m × {height}m
                </text>

                {/* Cars (for parking) */}
                {applicationType === 'parking' && (
                  <>
                    <rect x="50" y="65" width="20" height="12" fill="#6B7280" rx="2" opacity="0.3" />
                    <rect x="100" y="65" width="20" height="12" fill="#6B7280" rx="2" opacity="0.3" />
                    <rect x="150" y="65" width="20" height="12" fill="#6B7280" rx="2" opacity="0.3" />
                    <rect x="200" y="65" width="20" height="12" fill="#6B7280" rx="2" opacity="0.3" />
                  </>
                )}

                {/* Arrow for tunnel */}
                {applicationType === 'tunnel' && (
                  <path d="M60 60 L220 60" stroke="#6B7280" strokeWidth="2" markerEnd="url(#tunnelArrow)" opacity="0.5" />
                )}
                <defs>
                  <marker id="tunnelArrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
                  </marker>
                </defs>

                {/* Legend */}
                <circle cx="250" cy="35" r="5" fill="#0EA5E9" />
                <text x="250" y="50" textAnchor="middle" className="text-[7px] fill-steel-gray">Jet Fan</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Sağ Panel - Sonuçlar */}
        <div className="bg-white rounded-2xl border border-light-gray shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-success-green/10 rounded-lg">
              <Wind className="text-success-green" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-industrial-gray">Hesaplama Sonuçları</h2>
              <p className="text-sm text-steel-gray">Önerilen jet fan konfigürasyonu</p>
            </div>
          </div>

          {result ? (
            <>
              {/* Ana Metrikler */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-steel-gray mb-3">Havalandırma Metrikleri</h3>
                <ResultGrid>
                  <ResultCard
                    title="Gerekli Debi"
                    value={result.requiredAirflow}
                    unit="m³/h"
                    status="optimal"
                    large
                  />
                  <ResultCard
                    title="Hava Değişim Hızı"
                    value={result.ach}
                    unit="ACH"
                    status={getACHStatus(result.ach)}
                    description={applicationType === 'parking' ? 'Otopark: 6-10 ACH önerilen' : 'Tünel: 15+ ACH önerilen'}
                  />
                </ResultGrid>
              </div>

              {/* Jet Fan Hesabı */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-steel-gray mb-3">Jet Fan Gereksinimleri</h3>
                <ResultGrid>
                  <ResultCard
                    title="Toplam İtki Kuvveti"
                    value={result.totalThrust}
                    unit="N"
                    status="optimal"
                    large
                  />
                  <ResultCard
                    title="Jet Fan Sayısı"
                    value={result.fanCount}
                    unit="adet"
                    status={result.fanCount <= 20 ? 'optimal' : 'acceptable'}
                  />
                </ResultGrid>
              </div>

              {/* Yerleşim Bilgisi */}
              <div className="mb-6 p-4 bg-secondary-blue/5 rounded-xl">
                <h4 className="font-medium text-industrial-gray mb-3">Yerleşim Önerileri</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-steel-gray">Önerilen Aralık:</span>
                    <span className="font-medium text-industrial-gray ml-2">{result.recommendedSpacing} m</span>
                  </div>
                  <div>
                    <span className="text-steel-gray">Montaj Yüksekliği:</span>
                    <span className="font-medium text-industrial-gray ml-2">{(parseFloat(height) - 0.5).toFixed(1)} m</span>
                  </div>
                  <div>
                    <span className="text-steel-gray">Hacim:</span>
                    <span className="font-medium text-industrial-gray ml-2">
                      {(parseFloat(length) * parseFloat(width) * parseFloat(height)).toLocaleString('tr-TR')} m³
                    </span>
                  </div>
                  <div>
                    <span className="text-steel-gray">Fan Başına İtki:</span>
                    <span className="font-medium text-industrial-gray ml-2">
                      {result.fanCount > 0 ? Math.round(result.totalThrust / result.fanCount) : 0} N
                    </span>
                  </div>
                </div>
              </div>

              {/* Duman Tahliye Uyarısı */}
              {ventilationMode === 'smoke' && (
                <div className="mb-6 p-4 bg-warning-orange/10 rounded-xl border border-warning-orange/30">
                  <div className="flex items-start gap-3">
                    <Wind className="text-warning-orange flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm">
                      <p className="font-medium text-industrial-gray">Duman Tahliye Sistemi</p>
                      <p className="text-steel-gray mt-1">
                        Bu hesaplama ön boyutlandırma amaçlıdır. Kesin tasarım için CFD analizi ve
                        yangın güvenlik uzmanı danışmanlığı gereklidir.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Recommendations items={result.recommendations} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Wind className="text-steel-gray" size={32} />
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

export default JetFanCalcPage



