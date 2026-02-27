import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product } from './supabase';
import { LOGOS } from './pdfAssets';
import { formatCurrency } from '../i18n/format';

/**
 * PDF Üretim Servisi (Client-side)
 * @param product - PDF'i üretilecek ürün
 * @param imageUrl - Ürün görseli (Zorunlu değil, opsiyonel)
 * @param translateKey - Yerelleştirme için (örn. Teknik terimleri Türkçeleştirmek için)
 */
export async function generateProductDatasheet(
    product: Product,
    imageUrl?: string,
    translateKey?: (key: string) => string
): Promise<void> {

    // A4 Portrait boyutlarında oluştur.
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Not: Standart jsPDF fontlarında Türkçe Karakter (ş, ğ, ı vb.) sorun çıkarabilir.
    // Gerçek projede base64 edilmiş Roboto, Inter gibi bir fontu vfs'e eklemek gerekir.
    // Örn: doc.addFileToVFS("Roboto-Regular.ttf", base64FontString);
    // doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    // doc.setFont("Roboto");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Renk Paleti (VentHub Kurumsal)
    const colors = {
        primaryNsavy: '#0b1e36',
        secondaryBlue: '#1c64f2',
        industrialGray: '#2d333a',
        lightGray: '#f8fafc',
        steelGray: '#64748b',
        white: '#ffffff',
    };

    // ----- HEADER (ÜST BİLGİ) -----
    // Arka plan bandı
    doc.setFillColor(colors.primaryNsavy);
    doc.rect(0, 0, pageWidth, 28, 'F');

    // VentHub Başlık (Beyaz)
    doc.setTextColor(colors.white);
    doc.setFontSize(18);
    doc.text('VentHub Teknik Föy', 14, 18);

    // Sağ üst köşe Marka / Tarih
    doc.setFontSize(10);
    doc.text(new Date().toLocaleDateString('tr-TR'), pageWidth - 14, 18, { align: 'right' });


    // ----- ÜRÜN BİLGİLERİ (İSİM & MARKA) -----
    let currentY = 40;

    doc.setTextColor(colors.primaryNsavy);
    doc.setFontSize(16);
    // Uzun isimleri böl (wrap)
    const splitTitle = doc.splitTextToSize(product.name, pageWidth - 28);
    doc.text(splitTitle, 14, currentY);
    currentY += (splitTitle.length * 7) + 2;

    doc.setFontSize(11);
    doc.setTextColor(colors.steelGray);
    doc.text(`Marka: ${product.brand} | Model: ${product.model_code || product.sku}`, 14, currentY);
    currentY += 15;


    // ----- ÜRÜN GÖRSELİ -----
    // Görsel varsa ekle, yoksa boşluk bırak
    if (imageUrl) {
        try {
            const base64Img = await LOGOS.getBase64FromUrl(imageUrl);
            if (base64Img) {
                // Görseli sağ tarafa veya ortaya hizalayalım, 80x80 boyutunda.
                doc.addImage(base64Img, 'JPEG', 14, currentY, 70, 70);
                // Yanına kısa açıklama
                if (product.description) {
                    const splitDesc = doc.splitTextToSize(product.description.replace(/(\r\n|\n|\r)/gm, " "), pageWidth - 100);
                    doc.setFontSize(10);
                    doc.text(splitDesc, 90, currentY + 5);
                }
                currentY += 80;
            }
        } catch (err) {
            console.warn('PDF görsel ekleme hatası:', err);
        }
    } else if (product.description) {
        const splitDesc = doc.splitTextToSize(product.description.replace(/(\r\n|\n|\r)/gm, " "), pageWidth - 28);
        doc.setFontSize(10);
        doc.text(splitDesc, 14, currentY);
        currentY += (splitDesc.length * 5) + 10;
    }

    // Yeterli alan var mı kontrolü
    if (currentY > pageHeight - 50) {
        doc.addPage();
        currentY = 20;
    }

    // ----- TEKNİK ÖZELLİKLER TABLOSU -----
    if (product.technical_specs && Object.keys(product.technical_specs).length > 0) {

        doc.setFontSize(12);
        doc.setTextColor(colors.industrialGray);
        doc.text('Teknik Özellikler', 14, currentY);
        currentY += 5;

        // Obje içindeki verileri 2 sütunlu array'e hazırla
        const tableData: string[][] = [];
        Object.entries(product.technical_specs).forEach(([key, value]) => {
            // Çevirmen fonksiyonu varsa kullan, yoksa anahtarı koy
            const label = translateKey ? translateKey(key) : key;
            const valText = value !== null && value !== undefined ? String(value) : '-';
            tableData.push([label, valText]);
        });

        autoTable(doc, {
            startY: currentY,
            head: [['Özellik', 'Değer']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [11, 30, 54], // primaryNavy
                textColor: 255,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 10,
                cellPadding: 4,
                overflow: 'linebreak'
            },
            columnStyles: {
                0: { cellWidth: 80, fontStyle: 'bold' },
                1: { cellWidth: 'auto' }
            },
        });

    }

    // ----- FOOTER (ALT BİLGİ) -----
    const footerY = pageHeight - 15;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);

    doc.setFontSize(8);
    doc.setTextColor(colors.steelGray);
    doc.text('Bu belge VentHub B2B Havalandırma Sistemleri tarafından otomatik oluşturulmuştur.', 14, footerY);
    doc.text('www.venthub.com', pageWidth - 14, footerY, { align: 'right' });


    // PDF Kaydet! Dosya ismini temizleyelim
    const cleanName = product.name.replace(/[^a-zA-Z0-9-_\.]/g, '_').substring(0, 30);
    doc.save(`${product.brand}_${cleanName}_Datasheet.pdf`);
}
