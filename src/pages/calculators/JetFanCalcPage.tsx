import React from 'react'

const JetFanCalcPage: React.FC = () => {
  return (
    <section className="py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-industrial-gray mb-4">Jet Fan — Ön Boyutlandırma</h1>
        <div className="rounded-xl border border-light-gray p-5 bg-white">
          <div className="flex flex-col md:flex-row gap-4">
            <input className="border border-light-gray rounded-lg p-3 flex-1" placeholder="Uzunluk (m)" />
            <input className="border border-light-gray rounded-lg p-3 flex-1" placeholder="Genişlik (m)" />
            <input className="border border-light-gray rounded-lg p-3 flex-1" placeholder="Yükseklik (m)" />
            <input className="border border-light-gray rounded-lg p-3 flex-1" placeholder="ACH" />
          </div>
          <div className="mt-4 p-4 rounded-lg bg-gray-50 border border-light-gray text-sm text-steel-gray">
            Sonuç burada görünecek. (v1 iskelet)
          </div>
        </div>
      </div>
    </section>
  )
}

export default JetFanCalcPage
