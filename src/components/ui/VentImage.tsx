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
    if (!src || error) return FALLBACK_IMAGES[fallbackType];
    if (src.startsWith('http')) return src;
    if (src.startsWith('/')) return src;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const cleanPath = src.replace(`${supabaseUrl}/storage/v1/object/public/`, '');
      return `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
    }
    return src;
  };

  const finalSrc = getImageUrl();
  
  const { width, height, fill, ...rest } = props;
  
  // Strateji: 
  // 1. Eğer 'fill' varsa, wrapper tam boy kaplar.
  // 2. Eğer boyutlar yoksa ve 'fill' de yoksa, Next.js çökmesini önlemek için varsayılan bir oran verilir.
  const isFillMode = !!fill;
  const needsDefaultSizes = !isFillMode && !width && !height;
  
  // Wrapper sınıfları ve stilleri
  const wrapperClass = `relative overflow-hidden bg-gray-50 flex items-center justify-center ${
    isFillMode ? 'w-full h-full' : ''
  } ${className || ''}`;

  return (
    <div 
      className={wrapperClass} 
      style={{ 
        width: isFillMode ? undefined : (width || (needsDefaultSizes ? '100%' : undefined)), 
        height: isFillMode ? undefined : height 
      }}
    >
      <Image
        {...rest}
        src={finalSrc}
        alt={alt || 'VentHub HVAC'}
        fill={isFillMode}
        width={isFillMode ? undefined : (width || (needsDefaultSizes ? 1200 : undefined))}
        height={isFillMode ? undefined : (height || (needsDefaultSizes ? 800 : undefined))}
        sizes={props.sizes || (isFillMode ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined)}
        className={`transition-all duration-500 ease-in-out ${
          (isLoaded || props.priority) ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-sm'
        } ${isFillMode ? 'object-cover' : 'w-full h-auto'} ${className || ''}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          console.warn(`VentImage: Failed to load -> ${src}`);
          setError(true);
        }}
      />
      
      {!isLoaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 z-0" />
      )}
    </div>
  );
};

export default VentImage;
