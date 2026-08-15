import Link from 'next/link'
import React from 'react'

import legalConfig from '@/config/legal'
import { localizedHref, Routes } from '@/utils/routes'

export const PreInformationContentEn: React.FC<{ lang: string }> = ({ lang }) => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) Seller Information</h2>
        <p>
          Trade name: <strong>{legalConfig.sellerTitle}</strong><br />
          Address: <strong>{legalConfig.sellerAddress}</strong><br />
          Phone: <strong>{legalConfig.sellerPhone}</strong> | E-mail: <strong>{legalConfig.sellerEmail}</strong><br />
          Registered electronic mail (KEP): <strong>{legalConfig.kepAddress}</strong><br />
          MERSIS No: <strong>{legalConfig.mersis}</strong> | Trade Registry No: <strong>{legalConfig.tradeRegistryNo}</strong><br />
          Chamber of Commerce: <strong>{legalConfig.chamberOfCommerce}</strong><br />
          Tax Office/No: <strong>{legalConfig.taxOffice}</strong> / <strong>{legalConfig.taxNumber}</strong><br />
          ETBIS Registration No: <strong>{legalConfig.etbisNo}</strong>
        </p>
        <p className="text-sm mt-2">Website: www.{legalConfig.websiteUrl}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Contact for Complaints and Requests</h2>
        <p>You may submit any order, delivery, return or other request to <strong>{legalConfig.sellerEmail}</strong> or by calling <strong>{legalConfig.sellerPhone}</strong>. For formal written notice, our KEP address is <strong>{legalConfig.kepAddress}</strong>.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Essential Characteristics of the Goods</h2>
        <p>The brand, model, technical specifications (airflow, pressure, sound level, power, connection dimensions, etc.), quantity and accessories of the ordered product are shown on the product detail page and in the order summary you approve. This Form forms an integral whole together with that order summary.</p>
        <p className="text-sm mt-2">Product images are for illustration purposes; due to manufacturer revisions there may be differences in colour or detail between the image and the delivered product. The binding information is the brand, model and technical data stated in the order summary.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Total Price and Additional Costs</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>The total sales price including all taxes is displayed clearly in the order summary and at the payment step.</li>
          <li>Shipping/delivery fee: <strong>{legalConfig.shippingFee}</strong></li>
          <li>No additional cost beyond the displayed total is charged to the Consumer.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Payment Method</h2>
        <p>Payments are collected by credit/debit card through the <strong>iyzico</strong> payment infrastructure. Your card details are never seen or stored by the Seller.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Delivery</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Place of delivery: the address declared by the Consumer during the order.</li>
          <li>Estimated dispatch time: <strong>{legalConfig.deliveryTime}</strong>.</li>
          <li>In any case delivery is completed within the statutory maximum of <strong>30 days</strong> from receipt of the order.</li>
          <li>Carrier: <strong>{legalConfig.cargoCompanies}</strong></li>
        </ul>
        <p className="text-sm mt-2">Please inspect the package on delivery; if it is damaged, do not accept it and have the carrier issue a damage report.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) Right of Withdrawal</h2>
        <p>The Consumer may withdraw from the contract within <strong>14 days</strong> of delivery (in the case of multiple parts, delivery of the last part) without giving any reason and without paying any penalty. The right may also be exercised between the conclusion of the contract and delivery.</p>
        <p className="mt-2">You may give notice of withdrawal using the model form in §10 below, or by any clear statement sent to <strong>{legalConfig.sellerEmail}</strong>. It is sufficient that the notice is dispatched within the period.</p>
        <p className="mt-2">Following notice, the product must be sent within <strong>10 days</strong> to <strong>{legalConfig.returnAddress}</strong>, unused and in resaleable condition, together with its invoice and all accessories.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">8) Return Costs and Refund</h2>
        <p>Where the right of withdrawal is exercised, the return shipping cost is borne by: <strong>{legalConfig.returnShippingBearer}</strong>.</p>
        <p className="text-sm mt-2">If you return the product with the contracted carrier stated above (<strong>{legalConfig.cargoCompanies}</strong>), you are not held liable for the return cost under Article 12 of the Regulation on Distance Contracts. If you use a different carrier, any difference may be charged to you.</p>
        <p className="mt-2">All payments collected, including delivery costs, are refunded within <strong>{legalConfig.refundTime}</strong> of the withdrawal notice reaching the Seller, using a means appropriate to the original payment method and at no additional cost to the Consumer.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">9) Exceptions to the Right of Withdrawal</h2>
        <p>Under Article 15 of the Regulation on Distance Contracts, the right of withdrawal cannot be exercised in particular for:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Goods prepared in line with the Consumer&apos;s requests or personal needs — <em>air ducts manufactured to project-specific dimensions, custom-made dampers/grilles, and fans ordered in a special colour or motor configuration</em> fall within this scope.</li>
          <li>Goods whose protective elements such as packaging, tape or seal have been opened after delivery and whose return is not suitable for health or hygiene reasons — <em>opened filters and filter cartridges</em> fall within this scope.</li>
          <li>Goods which, after delivery, are inseparably mixed with other products — such as <em>applied insulation and sealing materials</em>.</li>
          <li>Services performed instantaneously in electronic form and intangible goods delivered instantly to the Consumer.</li>
        </ul>
        <p className="text-sm mt-2">For devices installed by the Seller or an authorised service, withdrawal requires the device to be dismantled and returned unused and in resaleable condition; the Consumer is liable for any loss of value resulting from use beyond what is necessary to establish the nature and functioning of the goods.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">10) Model Withdrawal Form</h2>
        <p className="text-sm mb-2">(Complete and return this form only if you wish to withdraw from the contract.)</p>
        <div className="bg-gray-50 border border-light-gray rounded-lg p-4 text-sm space-y-1">
          <p>To: <strong>{legalConfig.sellerTitle}</strong> — {legalConfig.sellerAddress} — {legalConfig.sellerEmail}</p>
          <p>I hereby give notice that I withdraw from the contract for the following goods:</p>
          <p>Order date / Delivery date: ____________________</p>
          <p>Order number: ____________________</p>
          <p>Product(s): ____________________</p>
          <p>Name of Consumer: ____________________</p>
          <p>Address of Consumer: ____________________</p>
          <p>Account/card for the refund: ____________________</p>
          <p>Signature of Consumer (only if this form is submitted on paper): ____________________</p>
          <p>Date: ____________________</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">11) Warranty and After-Sales Service</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Warranty period: <strong>{legalConfig.warrantyPeriod}</strong> (manufacturer/importer warranty reserved).</li>
          <li>Useful life declared under the applicable regulation: <strong>{legalConfig.usefulLife}</strong>.</li>
          <li>Authorised service / after-sales contact: <strong>{legalConfig.afterSalesService}</strong>.</li>
        </ul>
        <p className="text-sm mt-2">In case of defective goods, your statutory options under Article 11 of Law No. 6502 (free repair, replacement with a defect-free equivalent, price reduction, rescission) are reserved.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">12) Dispute Resolution</h2>
        <p>You may submit complaints and objections to the <strong>Consumer Arbitration Committee</strong> or the <strong>Consumer Court</strong> at your place of residence or where the transaction took place, within the monetary limits announced by the Ministry of Trade at the beginning of each calendar year.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">13) Retention of the Contract</h2>
        <p>The Pre-Information Form and Distance Sales Agreement you approve are retained by the Seller in connection with your order; you may access them from the order detail page of your account and request a copy by writing to <strong>{legalConfig.sellerEmail}</strong>.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">14) Your Personal Data</h2>
        <p>For details on the personal data processed during the order process, please see our <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.kvkk(), lang)}>Data Protection (KVKK) Notice</Link> and <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.gizlilik(), lang)}>Privacy Policy</Link>.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">15) Effective Date</h2>
        <p>This Pre-Information Form is dated <strong>{legalConfig.lastUpdated}</strong> and was presented to the Consumer before the order was confirmed. The Consumer confirms electronically having read and understood it.</p>
        <p className="text-sm mt-2">This English text is provided for information purposes. The relationship is governed by Turkish law; in the event of any discrepancy, the Turkish version prevails.</p>
      </section>
    </>
  )
}
