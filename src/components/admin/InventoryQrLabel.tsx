import toast from 'react-hot-toast'

interface QrLabelProps {
  product_id: string
  name: string
  warehouse_location?: string | null
  physical_stock: number
}

export const printQrLabel = async (r: QrLabelProps, setPrintingQr: (v: boolean) => void) => {
  try {
    setPrintingQr(true)
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(r.product_id)}`

    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    document.body.appendChild(iframe)

    const safeName = (r.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const safeSku = r.product_id.slice(0, 8).toUpperCase().replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const safeLoc = (r.warehouse_location || '-').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Etiket Yazdir - ${safeSku}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap');
          @page {
            margin: 0;
            size: auto;
          }
          body {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", 'Inter', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            min-height: 100vh;
            text-align: center;
            background: #f8fafc;
            color: black;
          }
          .card-wrapper {
            width: 100%;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
          }
          .card {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 40px;
            width: 100%;
            max-width: 450px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          }
          .qr-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
          }
          .qr {
            width: 180px;
            height: 180px;
            display: block;
          }
          .title {
            font-size: 20px;
            font-weight: 800;
            letter-spacing: -0.5px;
            line-height: 1.3;
            margin: 0 0 24px 0;
            text-transform: uppercase;
            color: #0f172a;
          }
          .separator {
            width: 100%;
            height: 2px;
            background-color: #e2e8f0;
            margin: 24px 0;
          }
          .meta-grid {
            display: flex;
            width: 100%;
            justify-content: space-between;
            margin-bottom: 32px;
          }
          .meta-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 50%;
          }
          .meta-label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 1px;
            margin-bottom: 6px;
          }
          .meta-value {
            font-weight: 800;
            font-size: 18px;
            color: #0f172a;
          }
          .meta-footer {
            font-size: 15px;
            font-weight: 800;
            text-transform: uppercase;
            background-color: #f1f5f9;
            color: #0f172a;
            padding: 14px 24px;
            border-radius: 8px;
            border: 2px dashed #cbd5e1;
            display: inline-block;
          }
          @media print {
            body { background: white; }
            .card-wrapper { padding: 0; flex-direction: column; justify-content: flex-start; align-items: flex-start; }
            .card { border: none; box-shadow: none; padding: 0; max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="card-wrapper">
          <div class="card">
            <div class="qr-wrapper">
              <img src="${url}" class="qr" onload="window.print();" alt="QR Code" />
            </div>
            <div class="title">${safeName}</div>
            <div class="separator"></div>
            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label">SKU Kodu</span>
                <span class="meta-value">${safeSku}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Depo Rafı</span>
                <span class="meta-value">${safeLoc}</span>
              </div>
            </div>
            <div class="meta-footer">
              MEVCUT STOK: ${r.physical_stock} ADET
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const doc = iframe.contentWindow?.document
    if (doc) {
      doc.open()
      doc.write(htmlContent)
      doc.close()
    }

    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe)
      }
    }, 5000)

  } catch {
    toast.error('Etiket oluşturulamadı')
  } finally {
    setPrintingQr(false)
  }
}
