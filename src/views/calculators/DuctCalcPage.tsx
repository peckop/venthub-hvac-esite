import React, { useState, useMemo } from 'react'
import { Wind, Ruler, RotateCcw, Circle, Square } from 'lucide-react'
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

// Kanal tipi seçenekleri
const DUCT_TYPE_OPTIONS = [
  {
    value: 'circular',
    label: 'Dairesel',
    description: 'Spiral veya kaynaklı boru',
    icon: <Circle size={24} />
  },
  {
    value: 'rectangular',
    label: 'Dikdörtgen',
    description: 'Köşeli kanal',
    icon: <Square size={24} />
  }
]

// Malzeme seçenekleri
const MATERIAL_OPTIONS = [
  { value: 'galvanized', label: 'Galvaniz Sac', description: 'Standart' },
  { value: 'pvc', label: 'PVC', description: 'Düşük sürtünme' },
  { value: 'flex', label: 'Flex Kanal', description: 'Esnek bağlantı' }
]

const DuctCalcPage: React.FC = () => {
  // Form durumu
  const [airflow, setAirflow] = useState('500')
  const [ductType, setDuctType] = useState<DuctType>('rectangular')
  const [diameter, setDiameter] = useState('200')
  const [width, setWidth] = useState('300')
  const [height, setHeight] = useState('200')
  const [length, setLength] = useState('10')
  const [material, setMaterial] = useState<DuctMaterial>('galvanized')

  // Gerçek zamanlı hesaplama
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

  // Hız durumu rengi
  const getVelocityStatus = (status: string | undefined): 'optimal' | 'acceptable' | 'warning' | 'critical' => {
    switch (status) {
      case 'optimal': return 'optimal'
      case 'low': return 'warning'
      case 'high': return 'warning'
      case 'critical': return 'critical'
      default: return 'acceptable'
    }
  }

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
      title="Kanal Hesap Makinesi"
      description="Hava kanalı hız hesabı ve basınç kaybı tahmini"
      icon={<Ruler size={32} />}
      infoText="Debi ve kanal boyutlarına göre hava hızını ve tahmini basınç kaybını hesaplar. ASHRAE standartlarına uygun öneriler sunar."
    >
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Sol Panel - Girdiler */}
        <div className="bg-white rounded-2xl border border-light-gray shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-navy/10 rounded-lg">
              <Wind className="text-primary-navy" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-industrial-gray">Kanal Parametreleri</h2>
              <p className="text-sm text-steel-gray">Değerleri girerek anlık sonuç alın</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Debi */}
            <InputField
              label="Hava Debisi"
              value={airflow}
              onChange={setAirflow}
              unit="m³/h"
              min={10}
              max={100000}
              step={10}
              tooltip="Kanaldan geçmesi gereken hava miktarı"
            />

            {/* Kanal Tipi */}
            <RadioGroup
              label="Kanal Tipi"
              value={ductType}
              onChange={(v) => setDuctType(v as DuctType)}
              options={DUCT_TYPE_OPTIONS}
              columns={2}
            />

            {/* Boyutlar - Tip'e göre */}
            {ductType === 'circular' ? (
              <InputField
                label="Kanal Çapı"
                value={diameter}
                onChange={setDiameter}
                unit="mm"
                min={50}
                max={2000}
                step={25}
                tooltip="İç çap (50-2000 mm)"
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Genişlik (a)"
                  value={width}
                  onChange={setWidth}
                  unit="mm"
                  min={100}
                  max={2000}
                  step={50}
                />
                <InputField
                  label="Yükseklik (b)"
                  value={height}
                  onChange={setHeight}
                  unit="mm"
                  min={100}
                  max={2000}
                  step={50}
                />
              </div>
            )}

            {/* Uzunluk */}
            <InputField
              label="Kanal Uzunluğu"
              value={length}
              onChange={setLength}
              unit="m"
              min={0.5}
              max={500}
              step={0.5}
              tooltip="Toplam kanal uzunluğu"
            />

            {/* Malzeme */}
            <RadioGroup
              label="Kanal Malzemesi"
              value={material}
              onChange={(v) => setMaterial(v as DuctMaterial)}
              options={MATERIAL_OPTIONS}
              columns={3}
            />

            {/* Reset Button */}
            <button
              onClick={reset}
              className="flex items-center gap-2 text-sm text-steel-gray hover:text-industrial-gray transition-colors"
            >
              <RotateCcw size={16} />
              Değerleri Sıfırla
            </button>
          </div>

          {/* SVG Diagram */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex justify-center">
              <svg viewBox="0 0 240 100" className="w-full max-w-xs">
                {ductType === 'circular' ? (
                  <>
                    {/* Circular Duct */}
                    <ellipse cx="40" cy="50" rx="25" ry="25" fill="none" stroke="#1C3D5A" strokeWidth="2" />
                    <ellipse cx="200" cy="50" rx="25" ry="25" fill="none" stroke="#1C3D5A" strokeWidth="2" />
                    <line x1="40" y1="25" x2="200" y2="25" stroke="#1C3D5A" strokeWidth="2" />
                    <line x1="40" y1="75" x2="200" y2="75" stroke="#1C3D5A" strokeWidth="2" />

                    {/* Airflow Arrow */}
                    <path d="M80 50 L160 50" stroke="#0EA5E9" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#0EA5E9" />
                      </marker>
                    </defs>

                    {/* Diameter */}
                    <line x1="40" y1="25" x2="40" y2="75" stroke="#6B7280" strokeWidth="1" strokeDasharray="3,3" />
                    <text x="30" y="52" textAnchor="middle" className="text-[8px] fill-steel-gray">Ø{diameter}</text>
                  </>
                ) : (
                  <>
                    {/* Rectangular Duct */}
                    <rect x="15" y="25" width="50" height="50" fill="none" stroke="#1C3D5A" strokeWidth="2" />
                    <rect x="175" y="25" width="50" height="50" fill="none" stroke="#1C3D5A" strokeWidth="2" />
                    <line x1="65" y1="25" x2="175" y2="25" stroke="#1C3D5A" strokeWidth="2" />
                    <line x1="65" y1="75" x2="175" y2="75" stroke="#1C3D5A" strokeWidth="2" />
                    <line x1="65" y1="25" x2="175" y2="25" stroke="#1C3D5A" strokeWidth="2" />

                    {/* Airflow Arrow */}
                    <path d="M80 50 L160 50" stroke="#0EA5E9" strokeWidth="2" markerEnd="url(#arrowhead2)" />
                    <defs>
                      <marker id="arrowhead2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#0EA5E9" />
                      </marker>
                    </defs>

                    {/* Dimensions */}
                    <text x="40" y="85" textAnchor="middle" className="text-[8px] fill-steel-gray">{width}×{height}</text>
                  </>
                )}

                {/* Length */}
                <text x="120" y="95" textAnchor="middle" className="text-[8px] fill-steel-gray">L = {length} m</text>
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
              <p className="text-sm text-steel-gray">Anlık güncellenmiş değerler</p>
            </div>
          </div>

          {result ? (
            <>
              <ResultGrid>
                <ResultCard
                  title="Hava Hızı"
                  value={result.velocity}
                  unit="m/s"
                  status={getVelocityStatus(result.velocityStatus)}
                  large
                  description={result.velocityMessage}
                />
                <ResultCard
                  title="Basınç Kaybı (Özgül)"
                  value={result.pressureLossPerMeter}
                  unit="Pa/m"
                  status={result.pressureLossPerMeter > 1.5 ? 'warning' : 'optimal'}
                />
                <ResultCard
                  title="Toplam Basınç Kaybı"
                  value={result.totalPressureLoss}
                  unit="Pa"
                  status={result.totalPressureLoss > 100 ? 'warning' : 'optimal'}
                />
                {result.equivalentDiameter && (
                  <ResultCard
                    title="Eşdeğer Çap"
                    value={result.equivalentDiameter}
                    unit="mm"
                    status="info"
                    description="Dairesel kanal eşdeğeri"
                  />
                )}
              </ResultGrid>

              {/* Alternatif Ebatlar */}
              {result.suggestedDimensions.length > 0 && (
                <div className="mt-6 p-4 bg-secondary-blue/5 rounded-xl">
                  <h4 className="font-medium text-industrial-gray mb-3">Alternatif Ebat Önerileri</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestedDimensions.map((dim, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setWidth(dim.width.toString())
                          setHeight(dim.height.toString())
                        }}
                        className="px-3 py-2 bg-white border border-secondary-blue/30 rounded-lg text-sm hover:bg-secondary-blue/10 transition-colors"
                      >
                        {dim.width} × {dim.height} mm
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Recommendations items={result.recommendations} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Ruler className="text-steel-gray" size={32} />
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

export default DuctCalcPage



