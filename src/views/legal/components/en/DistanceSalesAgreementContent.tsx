import React from 'react'

import legalConfig from '@/config/legal'

export const DistanceSalesAgreementContentEn: React.FC<{ lang: string }> = () => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Parties</h2>
        <p>
          This Agreement is established between <strong>{legalConfig.sellerTitle}</strong> ("Seller") and the <strong>Consumer</strong> who shops on the website with the domain name www.<strong>{legalConfig.websiteUrl}</strong>, upon the Consumer's electronic confirmation.
        </p>
        <p className="text-sm mt-2">
          Seller Contact Information: Address: <strong>{legalConfig.sellerAddress}</strong> | E-mail: <strong>{legalConfig.sellerEmail}</strong> | Phone: <strong>{legalConfig.sellerPhone}</strong><br />
          Tax Office/No: <strong>{legalConfig.taxOffice}</strong> / <strong>{legalConfig.taxNumber}</strong>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Definitions</h2>
        <p>Site: Refers to the platform at www.{legalConfig.websiteUrl} where the Seller conducts its e-commerce activities.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Subject</h2>
        <p>The subject of this Agreement is the rights and obligations of the parties in accordance with the provisions of Law No. 6502 and the Regulation on Distance Contracts regarding the sale and delivery of the product/service ordered by the Consumer electronically via the Site, the characteristics and sales price of which are specified on the order page.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Conclusion of the Agreement</h2>
        <p>The Consumer acknowledges that they have read and approved this Agreement and the Pre-Information Form on the Site, and that the Agreement is concluded upon the payment confirmation of the order.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Product/Price and Payment Terms</h2>
        <p>The type and category, quantity, sales price including all taxes, and payment details of the product/service are specified on the order/payment page approved by the Consumer.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Delivery</h2>
        <p>The delivery address is the address specified by the Consumer. The product is expected to be dispatched to the cargo company within <strong>{legalConfig.deliveryTime}</strong> from the order confirmation. In the event of delay due to force majeure or reasons attributable to the Consumer, the Seller shall inform the Consumer.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) Right of Withdrawal</h2>
        <p>The Consumer may exercise their right of withdrawal within 14 days from the delivery of the goods without providing any justification. The exceptions to the right of withdrawal are subject to Article 15 of the Regulation on Distance Contracts (e.g., products personalized in line with the Consumer's requests, rapidly perishable products, etc.).</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">8) Exercise of the Right of Withdrawal and Returns</h2>
        <p>Withdrawal notices may be sent to <strong>{legalConfig.sellerEmail}</strong>. The product, along with its invoice and all accessories, must be sent to <strong>{legalConfig.returnAddress}</strong> in an unused and resalable condition. The return cargo company is <strong>{legalConfig.cargoCompanies}</strong> (unless specified otherwise). The refund is processed within <strong>{legalConfig.refundTime}</strong> at the latest following the receipt of the withdrawal notice.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">9) Defective Goods and Warranty</h2>
        <p>In the event of delivery of defective goods, the Consumer may exercise their optional rights under Law No. 6502. If the products are covered by a manufacturer/importer warranty, the relevant warranty terms shall apply.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">10) Force Majeure</h2>
        <p>Circumstances that develop beyond the control of the parties, are unavoidable, and make performance impossible (natural disasters, fire, war, epidemics, etc.) shall be deemed force majeure. In the event of force majeure, the obligations of the parties shall be suspended.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">11) Dispute Resolution</h2>
        <p>The Consumer may submit their complaints and objections to the Consumer Arbitration Committee or the Consumer Court in the place of the Consumer's residence.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">12) Effectiveness</h2>
        <p>The Consumer acknowledges that they have read and accepted all the terms of this Agreement and approved it electronically. The Agreement enters into force on <strong>{legalConfig.lastUpdated}</strong>.</p>
      </section>
    </>
  )
}
