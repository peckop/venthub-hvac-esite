import { ArrowDownUp, Car, Gauge, MapPin,RotateCcw, Wind } from 'lucide-react'
import React, { useMemo,useState } from 'react'

import {
  CalculatorLayout,
  InputField,
  RadioGroup,
  Recommendations,
  ResultCard,
  ResultGrid} from '../../components/calculators'
import { useI18n } from '../../i18n/I18nProvider'
import {
  calculateJetFan,
  type JetFanApplicationType
} from '../../lib/hvacCalculations'

const JetFanCalcPage: React.FC = () => {
  const { t } = useI18n()

  // Uygulama tipi seçenekleri
  const APPLICATION_OPTIONS = [
    {
      value: 'parking',
      label: t('calculators.jetFan.form.parking'),
      description: t('calculators.jetFan.parkingShortDesc'),
      icon: <Car size={24} />
    },
    {
      value: 'tunnel',
      label: t('calculators.jetFan.form.tunnel'),
      description: t('calculators.jetFan.tunnelShortDesc'),
      icon: <ArrowDownUp size={24} />
    }
  ]

  // Havalandırma modu seçenekleri
  const VENTILATION_MODE_OPTIONS = [
    { value: 'normal', label: t('calculators.jetFan.form.normal'), description: t('calculators.jetFan.form.normalDesc') },
    { value: 'smoke', label: t('calculators.jetFan.form.smoke'), description: t('calculators.jetFan.form.smokeDesc') }
  ]

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
      title={t('calculators.jetFan.pageTitle')}
      description={t('calculators.jetFan.pageDescription')}
      icon={<Wind size={32} />}
      infoText={t('calculators.jetFan.pageInfoText')}
      warningText={ventilationMode === 'smoke' ? t('calculators.jetFan.smokeWarning') : undefined}
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
                <h2 className="text-lg font-semibold text-industrial-gray">{t('calculators.jetFan.appTypeTitle')}</h2>
                <p className="text-sm text-steel-gray">{t('calculators.jetFan.appTypeSubtitle')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <RadioGroup
                label={t('calculators.jetFan.applicationLabel')}
                value={applicationType}
                onChange={(v) => setApplicationType(v as JetFanApplicationType)}
                options={APPLICATION_OPTIONS}
                columns={2}
              />

              <RadioGroup
                label={t('calculators.jetFan.form.mode')}
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
                <h2 className="text-lg font-semibold text-industrial-gray">{t('calculators.jetFan.spaceInfoTitle')}</h2>
                <p className="text-sm text-steel-gray">{t('calculators.jetFan.spaceInfoSubtitle')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <InputField
                  label={t('calculators.jetFan.lengthLabel')}
                  value={length}
                  onChange={setLength}
                  unit="m"
                  min={10}
                  max={2000}
                  step={5}
                />
                <InputField
                  label={t('calculators.jetFan.form.width')}
                  value={width}
                  onChange={setWidth}
                  unit="m"
                  min={5}
                  max={200}
                  step={1}
                />
                <InputField
                  label={t('calculators.jetFan.form.height')}
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
                    label={t('calculators.jetFan.form.capacity')}
                    value={carCapacity}
                    onChange={setCarCapacity}
                    unit={t('calculators.jetFan.unitVehicle')}
                    min={1}
                    max={5000}
                    step={1}
                    tooltip={t('calculators.jetFan.capacityTooltip')}
                  />
                  <InputField
                    label={t('calculators.jetFan.trafficLabel')}
                    value={trafficFlow}
                    onChange={setTrafficFlow}
                    unit={t('calculators.jetFan.unitVehiclePerHour')}
                    min={0}
                    max={1000}
                    step={5}
                    tooltip={t('calculators.jetFan.trafficTooltip')}
                  />
                </div>
              )}
            </div>

            <button
              onClick={reset}
              className="flex items-center gap-2 text-sm text-steel-gray hover:text-industrial-gray transition-colors mt-4"
            >
              <RotateCcw size={16} />
              {t('calculators.jetFan.resetValues')}
            </button>
          </div>

          {/* SVG Diagram */}
          <div className="bg-white rounded-2xl border border-light-gray shadow-sm p-6">
            <h3 className="text-sm font-medium text-steel-gray mb-4">{t('calculators.jetFan.layoutSchema')}</h3>
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
                <text x="140" y="110" textAnchor="middle" className="text-xs fill-steel-gray">
                  {t('common.dimensions3D', { l: length, w: width, h: height })}
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
                <text x="250" y="50" textAnchor="middle" className="text-7px fill-steel-gray">{t('calculators.jetFan.diagramLegend')}</text>
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
              <h2 className="text-lg font-semibold text-industrial-gray">{t('calculators.jetFan.resultsTitle')}</h2>
              <p className="text-sm text-steel-gray">{t('calculators.jetFan.resultsSubtitle')}</p>
            </div>
          </div>

          {result ? (
            <>
              {/* Ana Metrikler */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-steel-gray mb-3">{t('calculators.jetFan.ventilationMetrics')}</h3>
                <ResultGrid>
                  <ResultCard
                    title={t('calculators.jetFan.requiredAirflow')}
                    value={result.requiredAirflow}
                    unit="m³/h"
                    status="optimal"
                    large
                  />
                  <ResultCard
                    title={t('calculators.jetFan.airChangeRate')}
                    value={result.ach}
                    unit="ACH"
                    status={getACHStatus(result.ach)}
                    description={applicationType === 'parking' ? t('calculators.jetFan.achParkingHint') : t('calculators.jetFan.achTunnelHint')}
                  />
                </ResultGrid>
              </div>

              {/* Jet Fan Hesabı */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-steel-gray mb-3">{t('calculators.jetFan.fanRequirements')}</h3>
                <ResultGrid>
                  <ResultCard
                    title={t('calculators.jetFan.results.totalThrust')}
                    value={result.totalThrust}
                    unit="N"
                    status="optimal"
                    large
                  />
                  <ResultCard
                    title={t('calculators.jetFan.fanCountTitle')}
                    value={result.fanCount}
                    unit={t('calculators.jetFan.unitPiece')}
                    status={result.fanCount <= 20 ? 'optimal' : 'acceptable'}
                  />
                </ResultGrid>
              </div>

              {/* Yerleşim Bilgisi */}
              <div className="mb-6 p-4 bg-secondary-blue/5 rounded-xl">
                <h4 className="font-medium text-industrial-gray mb-3">{t('calculators.jetFan.placementTitle')}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-steel-gray">{t('calculators.jetFan.recommendedSpacing')}</span>
                    <span className="font-medium text-industrial-gray ml-2">{t('common.unitMeters', { v: result.recommendedSpacing })}</span>
                  </div>
                  <div>
                    <span className="text-steel-gray">{t('calculators.jetFan.mountingHeight')}</span>
                    <span className="font-medium text-industrial-gray ml-2">{t('common.unitMeters', { v: (parseFloat(height) - 0.5).toFixed(1) })}</span>
                  </div>
                  <div>
                    <span className="text-steel-gray">{t('calculators.jetFan.volume')}</span>
                    <span className="font-medium text-industrial-gray ml-2">
                      {t('common.unitCubicMeters', { v: (parseFloat(length) * parseFloat(width) * parseFloat(height)).toLocaleString('tr-TR') })}
                    </span>
                  </div>
                  <div>
                    <span className="text-steel-gray">{t('calculators.jetFan.thrustPerFan')}</span>
                    <span className="font-medium text-industrial-gray ml-2">
                      {t('common.unitNewton', { v: result.fanCount > 0 ? Math.round(result.totalThrust / result.fanCount) : 0 })}
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
                      <p className="font-medium text-industrial-gray">{t('calculators.jetFan.smokeSystemTitle')}</p>
                      <p className="text-steel-gray mt-1">
                        {t('calculators.jetFan.smokeSystemDesc')}
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
                {t('calculators.jetFan.emptyStateLine1')}<br />{t('calculators.jetFan.emptyStateLine2')}
              </p>
            </div>
          )}
        </div>
      </div>
    </CalculatorLayout>
  )
}

export default JetFanCalcPage



