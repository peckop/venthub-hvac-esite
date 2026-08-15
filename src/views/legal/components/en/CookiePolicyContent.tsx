import Link from 'next/link'
import React from 'react'

import CookiePreferencesButton from '@/components/consent/CookiePreferencesButton'
import legalConfig from '@/config/legal'
import { localizedHref, Routes } from '@/utils/routes'

export const CookiePolicyContentEn: React.FC<{ lang: string }> = ({ lang }) => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">1) What Is a Cookie?</h2>
        <p>Cookies are small text files placed on your browser or device by the websites you visit. They are used to provide the site&apos;s core functions, remember your preferences and maintain security. This Policy also covers similar technologies such as browser local storage.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">2) Cookies We Use</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-light-gray">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2 border-b border-light-gray">Identifier</th>
                <th className="text-left p-2 border-b border-light-gray">Purpose</th>
                <th className="text-left p-2 border-b border-light-gray">Type</th>
                <th className="text-left p-2 border-b border-light-gray">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border-b border-light-gray">Session cookies (<code>sb-*-auth-token</code>)</td>
                <td className="p-2 border-b border-light-gray">Maintaining your sign-in session and refreshing it</td>
                <td className="p-2 border-b border-light-gray">Strictly necessary</td>
                <td className="p-2 border-b border-light-gray">Session</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-light-gray">Authorisation/tenant cookies</td>
                <td className="p-2 border-b border-light-gray">Verifying access rights and the relevant store record</td>
                <td className="p-2 border-b border-light-gray">Strictly necessary</td>
                <td className="p-2 border-b border-light-gray">Session</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-light-gray"><code>NEXT_LOCALE</code></td>
                <td className="p-2 border-b border-light-gray">Remembering your language selection</td>
                <td className="p-2 border-b border-light-gray">Functional</td>
                <td className="p-2 border-b border-light-gray">1 year</td>
              </tr>
              <tr>
                <td className="p-2 border-b border-light-gray"><code>vh_consent</code> (local storage)</td>
                <td className="p-2 border-b border-light-gray">Storing your per-category cookie preference, the date of your decision and the policy version you accepted</td>
                <td className="p-2 border-b border-light-gray">Functional</td>
                <td className="p-2 border-b border-light-gray">Until you clear it</td>
              </tr>
              <tr>
                <td className="p-2">Basket and preference data (local storage)</td>
                <td className="p-2">Preserving basket contents and display preferences</td>
                <td className="p-2">Functional</td>
                <td className="p-2">Until you clear it</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm mt-3"><strong>Analytics and marketing cookies:</strong> the Site currently does <strong>not</strong> use cookies for analytics, advertising or profiling. Should such cookies be introduced, they will run only with your <strong>explicit consent</strong> and this table will be updated. Where you have not consented to a category, its tag/script is <strong>never loaded</strong> — not merely prevented from sending events, but blocked before the code that writes the cookie can run.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">3) Legal Basis and Consent</h2>
        <p>Cookies that are <strong>strictly necessary</strong> for the Site to function are used without consent, in order to provide the service you requested. <strong>Non-essential</strong> cookies (analytics, marketing, profiling) are used only with your <strong>explicit consent</strong>; declining does not prevent you from using the core functions of the Site.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">4) Third-Party Services</h2>
        <p>The <strong>iyzico</strong> infrastructure is used at the payment step and iyzico&apos;s own cookies may be set on the payment page; those cookies are subject to iyzico&apos;s own policies. Our hosting and database providers may use technical identifiers to deliver and secure the service.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">5) Managing Your Preferences</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>The cookie banner shown on your first visit lets you choose <strong>per category</strong>: accept all, necessary only, or use &quot;Manage Preferences&quot; to switch functional, analytics and marketing on or off individually.</li>
          <li><strong>You may withdraw your consent at any time</strong> — the button below clears your record and reopens the selection. Withdrawing is as easy as giving consent.</li>
          <li>You can block or delete cookies entirely from your browser settings. If strictly necessary cookies are blocked, functions such as sign-in and the basket may not work.</li>
        </ul>
        <div className="mt-4">
          <CookiePreferencesButton />
        </div>
        <p className="text-xs text-steel-gray mt-3">Your consent is stored in your browser together with the date you decided and the policy version you accepted. If this Policy changes materially, your consent lapses and you will be asked again.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">6) Relationship With Your Personal Data</h2>
        <p>For your rights regarding data processed through cookies and how to exercise them, please see our <Link className="text-primary-navy underline" href={localizedHref(Routes.legal.kvkk(), lang)}>Data Protection (KVKK) Notice</Link>.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">7) Contact</h2>
        <p>For questions about our cookie policy: <strong>{legalConfig.sellerEmail}</strong></p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-industrial-gray mb-3">8) Effective Date</h2>
        <p>This Cookie Policy was last updated on <strong>{legalConfig.lastUpdated}</strong>.</p>
        <p className="text-sm mt-2">This English text is provided for information purposes. In the event of any discrepancy, the Turkish version prevails.</p>
      </section>
    </>
  )
}
