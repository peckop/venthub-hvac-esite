/**
 * HVAC Engineering Calculations Library
 * 
 * Fizik tabanlı mühendislik formülleri
 * Kaynaklar: ASHRAE, ISO 27327-1, NFPA 88A, BS 7346-7
 */

// =============================================================================
// SABITLER
// =============================================================================

/** Standart hava yoğunluğu (kg/m³) @ 20°C, deniz seviyesi */
export const AIR_DENSITY = 1.2

/** Havanın özgül ısısı (kJ/kg·K) */
export const AIR_SPECIFIC_HEAT = 1.005

/** Yerçekimi ivmesi (m/s²) */
export const GRAVITY = 9.81

// =============================================================================
// HAVA PERDESİ HESAPLAMALARI
// =============================================================================

export type AirCurtainApplication = 'comfort' | 'insect' | 'coldRoom'
export type WindCondition = 'none' | 'light' | 'moderate' | 'strong'
export type TrafficIntensity = 'low' | 'medium' | 'high'

interface AirCurtainInput {
    doorWidth: number       // m
    doorHeight: number      // m
    application: AirCurtainApplication
    windCondition: WindCondition
    trafficIntensity: TrafficIntensity
}

interface AirCurtainResult {
    requiredAirflow: number      // m³/h
    nozzleVelocity: number       // m/s
    floorVelocity: number        // m/s
    suggestedPower: number       // W
    nozzleWidth: number          // m (= door width)
    nozzleHeight: number         // mm (typical 50-100mm)
    efficiency: 'optimal' | 'acceptable' | 'marginal'
    recommendations: string[]
}

/**
 * Uygulama tipine göre gerekli nozül çıkış hızı (m/s)
 * Kaynak: klimaglobal.com, airtecnics.com
 */
function getNozzleVelocityRange(application: AirCurtainApplication, doorHeight: number): { min: number; max: number; target: number } {
    /**
     * FİZİKSEL PRENSİP:
     * Hava perdesinin koruma sağlayabilmesi için zemin seviyesinde minimum 2.0-2.5 m/s hıza ulaşması gerekir.
     * Havanın jet akışı mesafe ile (doorHeight) hız kaybeder.
     * Standart Kabul: V_çıkış = V_zemin / (0.25 - 0.30) [H=2.5m için]
     */

    // Montaj yüksekliği arttıkça hava jetinin direnci kırması için çıkış hızı logaritmik artmalıdır
    const baselineHeight = 2.5
    const heightFactor = Math.max(1.0, 1.0 + (doorHeight - baselineHeight) * 0.2)

    switch (application) {
        case 'comfort':
            // Konfor uygulamalarında zemin hedefi ~2.2 m/s
            return { min: 7 * heightFactor, max: 10 * heightFactor, target: 8.5 * heightFactor }
        case 'insect':
            // Böcek kontrolünde zemin hedefi ~3.0 m/s
            return { min: 10 * heightFactor, max: 14 * heightFactor, target: 12 * heightFactor }
        case 'coldRoom':
            // Soğuk oda için zemin hedefi ~2.8 m/s (Basınç farkı yüksek)
            return { min: 11 * heightFactor, max: 15 * heightFactor, target: 13 * heightFactor }
    }
}

/**
 * Zemin seviyesinde hedef hız (m/s)
 * Kaynak: klimaglobal.com
 */
function getTargetFloorVelocity(application: AirCurtainApplication): number {
    switch (application) {
        case 'comfort': return 2.25  // 2.0-2.5 m/s
        case 'insect': return 2.75   // 2.5-3.0 m/s
        case 'coldRoom': return 2.5  // ≥2.5 m/s
    }
}

/**
 * Rüzgar ve trafik düzeltme faktörü
 */
function getAdjustmentFactor(wind: WindCondition, traffic: TrafficIntensity): number {
    let factor = 1.0

    // Rüzgar faktörü
    switch (wind) {
        case 'light': factor *= 1.1; break
        case 'moderate': factor *= 1.2; break
        case 'strong': factor *= 1.35; break
    }

    // Trafik faktörü
    switch (traffic) {
        case 'medium': factor *= 1.1; break
        case 'high': factor *= 1.25; break
    }

    return factor
}

/**
 * Hava Perdesi Boyutlandırma Hesaplaması
 * 
 * Formül: CFM = Hız × Çıkış Alanı
 * Çıkış Alanı = Kapı Genişliği × Nozül Yüksekliği (tipik 50-100mm)
 */
export function calculateAirCurtain(input: AirCurtainInput): AirCurtainResult {
    const { doorWidth, doorHeight, application, windCondition, trafficIntensity } = input

    /**
     * FİZİKSEL BOYUTLANDIRMA (ISO 27327-1 Yaklaşımı)
     * Q = V * W * d * 3600
     * d (nozül derinliği) standart ticari cihazlarda 0.03m - 0.05m arasındadır.
     * İhtiyaç hesabında fiziksel limitler (jet kohezyonu) gereği 40mm baz alınır.
     */
    const nozzleWidth = doorWidth
    const nozzleDepth = 0.042 // 42mm sabit fiziksel parametre
    const nozzleArea = nozzleWidth * nozzleDepth // m²

    // Gerekli çıkış hızı (Fiziksel bariyer gereksinimi)
    const velocityRange = getNozzleVelocityRange(application, doorHeight)

    // Çevresel faktör katsayıları
    const adjustmentFactor = getAdjustmentFactor(windCondition, trafficIntensity)

    // Bariyeri korumak için gereken minimum fiziksel hız
    const nozzleVelocity = velocityRange.target * adjustmentFactor

    // Gerekli Hava Debisi: Q = V * A * 3600
    const airflowM3s = nozzleVelocity * nozzleArea
    const requiredAirflow = Math.round(airflowM3s * 3600)

    // Zemin hızı tahmini (Jet hızı sönümleme formülü: Vh = Vo * (1 / (1 + k*H/d)))
    // Basitleştirilmiş fiziksel sönümleme:
    const floorVelocity = nozzleVelocity * (1 / (1 + 0.12 * (doorHeight / nozzleDepth)))
    const targetFloor = getTargetFloorVelocity(application)

    // Motor Gücü (Fiziksel İş: P = Q * dP)
    // dP (Fark Basınç) ve fan verimliliği (eta ~0.55)
    // Ampirik: P = 0.5 * rho * V^2 * Q / eta
    const suggestedPower = Math.round(0.5 * AIR_DENSITY * Math.pow(nozzleVelocity, 2) * airflowM3s / 0.55)

    // Verimlilik Kontrolü (Fiziksel bariyer yeterli mi?)
    let efficiency: 'optimal' | 'acceptable' | 'marginal' = 'optimal'
    if (floorVelocity < targetFloor * 0.75) efficiency = 'marginal'
    else if (floorVelocity < targetFloor * 0.9) efficiency = 'acceptable'

    const recommendations: string[] = []
    if (doorHeight > 3.0) recommendations.push('Yüksek tavan montajı için özel tasarım jet akış panelleri gereklidir')
    if (windCondition === 'strong') recommendations.push('Şiddetli rüzgar için açılı montaj veya çift hüzmeli koruma önerilir')
    if (doorWidth > 2.5) recommendations.push('Geniş kapı açıklığı için senkronize çalışan çoklu ünite kurulumu yapılmalıdır')

    return {
        requiredAirflow,
        nozzleVelocity: Math.round(nozzleVelocity * 10) / 10,
        floorVelocity: Math.round(floorVelocity * 100) / 100,
        suggestedPower,
        nozzleWidth,
        nozzleHeight: nozzleDepth * 1000, // mm cinsinden derinlik
        efficiency,
        recommendations
    }
}

// =============================================================================
// KANAL HESAPLAMALARI
// =============================================================================

export type DuctType = 'circular' | 'rectangular'
export type DuctMaterial = 'galvanized' | 'pvc' | 'flex'

interface DuctInput {
    airflow: number           // m³/h
    ductType: DuctType
    diameter?: number         // mm (dairesel için)
    width?: number            // mm (dikdörtgen için)
    height?: number           // mm (dikdörtgen için)
    length: number            // m
    material: DuctMaterial
}

interface DuctResult {
    velocity: number              // m/s
    velocityStatus: 'low' | 'optimal' | 'high' | 'critical'
    velocityMessage: string
    pressureLossPerMeter: number  // Pa/m
    totalPressureLoss: number     // Pa
    equivalentDiameter?: number   // mm (dikdörtgen için)
    suggestedDimensions: { width: number; height: number }[]
    recommendations: string[]
}

/**
 * Malzeme pürüzlülük faktörü (mm)
 */
function getRoughness(material: DuctMaterial): number {
    switch (material) {
        case 'galvanized': return 0.15
        case 'pvc': return 0.01
        case 'flex': return 3.0
    }
}

/**
 * Dikdörtgen kanal eşdeğer çapı
 * Formül: Deq = (1.30 × (w × h)^0.625) / (w + h)^0.25
 */
function calculateEquivalentDiameter(width: number, height: number): number {
    const w = width / 1000  // mm → m
    const h = height / 1000
    const deq = (1.30 * Math.pow(w * h, 0.625)) / Math.pow(w + h, 0.25)
    return deq * 1000 // m → mm
}

/**
 * Kesit alanı hesaplama (m²)
 */
function calculateArea(ductType: DuctType, diameter?: number, width?: number, height?: number): number {
    if (ductType === 'circular' && diameter) {
        const r = diameter / 2000 // mm → m, radius
        return Math.PI * r * r
    }
    if (ductType === 'rectangular' && width && height) {
        return (width / 1000) * (height / 1000)
    }
    return 0
}

/**
 * Basınç kaybı hesaplama (Darcy-Weisbach basitleştirilmiş)
 * ΔP/L = f × (ρ × V²) / (2 × D)
 * f ≈ 0.02 (türbülanslı akış, pürüzsüz kanal)
 */
function calculatePressureLoss(velocity: number, diameter: number, roughness: number): number {
    // Reynolds sayısı bazlı basit yaklaşım
    const D = diameter / 1000 // mm → m
    const f = 0.02 + (roughness / 1000) * 0.1 // Basitleştirilmiş sürtünme faktörü
    const deltaP = f * (AIR_DENSITY * velocity * velocity) / (2 * D)
    return deltaP // Pa/m
}

/**
 * Hız değerlendirmesi
 * Kaynak: ASHRAE önerileri
 */
function evaluateVelocity(velocity: number): { status: 'low' | 'optimal' | 'high' | 'critical'; message: string } {
    if (velocity < 2) {
        return { status: 'low', message: 'Hız çok düşük - hava dağılımı yetersiz olabilir' }
    }
    if (velocity < 4) {
        return { status: 'optimal', message: 'Branşman kanal için optimal hız' }
    }
    if (velocity < 8) {
        return { status: 'optimal', message: 'Ana kanal için optimal hız' }
    }
    if (velocity < 12) {
        return { status: 'high', message: 'Hız yüksek - gürültü riski' }
    }
    return { status: 'critical', message: 'Hız kritik seviyede - sistem verimsizliği ve yüksek gürültü' }
}

/**
 * Hedef hız için alternatif ebat önerileri
 */
function suggestDimensions(airflow: number, targetVelocity: number = 6): { width: number; height: number }[] {
    const Q = airflow / 3600 // m³/h → m³/s
    const targetArea = Q / targetVelocity // m²

    const suggestions: { width: number; height: number }[] = []
    const standardSizes = [100, 150, 200, 250, 300, 400, 500, 600, 800, 1000]

    for (const w of standardSizes) {
        const h = Math.round((targetArea * 1000000) / w) // mm
        const closestH = standardSizes.reduce((prev, curr) =>
            Math.abs(curr - h) < Math.abs(prev - h) ? curr : prev
        )
        if (closestH >= 100 && closestH <= 1000) {
            const actualArea = (w / 1000) * (closestH / 1000)
            const actualVelocity = Q / actualArea
            if (actualVelocity >= 4 && actualVelocity <= 8 && !suggestions.some(s => s.width === w && s.height === closestH)) {
                suggestions.push({ width: w, height: closestH })
            }
        }
        if (suggestions.length >= 3) break
    }

    return suggestions
}

/**
 * Kanal Boyutlandırma Hesaplaması
 */
export function calculateDuct(input: DuctInput): DuctResult {
    const { airflow, ductType, diameter, width, height, length, material } = input

    const Q = airflow / 3600 // m³/h → m³/s
    const area = calculateArea(ductType, diameter, width, height)
    const velocity = area > 0 ? Q / area : 0

    const { status: velocityStatus, message: velocityMessage } = evaluateVelocity(velocity)

    // Eşdeğer çap
    let equivalentDiameter: number | undefined
    let effectiveDiameter: number

    if (ductType === 'circular' && diameter) {
        effectiveDiameter = diameter
    } else if (ductType === 'rectangular' && width && height) {
        equivalentDiameter = calculateEquivalentDiameter(width, height)
        effectiveDiameter = equivalentDiameter
    } else {
        effectiveDiameter = 200 // default
    }

    // Basınç kaybı
    const roughness = getRoughness(material)
    const pressureLossPerMeter = calculatePressureLoss(velocity, effectiveDiameter, roughness)
    const totalPressureLoss = pressureLossPerMeter * length

    // Alternatif ebatlar
    const suggestedDimensions = suggestDimensions(airflow)

    // Öneriler
    const recommendations: string[] = []
    if (velocityStatus === 'high' || velocityStatus === 'critical') {
        recommendations.push('Kanal ebadını artırarak hızı düşürün')
    }
    if (velocityStatus === 'low') {
        recommendations.push('Kanal ebadını küçülterek hızı artırın')
    }
    if (material === 'flex' && length > 3) {
        recommendations.push('Uzun mesafelerde flex kanal yerine rijit kanal tercih edin')
    }
    if (totalPressureLoss > 100) {
        recommendations.push('Yüksek basınç kaybı - fan seçiminde dikkat edin')
    }

    return {
        velocity: Math.round(velocity * 100) / 100,
        velocityStatus,
        velocityMessage,
        pressureLossPerMeter: Math.round(pressureLossPerMeter * 100) / 100,
        totalPressureLoss: Math.round(totalPressureLoss * 100) / 100,
        equivalentDiameter: equivalentDiameter ? Math.round(equivalentDiameter) : undefined,
        suggestedDimensions,
        recommendations
    }
}

// =============================================================================
// HRV/ERV HESAPLAMALARI
// =============================================================================

export type BuildingType = 'residential' | 'office' | 'commercial' | 'industrial'
export type RecoveryType = 'hrv' | 'erv'
export type ClimateZone = 'cold' | 'temperate' | 'hot'

export interface HRVInput {
    recoveryType: RecoveryType
    buildingType: BuildingType
    climateZone: ClimateZone
    area: number                // m²
    occupancy: number           // kişi sayısı
    operatingHoursPerDay: number
    sensibleEfficiency: number   // %
    latentEfficiency: number     // %
    electricityCostPerKWh: number
}

export interface HRVResult {
    requiredAirflow: number         // m³/h
    airflowPerPerson: number        // m³/h·kişi
    heatingRecovery: number        // W
    coolingRecovery: number        // W
    totalEfficiency: number         // %
    annualEnergySaving: number      // kWh/yıl
    annualCostSaving: number        // ₺/yıl
    co2Reduction: number            // kg/yıl
    paybackPeriod: number           // yıl (paybackYears aliased for compatibility)
    recommendations: string[]
}

/**
 * Bina tipine göre kişi başı taze hava ihtiyacı (m³/h·kişi)
 * Kaynak: ASHRAE 62.1
 */
function getAirflowPerPerson(buildingType: BuildingType): number {
    switch (buildingType) {
        case 'residential': return 25    // ~7 L/s
        case 'office': return 36         // ~10 L/s
        case 'commercial': return 45     // ~12.5 L/s
        case 'industrial': return 54     // ~15 L/s
    }
}

/**
 * Bina tipine göre alan başı havalandırma (m³/h·m²)
 * Kaynak: ASHRAE 62.1
 */
function getAirflowPerArea(buildingType: BuildingType): number {
    switch (buildingType) {
        case 'residential': return 1.08  // 0.3 L/s·m²
        case 'office': return 1.44       // 0.4 L/s·m²
        case 'commercial': return 2.16   // 0.6 L/s·m²
        case 'industrial': return 3.6    // 1.0 L/s·m²
    }
}

/**
 * HRV Isı Geri Kazanımı Hesaplaması
 * 
 * Formül: Q = ṁ × Cp × ΔT × η
 * Q (W) = Debi (m³/h) × 0.34 × ΔT × Verimlilik
 * 0.34 = ρ × Cp / 3600 = 1.2 × 1005 / 3600
 */
export function calculateHRV(input: HRVInput): HRVResult {
    const {
        recoveryType,
        buildingType,
        occupancy,
        area,
        sensibleEfficiency,
        latentEfficiency,
        operatingHoursPerDay,
        electricityCostPerKWh
    } = input

    // Gerekli hava debisi (kişi bazlı + alan bazlı)
    const airflowPerPerson = getAirflowPerPerson(buildingType)
    const airflowPerArea = getAirflowPerArea(buildingType)
    const requiredAirflow = Math.max(
        occupancy * airflowPerPerson,
        area * airflowPerArea
    )

    // Average values for calculation
    const efficiency = sensibleEfficiency / 100
    const winterDeltaT = 20 // Standard indoor vs outdoor cold
    const summerDeltaT = 10 // Standard indoor vs outdoor hot

    // Isı kazanımı (W)
    const heatingRecovery = requiredAirflow * 0.34 * winterDeltaT * efficiency
    const coolingRecovery = requiredAirflow * 0.34 * summerDeltaT * (recoveryType === 'erv' ? latentEfficiency / 100 : efficiency)

    // Yıllık enerji tasarrufu (kWh)
    const totalHours = operatingHoursPerDay * 300 // assume 300 days
    const annualEnergySaving = Math.round(((heatingRecovery + coolingRecovery) * totalHours) / 1000)

    // Maliyet tasarrufu (₺/yıl)
    const annualCostSaving = Math.round(annualEnergySaving * electricityCostPerKWh)

    // CO2 azaltımı
    const co2Reduction = Math.round(annualEnergySaving * 0.45)

    // Geri ödeme süresi
    const estimatedDeviceCost = requiredAirflow * 20
    const paybackPeriod = annualCostSaving > 0 ? Math.round((estimatedDeviceCost / annualCostSaving) * 10) / 10 : 99

    return {
        requiredAirflow: Math.round(requiredAirflow),
        airflowPerPerson: Math.round(airflowPerPerson),
        heatingRecovery: Math.round(heatingRecovery),
        coolingRecovery: Math.round(coolingRecovery),
        totalEfficiency: sensibleEfficiency,
        annualEnergySaving,
        annualCostSaving,
        co2Reduction,
        paybackPeriod,
        recommendations: []
    }
}

// =============================================================================
// JET FAN HESAPLAMALARI
// =============================================================================

export type JetFanApplication = 'parking' | 'tunnel'
export type JetFanApplicationType = JetFanApplication
export type JetFanMode = 'normal' | 'smoke'

export interface JetFanInput {
    applicationType: JetFanApplicationType
    ventilationMode: JetFanMode
    length: number
    width: number
    height: number
    carCapacity: number
    trafficFlowPerHour: number
}

export interface JetFanResult {
    volume: number
    requiredAirflow: number
    ach: number
    totalThrust: number
    fanCount: number
    recommendedSpacing: number
    installationFactor: number
    recommendations: string[]
}

/**
 * Uygulama ve moda göre ACH değeri
 * Kaynak: NFPA 88A, BS 7346-7
 */
function getRequiredACH(application: JetFanApplication, mode: JetFanMode): number {
    if (mode === 'smoke') {
        return application === 'parking' ? 10 : 12 // Duman tahliye
    }
    return application === 'parking' ? 6 : 8 // Normal havalandırma
}

/**
 * Tipik jet fan özellikleri
 */
const TYPICAL_JET_FAN = {
    thrust: 25,       // N (tek fan)
    airflow: 3500,    // m³/h
    power: 300,       // W
    diameter: 0.4     // m
}

export function calculateJetFan(input: JetFanInput): JetFanResult {
    const { length, width, height, applicationType, ventilationMode } = input

    // Hacim hesaplama
    const volume = length * width * height

    // Gerekli ACH
    const ach = getRequiredACH(applicationType, ventilationMode)

    // Gerekli hava debisi (m³/h)
    const requiredAirflow = volume * ach

    // Gerekli toplam itki (N)
    const targetVelocity = ventilationMode === 'smoke' ? 2.0 : 1.5
    const massFlowRate = AIR_DENSITY * (requiredAirflow / 3600)
    const totalThrust = massFlowRate * targetVelocity

    // Kurulum faktörü
    const installationFactor = 0.75

    // Önerilen fan sayısı
    const fanCount = Math.ceil((totalThrust / installationFactor) / TYPICAL_JET_FAN.thrust)

    // Fan aralığı
    const recommendedSpacing = fanCount > 1 ? length / (fanCount + 1) : length / 2

    return {
        volume: Math.round(volume),
        requiredAirflow: Math.round(requiredAirflow),
        ach,
        totalThrust: Math.round(totalThrust * 10) / 10,
        fanCount,
        recommendedSpacing: Math.round(recommendedSpacing * 10) / 10,
        installationFactor,
        recommendations: []
    }
}

// =============================================================================
// YARDIMCI FONKSİYONLAR
// =============================================================================

/**
 * Birim dönüşümleri
 */
export const UnitConversion = {
    // Debi
    m3hToCfm: (m3h: number) => m3h * 0.5886,
    cfmToM3h: (cfm: number) => cfm / 0.5886,

    // Sıcaklık
    celsiusToFahrenheit: (c: number) => (c * 9 / 5) + 32,
    fahrenheitToCelsius: (f: number) => (f - 32) * 5 / 9,

    // Basınç
    paToInWg: (pa: number) => pa * 0.00401865,
    inWgToPa: (inWg: number) => inWg / 0.00401865,

    // Hız
    msTofpm: (ms: number) => ms * 196.85,
    fpmToMs: (fpm: number) => fpm / 196.85,

    // Uzunluk
    mmToInch: (mm: number) => mm * 0.03937,
    inchToMm: (inch: number) => inch / 0.03937
}



