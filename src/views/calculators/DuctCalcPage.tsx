import React, { useState, useMemo } from 'react'
import { Wind, Ruler, RotateCcw, Circle, Square } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import {
  CalculatorLayout,
  ResultCard,
  ResultGrid,
  Recommendations,
  InputField,
  RadioGroup
} from '../../components/calculators'
import {
  calculateDuct,
  type DuctType,
  type DuctMaterial
} from '../../lib/hvacCalculations'

const DuctCalcPage: React.FC = () => {
  const { t } = useI18n()

  // Dynamic Options
  const ductTypeOptions = useMemo(() => [
    {
      value: 'circular',
      label: t('calculators.duct.form.round'),
      description: t('calculators.duct.form.roundDesc'),
      icon: <Circle size={24} />
    },
    {
      value: 'rectangular',
      label: t('calculators.duct.form.rectangular'),
      description: t('calculators.duct.form.rectangularDesc'),
      icon: <Square size={24} />
    }
  ], [t])

  const materialOptions = useMemo(() => [
    { value: 'galvanized', label: t('calculators.duct.form.steel'), description: 'Standart' },
    { value: 'pvc', label: t('calculators.duct.form.pvc'), description: 'Low Friction' },
    { value: 'flex', label: t('calculators.duct.form.flex'), description: 'Flexible' }
  ], [t])

  // Form state
  const [airflow, setAirflow] = useState('500')
  const [ductType, setDuctType] = useState<DuctType>('rectangular')
  const [diameter, setDiameter] = useState('200')
  const [width, setWidth] = useState('300')
  const [height, setHeight] = useState('200')
  const [length, setLength] = useState('10')
  const [material, setMaterial] = useState<DuctMaterial>('galvanized')

  // Real-time calculation
  const result = useMemo(() => {
    const flow = parseFloat(airflow) || 0
    const len = parseFloat(length) || 0
    const dia = parseFloat(diameter) || 0
    const w = parseFloat(width) || 0
    const h = parseFloat(height) || 0

    if (flow <= 0 || len <= 0) return null
    if (ductType === 'circular' && dia <= 0) return null
    if (ductType === 'rectangular' && (w <= 0 || h <= 0)) return null

    return calculateDuct({
      airflow: flow,
      ductType,
      diameter: ductType === 'circular' ? dia : undefined,
      width: ductType === 'rectangular' ? w : undefined,
      height: ductType === 'rectangular' ? h : undefined,
      length: len,
      material
    })
  }, [airflow, ductType, diameter, width, height, length, material])

  const reset = () => {
    setAirflow('500')
    setDuctType('rectangular')
    setDiameter('200')
    setWidth('300')
    setHeight('200')
    setLength('10')
    setMaterial('galvanized')
  }

  return (
    <CalculatorLayout
      title={t('calculators.duct.title')}
      description={t('calculators.duct.description')}
      icon={<Ruler size={32} />}
      infoText={t('calculators.duct.infoText')}
    >
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-light-gray shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-navy/10 rounded-lg">
              <Wind className="text-primary-navy" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-industrial-gray">{t('calculators.airCurtain.form.inputSummary')}</h2>
              <p className="text-sm text-steel-gray">{t('calculators.airCurtain.form.applicationPurpose')}</p>
            </div>
          </div>

          <div className="space-y-6">
            <InputField
              label={t('calculators.duct.form.airflow')}
              value={airflow}
              onChange={setAirflow}
              unit="m³/h"
              min={10}
              max={100000}
              step={10}
              tooltip={t('calculators.duct.form.airflowTooltip')}
            />

            <RadioGroup
              label={t('calculators.duct.form.shape')}
              value={ductType}
              onChange={(v) => setDuctType(v as DuctType)}
              options={ductTypeOptions}
              columns={2}
            />

            {ductType === 'circular' ? (
              <InputField
                label={t('calculators.duct.form.diameter')}
                value={diameter}
                onChange={setDiameter}
                unit="mm"
                min={50}
                max={2000}
                step={25}
                tooltip={t('calculators.duct.form.diameterTooltip')}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label={t('calculators.duct.form.width')}
                  value={width}
                  onChange={setWidth}
                  unit="mm"
                  min={100}
                  max={2000}
                  step={50}
                />
                <InputField
                  label={t('calculators.duct.form.height')}
                  value={height}
                  onChange={setHeight}
                  unit="mm"
                  min={100}
                  max={2000}
                  step={50}
                />
              </div>
            )}

            <InputField
              label={t('calculators.duct.form.length')}
              value={length}
              onChange={setLength}
              unit="m"
              min={0.5}
              max={500}
              step={0.5}
              tooltip={t('calculators.duct.form.lengthTooltip')}
            />

            <RadioGroup
              label={t('calculators.duct.form.material')}
              value={material}
              onChange={(v) => setMaterial(v as DuctMaterial)}
              options={materialOptions}
              columns={3}
            />

            <button
              onClick={reset}
              className="flex items-center gap-2 text-sm text-steel-gray hover:text-industrial-gray transition-colors"
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
              <Wind className="text-success-green" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-industrial-gray">{t('calculators.airCurtain.results.title')}</h2>
              <p className="text-sm text-steel-gray">{t('calculators.airCurtain.results.subtitle')}</p>
            </div>
          </div>

          {result ? (
            <>
              <ResultGrid>
                <ResultCard
                  title={t('calculators.duct.results.velocity')}
                  value={result.velocity}
                  unit="m/s"
                  status={result.velocityStatus === 'optimal' ? 'optimal' : 'warning'}
                  large
                  description={result.velocityMessage}
                />
                <ResultCard
                  title={t('calculators.duct.results.specificLoss')}
                  value={result.pressureLossPerMeter}
                  unit="Pa/m"
                  status={result.pressureLossPerMeter > 1.5 ? 'warning' : 'optimal'}
                />
                <ResultCard
                  title={t('calculators.duct.results.totalLoss')}
                  value={result.totalPressureLoss}
                  unit="Pa"
                  status={result.totalPressureLoss > 100 ? 'warning' : 'optimal'}
                />
                {result.equivalentDiameter && (
                  <ResultCard
                    title={t('calculators.duct.results.equivDiameter')}
                    value={result.equivalentDiameter}
                    unit="mm"
                    status="info"
                    description={t('calculators.duct.results.equivDiameterDesc')}
                  />
                )}
              </ResultGrid>

              <Recommendations items={result.recommendations} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Ruler className="text-steel-gray" size={32} />
              </div>
              <p className="text-steel-gray">
                {t('common.notFound')}
              </p>
            </div>
          )}
        </div>
      </div>
    </CalculatorLayout>
  )
}

export default DuctCalcPage
