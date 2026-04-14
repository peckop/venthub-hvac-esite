import React from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { AlertTriangle, RotateCcw } from 'lucide-react'

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-industrial-gray/5 border border-industrial-gray/10 rounded-2xl min-h-[300px] text-center max-w-2xl mx-auto w-full">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Bileşen Yüklenemedi</h3>
      <p className="text-slate-500 mb-6 max-w-md">
        Görselleştirme veya içerik yüklenirken geçici bir sorun oluştu. 
        WebGL bağlamı kaybedilmiş veya ağ bağlantısı anlık olarak kopmuş olabilir.
      </p>
      
      <div className="bg-slate-100 p-4 rounded-lg w-full mb-6 overflow-x-auto text-left border border-slate-200">
        <p className="text-xs font-mono text-slate-700 break-words">{error instanceof Error ? error.message : String(error)}</p>
      </div>

      <button
        onClick={resetErrorBoundary}
        className="flex items-center gap-2 px-6 py-3 bg-industrial-gray text-white font-medium rounded-xl hover:bg-opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <RotateCcw className="w-4 h-4" />
        Yeniden Dene
      </button>
    </div>
  )
}

interface SafeComponentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onReset?: () => void
}

/**
 * @component SafeComponent
 * @description 3D Modeller, harici iFrame'ler veya karmaşık görsel bileşenler için 
 * güvenli bir kapsama (wrapper) sağlar. React ErrorBoundary yapısını kullanarak, 
 * içerideki bir hata (örn. WebGL Context Kaybı) durumunda tüm uygulamanın çökmesini engeller.
 */
export const SafeComponent: React.FC<SafeComponentProps> = ({ 
  children, 
  fallback,
  onReset 
}) => {
  return (
    <ErrorBoundary 
      FallbackComponent={fallback ? () => <>{fallback}</> : ErrorFallback}
      onReset={() => {
        // Hata durumunda (örn. WebGL çökmesi) bileşeni sıfırlamak için kullanılır.
        console.warn('[SafeComponent] Ağaç yeniden yükleniyor...')
        if (onReset) {
          onReset()
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export default SafeComponent
