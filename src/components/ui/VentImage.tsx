import React from 'react';
import Image, { ImageProps } from 'next/image';

interface VentImageProps extends Omit<ImageProps, 'src'> {
  /**
   * Tam URL veya Supabase storage yolu (örn: 'product-images/fan.png')
   */
  src: string | null | undefined;
  /**
   * Görsel yüklenemediğinde veya src boş olduğunda gösterilecek tip
   */
  fallbackType?: 'product' | 'category' | 'brand' | 'generic';
}

const FALLBACK_IMAGES = {
  product: '/images/placeholders/product-placeholder.png',
  category: '/images/placeholders/category-placeholder.png',
  brand: '/images/placeholders/brand-placeholder.png',
  generic: '/images/placeholders/generic-placeholder.png',
};

/**
 * VentHub Profesyonel Görsel Bileşeni (Expert Implementation)
 * 
 * Özellikler:
 * 1. Supabase Storage Entegrasyonu: Path'leri otomatik olarak full URL'e çevirir.
 * 2. Akıllı Fallback: Görsel bulunamadığında veya hata verdiğinde şık bir placeholder gösterir.
 * 3. Performans Odaklı: Next.js Image optimizasyonunu zorunlu kılar (LCP & CLS koruması).
 * 4. UX: Yükleme sırasında yumuşak bir geçiş (transition) sağlar.
 */
export const VentImage: React.FC<VentImageProps> = ({ 
  src, 
  alt, 
  fallbackType = 'generic',
  className,
  ...props 
}) => {
  const [error, setError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // 1. Kaynak kontrolü ve URL inşası
  const getImageUrl = (): string => {
    // Hata durumunda veya kaynak boşsa doğrudan fallback döndür
    if (!src || error) return FALLBACK_IMAGES[fallbackType];

    // Eğer tam bir URL ise (http...) doğrudan döndür
    if (src.startsWith('http')) return src;

    // Eğer projenin kendi public klasöründeyse (/images/...) doğrudan döndür
    if (src.startsWith('/')) return src;

    // Eğer Supabase path ise (örn: 'product-images/fan.png') tam URL'e çevir
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      // Path içinde zaten storage URL'i varsa temizle (duplicate engelleme)
      const cleanPath = src.replace(`${supabaseUrl}/storage/v1/object/public/`, '');
      return `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
    }

    return src;
  };

  const finalSrc = getImageUrl();

  return (
    <div 
      className={`relative overflow-hidden bg-gray-50 flex items-center justify-center ${className || ''}`} 
      style={{ width: props.width, height: props.height }}
    >
      <Image
        {...props}
        src={finalSrc}
        alt={alt || 'VentHub HVAC'}
        className={`transition-all duration-500 ease-in-out ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 blur-sm'
        } ${className || ''}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          console.warn(`VentImage: Failed to load image -> ${src}`);
          setError(true);
        }}
      />
      
      {/* Loading Skeleton Placeholder (Opsiyonel) */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50" />
      )}
    </div>
  );
};

export default VentImage;
