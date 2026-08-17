import Link from 'next/link'
import React from 'react'

import { legalConfigEn as legalConfig } from '@/config/legal'
import { localizedHref, Routes } from '@/utils/routes'

export const DistanceSalesAgreementContentEn: React.FC<{ lang: string }> = ({ lang }) => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Parties</h2>
        <p>
          This Agreement is established between <strong>{legalConfig.sellerTitle}</strong> (&quot;Seller&quot;) and the <strong>Consumer</strong> who shops on the website www.<strong>{legalConfig.websiteUrl}</strong>, upon the Consumer&apos;s electronic confirmation.
        </p>
        <p className="text-sm mt-2">
          Seller details — Address: <strong>{legalConfig.sellerAddress}</strong> | Phone: <strong>{legalConfig.sellerPhone}</strong> | E-mail: <strong>{legalConfig.sellerEmail}</strong> | KEP: <strong>{legalConfig.kepAddress}</strong><br />
          MERSIS No: <strong>{legalConfig.mersis}</strong> | Trade Registry No: <strong>{legalConfig.tradeRegistryNo}</strong> | Chamber of Commerce: <strong>{legalConfig.chamberOfCommerce}</strong><br />
          Tax Office/No: <strong>{legalConfig.taxOffice}</strong> / <strong>{legalConfig.taxNumber}</strong> | ETBIS Registration No: <strong>{legalConfig.etbisNo}</strong>
        </p>
        <p className="text-sm mt-2">The Consumer&apos;s name, delivery/invoice address and contact details are those declared during the order and form an integral part of the order summary.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Definitions</h2>
        <p>Site: the platform at www.{legalConfig.websiteUrl} where the Seller conducts its e-commerce activities; Pre-Information Form: the notice provided to the Consumer before the contract is concluded; Order Summary: the screen showing the products, quantities, total price including taxes and delivery details.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Subject</h2>
        <p>The subject of this Agreement is the rights and obligations of the parties, in accordance with Law No. 6502 on Consumer Protection and the Regulation on Distance Contracts, regarding the sale and delivery of the product/service ordered electronically by the Consumer via the Site, whose characteristics and price are stated in the Order Summary.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Conclusion and Retention of the Agreement</h2>
        <p>The Consumer accepts having read and approved this Agreement and the <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.onBilgilendirme(), lang)}>Pre-Information Form</Link>, and that the Agreement is concluded upon payment confirmation of the order. The Agreement is retained by the Seller and is accessible from the order detail page of the Consumer&apos;s account.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Goods, Price and Payment</h2>
        <p>The type, quantity, sales price including all taxes and payment details of the product/service are set out in the Order Summary approved by the Consumer. Payments are collected by credit/debit card through the <strong>iyzico</strong> payment infrastructure; card details are not stored by the Seller.</p>
        <p className="text-sm mt-2"><strong>Pricing/stock errors:</strong> where a manifest material error in the system, typesetting or data feed results in a price clearly different from the actual value, or where the product is out of stock, the Seller may cancel the order after notifying the Consumer without delay and shall refund any amount collected in full within <strong>{legalConfig.refundTime}</strong>. No further claim arises for the Consumer in such a case.</p>
        <p className="text-sm mt-2">The invoice is issued according to the billing details declared by the Consumer and is delivered electronically (e-archive/e-invoice) to the e-mail address given with the order within <strong>{legalConfig.invoiceDeliveryTime}</strong> at the latest. Where the billing details are incomplete or incorrect, the Seller contacts the Consumer so that the invoice can be issued; shipment may be held during that period.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Delivery</h2>
        <p>The delivery address is the address specified by the Consumer. Dispatch is envisaged within <strong>{legalConfig.deliveryTime}</strong> of order confirmation; delivery is completed in any case within the statutory maximum of <strong>30 days</strong>. Carrier: <strong>{legalConfig.cargoCompanies}</strong>.</p>
        <p className="mt-2">If the Seller fails to perform within this period, the Consumer may terminate the contract; upon termination all payments collected are refunded within <strong>14 days</strong>. In the event of force majeure or delay attributable to the Consumer, the Seller informs the Consumer without delay.</p>
        <p className="text-sm mt-2">The Consumer must inspect the package on delivery and, if damage is identified, refuse the delivery and have the carrier issue a report.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) Right of Withdrawal</h2>
        <p>The Consumer may withdraw from the contract within <strong>14 days</strong> from the date the goods are delivered to the Consumer or a person designated by them (in the case of multiple parts, the last part), without giving any reason and without paying any penalty. The right may also be exercised between the conclusion of the contract and delivery.</p>
        <p className="text-sm mt-2">The model withdrawal form is set out in §10 of the <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.onBilgilendirme(), lang)}>Pre-Information Form</Link>.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">8) Exercise of Withdrawal, Return and Costs</h2>
        <p>Notices of withdrawal may be sent to <strong>{legalConfig.sellerEmail}</strong>; it is sufficient that the notice is dispatched within the period. The product must be sent to <strong>{legalConfig.returnAddress}</strong> within <strong>10 days</strong> of the notice, unused and in resaleable condition, together with its invoice and all accessories.</p>
        <p className="mt-2">Return shipping cost: <strong>{legalConfig.returnShippingBearer}</strong>. Where the return is made with the contracted carrier (<strong>{legalConfig.cargoCompanies}</strong>), the Consumer is not liable for the return cost pursuant to Article 12 of the Regulation on Distance Contracts.</p>
        <p className="mt-2">Refunds are made within <strong>{legalConfig.refundTime}</strong> of the withdrawal notice reaching the Seller, including delivery costs, using a means appropriate to the original payment method.</p>
        <p className="text-sm mt-2">The Consumer is liable for any loss of value arising from use of the goods beyond what is necessary to establish their nature and functioning.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">9) Exceptions to the Right of Withdrawal</h2>
        <p>Pursuant to Article 15 of the Regulation on Distance Contracts, the right of withdrawal cannot be exercised for goods prepared in line with the Consumer&apos;s requests or personal needs (air ducts made to project-specific dimensions, custom dampers/grilles, fans with special configurations), goods whose protective elements have been opened and whose return is unsuitable for hygiene reasons (opened filters), goods inseparably mixed with other products after delivery (applied insulation/sealing materials), and services performed instantaneously in electronic form.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">10) Defective Goods, Warranty and After-Sales Service</h2>
        <p>In the event of delivery of defective goods, the Consumer may exercise the statutory options under Article 11 of Law No. 6502 (free repair, replacement with a defect-free equivalent, price reduction, rescission of the contract).</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Warranty period: <strong>{legalConfig.warrantyPeriod}</strong> (manufacturer/importer warranty reserved)</li>
          <li>Useful life: <strong>{legalConfig.usefulLife}</strong></li>
          <li>Authorised service / after-sales contact: <strong>{legalConfig.afterSalesService}</strong></li>
        </ul>
        <p className="text-sm mt-2">Installation, electrical connection and commissioning must be carried out by competent persons in accordance with the manufacturer&apos;s instructions; faults arising from improper installation may fall outside the warranty.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">11) Force Majeure</h2>
        <p>Events beyond the control of the parties which are unforeseeable and render performance impossible (natural disaster, fire, war, epidemic, general strike, infrastructure outages, etc.) are deemed force majeure. Obligations are suspended for the duration; if the event does not cease within a reasonable period, either party may terminate the contract and amounts collected are refunded.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">12) Protection of Personal Data</h2>
        <p>For details on personal data processed in connection with the conclusion and performance of this Agreement, please see our <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.kvkk(), lang)}>Data Protection (KVKK) Notice</Link>.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">13) Dispute Resolution</h2>
        <p>The Consumer may submit complaints and objections to the <strong>Consumer Arbitration Committee</strong> or the <strong>Consumer Court</strong> at their place of residence or where the transaction took place, within the monetary limits announced by the Ministry of Trade at the beginning of each calendar year.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">14) Entry into Force</h2>
        <p>The Consumer accepts having read and approved all terms of this Agreement electronically. The Agreement enters into force upon payment confirmation of the order, on the basis of the text dated <strong>{legalConfig.lastUpdated}</strong>.</p>
        <p className="text-sm mt-2">This English text is provided for information purposes. The relationship is governed by Turkish law; in the event of any discrepancy, the Turkish version prevails.</p>
      </section>
    </>
  )
}
