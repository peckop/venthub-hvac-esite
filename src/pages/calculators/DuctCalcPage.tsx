import React from 'react'

const DuctCalcPage: React.FC = () => {
  return (
    <section className="py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-industrial-gray mb-4">Kanal — Hız / Tahmini Δp</h1>
        <div className="rounded-xl border border-light-gray p-5 bg-white">
          <div className="flex flex-col md:flex-row gap-4">
            <input className="border border-light-gray rounded-lg p-3 flex-1" placeholder="Debi (m³/h)" />
            <input className="border border-light-gray rounded-lg p-3 flex-1" placeholder="Kanal çapı/ebadı" />
            <input className="border border-light-gray rounded-lg p-3 flex-1" placeholder="Uzunluk (m)" />
          </div>
          <div className="mt-4 p-4 rounded-lg bg-gray-50 border border-light-gray text-sm text-steel-gray">
            Sonuç burada görünecek. (v1 iskelet)
          </div>
        </div>
      </div>
    </section>
  )
}

export default DuctCalcPage
