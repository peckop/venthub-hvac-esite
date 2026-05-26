import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Wind, Thermometer, DoorOpen, Zap, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
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

const AirCurtainCalcPage: React.FC = () => {
  const { t } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Dynamic Step Configuration
  const steps = useMemo(() => [
    { id: 1, label: t('calculators.airCurtain.steps.dimensions'), description: t('calculators.airCurtain.steps.dimensionsDesc') },
    { id: 2, label: t('calculators.airCurtain.steps.application'), description: t('calculators.airCurtain.steps.applicationDesc') },
    { id: 3, label: t('calculators.airCurtain.steps.conditions'), description: t('calculators.airCurtain.steps.conditionsDesc') },
    { id: 4, label: t('calculators.airCurtain.steps.results'), description: t('calculators.airCurtain.steps.resultsDesc') }
  ], [t])

  // Dynamic Application Options
  const applicationOptions = useMemo(() => [
    {
      value: 'comfort',
      label: t('calculators.airCurtain.applications.comfort.label'),
      description: t('calculators.airCurtain.applications.comfort.desc'),
      icon: <Thermometer size={24} />
    },
    {
      value: 'insect',
      label: t('calculators.airCurtain.applications.insect.label'),
      description: t('calculators.airCurtain.applications.insect.desc'),
      icon: <Wind size={24} />
    },
    {
      value: 'coldRoom',
      label: t('calculators.airCurtain.applications.coldRoom.label'),
      description: t('calculators.airCurtain.applications.coldRoom.desc'),
      icon: <Thermometer size={24} />
    }
  ], [t])

  // Dynamic Wind Options
  const windOptions = useMemo(() => [
    { value: 'none', label: t('calculators.airCurtain.conditions.wind.none'), description: t('calculators.airCurtain.form.windTooltip') },
    { value: 'light', label: t('calculators.airCurtain.conditions.wind.light'), description: '< 5 m/s' },
    { value: 'moderate', label: t('calculators.airCurtain.conditions.wind.moderate'), description: '5-10 m/s' },
    { value: 'strong', label: t('calculators.airCurtain.conditions.wind.strong'), description: '> 10 m/s' }
  ], [t])

  // Dynamic Traffic Options
  const trafficOptions = useMemo(() => [
    { value: 'low', label: t('calculators.airCurtain.conditions.traffic.low'), description: '< 50 geçiş/saat' },
    { value: 'medium', label: t('calculators.airCurtain.conditions.traffic.medium'), description: '50-200 geçiş/saat' },
    { value: 'high', label: t('calculators.airCurtain.conditions.traffic.high'), description: '> 200 geçiş/saat' }
  ], [t])

  // Form State
  const [currentStep, setCurrentStep] = useState(Number(searchParams?.get('step')) || 1)
  const [doorWidth, setDoorWidth] = useState(searchParams?.get('doorWidth') || '1.5')
  const [doorHeight, setDoorHeight] = useState(searchParams?.get('doorHeight') || '2.5')
  const [application, setApplication] = useState<AirCurtainApplication>(
    (searchParams?.get('application') as AirCurtainApplication) || 'comfort'
  )
  const [windCondition, setWindCondition] = useState<WindCondition>(
    (searchParams?.get('windCondition') as WindCondition) || 'none'
  )
  const [trafficIntensity, setTrafficIntensity] = useState<TrafficIntensity>(
    (searchParams?.get('trafficIntensity') as TrafficIntensity) || 'medium'
  )

  // URL Sync Effect
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams()
    if (currentStep !== 1) params.set('step', currentStep.toString())
    if (doorWidth !== '1.5') params.set('doorWidth', doorWidth)
    if (doorHeight !== '2.5') params.set('doorHeight', doorHeight)
    if (application !== 'comfort') params.set('application', application)
    if (windCondition !== 'none') params.set('windCondition', windCondition)
    if (trafficIntensity !== 'medium') params.set('trafficIntensity', trafficIntensity)

    const query = params.toString()
    router.replace(`${pathname}${query ? `?${query}` : ''}` as import('next').Route, { scroll: false })
  }, [currentStep, doorWidth, doorHeight, application, windCondition, trafficIntensity, pathname, router])

  // Result State
  const [result, setResult] = useState<ReturnType<typeof calculateAirCurtain> | null>(null)

  // Calculation Logic
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

  // Validation
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        const w = parseFloat(doorWidth)
        const h = parseFloat(doorHeight)
        return w >= 0.5 && w <= 10 && h >= 1.5 && h <= 6
      case 2:
        return !!application
      case 3:
        return !!windCondition && !!trafficIntensity
      default:
        return true
    }
  }

  // Navigation
  const nextStep = () => { if (currentStep < 4 && canProceed()) setCurrentStep(currentStep + 1) }
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1) }
  const reset = () => {
    setCurrentStep(1)
    setDoorWidth('1.5')
    setDoorHeight('2.5')
    setApplication('comfort')
    setWindCondition('none')
    setTrafficIntensity('medium')
    setResult(null)
  }

  const getEfficiencyStatus = (eff: string | undefined): 'optimal' | 'acceptable' | 'warning' => {
    if (eff === 'optimal') return 'optimal'
    if (eff === 'acceptable') return 'acceptable'
    return 'warning'
  }

  return (
    <CalculatorLayout
      title={t('calculators.airCurtain.title')}
      description={t('calculators.airCurtain.description')}
      icon={<DoorOpen size={32} />}
      infoText={t('calculators.airCurtain.infoText')}
    >
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        onStepClick={(id) => id < currentStep && setCurrentStep(id)}
      />

      <div className="bg-white rounded-2xl border border-light-gray shadow-sm p-6 md:p-8">
        {/* Step 1: Dimensions */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-navy/10 rounded-lg">
                <DoorOpen className="text-primary-navy" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-industrial-gray">{t('calculators.airCurtain.steps.dimensions')}</h2>
                <p className="text-sm text-steel-gray">{t('calculators.airCurtain.form.applicationPurpose')}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label={t('calculators.airCurtain.form.doorWidth')}
                value={doorWidth}
                onChange={setDoorWidth}
                unit="m"
                min={0.5}
                max={10}
                step={0.1}
                tooltip={t('calculators.airCurtain.form.doorWidthTooltip')}
                placeholder="1.5"
                aria-label={t('calculators.airCurtain.form.doorWidth')}
              />
              <InputField
                label={t('calculators.airCurtain.form.doorHeight')}
                value={doorHeight}
                onChange={setDoorHeight}
                unit="m"
                min={1.5}
                max={6}
                step={0.1}
                tooltip={t('calculators.airCurtain.form.doorHeightTooltip')}
                placeholder="2.5"
                aria-label={t('calculators.airCurtain.form.doorHeight')}
              />
            </div>

            {/* SVG Diagram */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
              <div className="flex justify-center">
                <svg viewBox="0 0 200 160" className="w-full max-w-xs" role="img" aria-label="Door dimensions diagram">
                  <rect x="40" y="20" width="120" height="120" fill="none" stroke="#1C3D5A" strokeWidth="3" />
                  <rect x="50" y="20" width="100" height="8" fill="#0EA5E9" rx="2" />
                  <text x="100" y="16" textAnchor="middle" className="text-xs fill-primary-navy font-medium">
                    {t('calculators.airCurtain.diagram.unit')}
                  </text>
                  {[60, 80, 100, 120, 140].map((x, i) => (
                    <g key={i}>
                      <line x1={x} y1="30" x2={x} y2="130" stroke="#0EA5E9" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
                      <polygon points={`${x - 3},125 ${x + 3},125 ${x},135`} fill="#0EA5E9" opacity="0.5" />
                    </g>
                  ))}
                  <line x1="35" y1="20" x2="35" y2="140" stroke="#6B7280" strokeWidth="1" />
                  <text x="20" y="85" textAnchor="middle" className="text-xs fill-steel-gray" transform="rotate(-90, 20, 85)">
                    {doorHeight || '?'} m
                  </text>
                  <line x1="40" y1="150" x2="160" y2="150" stroke="#6B7280" strokeWidth="1" />
                  <text x="100" y="158" textAnchor="middle" className="text-xs fill-steel-gray">
                    {doorWidth || '?'} m
                  </text>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Application */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-navy/10 rounded-lg">
                <Wind className="text-primary-navy" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-industrial-gray">{t('calculators.airCurtain.steps.application')}</h2>
                <p className="text-sm text-steel-gray">{t('calculators.airCurtain.form.applicationPurpose')}</p>
              </div>
            </div>

            <RadioGroup
              label={t('calculators.airCurtain.form.applicationLabel')}
              value={application}
              onChange={(v) => setApplication(v as AirCurtainApplication)}
              options={applicationOptions}
              columns={3}
            />

            <div className="mt-6 p-4 bg-secondary-blue/5 rounded-xl">
              <h4 className="font-medium text-industrial-gray mb-2">
                {applicationOptions.find(o => o.value === application)?.label}
              </h4>
              <p className="text-sm text-steel-gray">
                {t(`calculators.airCurtain.applications.${application}.info`)}
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Conditions */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-navy/10 rounded-lg">
                <Zap className="text-primary-navy" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-industrial-gray">{t('calculators.airCurtain.form.environmentalConditions')}</h2>
                <p className="text-sm text-steel-gray">{t('calculators.airCurtain.steps.conditionsDesc')}</p>
              </div>
            </div>

            <RadioGroup
              label={t('calculators.airCurtain.form.windStatus')}
              value={windCondition}
              onChange={(v) => setWindCondition(v as WindCondition)}
              options={windOptions}
              columns={4}
              tooltip={t('calculators.airCurtain.form.windTooltip')}
            />

            <RadioGroup
              label={t('calculators.airCurtain.form.trafficIntensity')}
              value={trafficIntensity}
              onChange={(v) => setTrafficIntensity(v as TrafficIntensity)}
              options={trafficOptions}
              columns={3}
              tooltip={t('calculators.airCurtain.form.trafficTooltip')}
            />
          </div>
        )}

        {/* Step 4: Results */}
        {currentStep === 4 && result && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-success-green/10 rounded-lg">
                <Zap className="text-success-green" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-industrial-gray">{t('calculators.airCurtain.results.title')}</h2>
                <p className="text-sm text-steel-gray">{t('calculators.airCurtain.results.subtitle')}</p>
              </div>
            </div>

            {/* Input Summary */}
            <div className="p-4 bg-gray-50 rounded-xl mb-6">
              <h4 className="text-sm font-medium text-steel-gray mb-2">{t('calculators.airCurtain.form.inputSummary')}</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="px-3 py-1 bg-white rounded-full border border-light-gray">
                  {t('calculators.airCurtain.diagram.unit')}: {doorWidth}m × {doorHeight}m
                </span>
                <span className="px-3 py-1 bg-white rounded-full border border-light-gray">
                  {applicationOptions.find(o => o.value === application)?.label}
                </span>
                <span className="px-3 py-1 bg-white rounded-full border border-light-gray">
                  {t('calculators.airCurtain.form.windStatus')}: {windOptions.find(o => o.value === windCondition)?.label}
                </span>
                <span className="px-3 py-1 bg-white rounded-full border border-light-gray">
                  {t('calculators.airCurtain.form.trafficIntensity')}: {trafficOptions.find(o => o.value === trafficIntensity)?.label}
                </span>
              </div>
            </div>

            {/* Results Grid */}
            <ResultGrid title={t('calculators.airCurtain.results.gridTitle')}>
              <ResultCard
                title={t('calculators.airCurtain.results.airflow')}
                value={result.requiredAirflow}
                unit="m³/h"
                status="optimal"
                large
                description={t('calculators.airCurtain.results.airflowDesc')}
              />
              <ResultCard
                title={t('calculators.airCurtain.results.velocity')}
                value={result.nozzleVelocity}
                unit="m/s"
                status={getEfficiencyStatus(result.efficiency)}
                description={t('calculators.airCurtain.results.velocityDesc')}
              />
              <ResultCard
                title={t('calculators.airCurtain.results.floorVelocity')}
                value={result.floorVelocity}
                unit="m/s"
                status={getEfficiencyStatus(result.efficiency)}
                description={t('calculators.airCurtain.results.floorVelocityDesc')}
              />
              <ResultCard
                title={t('calculators.airCurtain.results.power')}
                value={result.suggestedPower}
                unit="W"
                status="info"
                description={t('calculators.airCurtain.results.powerDesc')}
              />
              <ResultCard
                title={t('calculators.airCurtain.results.nozzleWidth')}
                value={result.nozzleWidth * 1000}
                unit="mm"
                status="info"
              />
              <ResultCard
                title={t('calculators.airCurtain.results.nozzleHeight')}
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
                  {t('calculators.airCurtain.results.efficiency')}: {t(`calculators.airCurtain.results.efficiency${result.efficiency.charAt(0).toUpperCase() + result.efficiency.slice(1)}`)}
                </div>
                <div className="text-sm text-steel-gray">
                  {t(`calculators.airCurtain.results.efficiency${result.efficiency.charAt(0).toUpperCase() + result.efficiency.slice(1)}Desc`)}
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
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors
              ${currentStep === 1
                ? 'text-steel-gray cursor-not-allowed opacity-50'
                : 'text-steel-gray hover:text-industrial-gray hover:bg-gray-100'}
            `}
            disabled={currentStep === 1}
            aria-label={currentStep === 4 ? t('common.reset') : t('common.back')}
          >
            {currentStep === 4 ? (
              <>
                <RotateCcw size={18} />
                {t('common.reset') || 'Yeni Hesaplama'}
              </>
            ) : (
              <>
                <ArrowLeft size={18} />
                {t('common.back')}
              </>
            )}
          </button>

          {currentStep < 4 && (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors
                ${canProceed()
                  ? 'bg-primary-navy text-white hover:bg-secondary-blue'
                  : 'bg-gray-200 text-steel-gray cursor-not-allowed'}
              `}
              aria-label={currentStep === 3 ? t('common.calculate') : t('common.next')}
            >
              {currentStep === 3 ? (t('common.calculate') || 'Hesapla') : t('common.next')}
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </CalculatorLayout>
  )
}

export default AirCurtainCalcPage
