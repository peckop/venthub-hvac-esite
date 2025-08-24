import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const ReturnsPage: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-steel-gray hover:text-primary-navy transition-colors text-sm">
          <ArrowLeft size={18} className="mr-1" /> Geri
        </button>
      </div>
      <h1 className="text-3xl font-bold text-industrial-gray mb-6">İade & Değişim</h1>
      <div className="bg-white rounded-xl border border-light-gray p-6 space-y-4 text-steel-gray">
        <p>14 gün içinde cayma hakkınızı kullanabilirsiniz. Ürün, faturası ve tüm aksesuarları ile birlikte, kullanılmamış ve yeniden satılabilir durumda olmalıdır.</p>
        <p>İade talebinizi sipariş numarası ile destek ekibimize iletin. Onay sonrasında kargo yönlendirmesi sağlanacaktır.</p>
      </div>
    </div>
  )
}

export default ReturnsPage

