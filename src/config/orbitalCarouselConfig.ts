/**
 * Döner Tabla (Orbital) 3D Carousel - Ayarlanabilir Konfigürasyon
 * 
 * Makine Mühendisliği Terminolojisi:
 * - radius: Yörünge yarıçapı (mm değil birim, ama aynı mantık)
 * - tilt: Yörünge düzlemi eğimi (derece)
 * - rotationSpeed: Dönüş hızı (rad/saniye mantığı)
 */

export const ORBITAL_CAROUSEL_CONFIG = {
    // ═══════════════════════════════════════════════════════════
    // 📐 GEOMETRİ PARAMETRELERİ
    // ═══════════════════════════════════════════════════════════

    /** Yörünge yarıçapı - kartların merkeze uzaklığı (birim) */
    radius: 7,

    /** Yörünge düzlemi eğimi (derece) - 0=düz, 15=hafif yatık */
    tilt: 10,

    /** Kartların merkeze bakış açısı offset (derece) */
    cardFaceOffset: 0,

    // ═══════════════════════════════════════════════════════════
    // 🔄 HAREKET PARAMETRELERİ
    // ═══════════════════════════════════════════════════════════

    /** Otomatik dönüş hızı (0.01=yavaş, 0.05=orta, 0.1=hızlı) */
    autoRotateSpeed: 0.15,

    /** Dönüş yönü: 1=saat yönü, -1=saat yönü tersi */
    direction: 1,

    /** Hover'da tamamen dursun mu? (true=dur, false=yavaşla) */
    hoverPause: true,

    /** Hover'da yavaşlama oranı (hoverPause=false ise geçerli) */
    hoverSlowdown: 0.2,

    // ═══════════════════════════════════════════════════════════
    // 📷 KAMERA PARAMETRELERİ
    // ═══════════════════════════════════════════════════════════

    /** Kamera merkeze uzaklığı */
    cameraDistance: 14,

    /** Kamera yüksekliği */
    cameraHeight: 1.5,

    /** Kamera alan açısı (Field of View) - derece */
    cameraFOV: 45,

    /** Kamera nefes alma efekti genliği */
    cameraBreathAmplitude: 0.15,

    // ═══════════════════════════════════════════════════════════
    // 🎴 KART PARAMETRELERİ
    // ═══════════════════════════════════════════════════════════

    /** Kart genişliği */
    cardWidth: 2.8,

    /** Kart yüksekliği */
    cardHeight: 3.5,

    /** Hover'da büyütme oranı (%120 = 1.2) */
    hoverScale: 1.2,

    /** Öndeki kartın (merkeze en yakın) büyütme oranı */
    frontScale: 1.15,

    /** Arkadaki kartların küçültme oranı (perspektif) */
    backScale: 0.85,

    /** Float (süzülme) efekti genliği */
    floatIntensity: 0.08,

    /** Hover'da kameraya doğru öne çıkma mesafesi (3D derinlik) */
    hoverZOffset: 1.5,

    // ═══════════════════════════════════════════════════════════
    // ✨ GÖRSEL EFEKTLER
    // ═══════════════════════════════════════════════════════════

    /** Hover'da glow rengi */
    glowColor: '#22d3ee',

    /** Hover'da emissive yoğunluğu */
    emissiveIntensity: 0.4,

    /** Parçacık efekti sayısı */
    particleCount: 100,

    /** Arka plan rengi (degrade desteklenmeyen yerler için yedek) */
    backgroundColor: '#020617',

    /**
     * Sahne arka planı — yumuşak "stüdyo kovuğu" radyal degrade.
     * Merkez-üst hafif aydınlık (ürün bir ışık havuzunda durur) → kenarlara doğru koyu.
     * Düz siyah void yerine derinlik/sahne hissi verir (kara boşlukta yüzme sorununu çözer).
     */
    backgroundGradient:
        'radial-gradient(ellipse 110% 95% at 50% 38%, #2c4163 0%, #14233e 45%, #070c18 100%)',

    /** Zemin yansıması metalikliği — 0.9 ayna çok sert; 0.5 = yumuşak stüdyo zemini */
    floorMetalness: 0.5,
}

export type OrbitalCarouselConfig = typeof ORBITAL_CAROUSEL_CONFIG



