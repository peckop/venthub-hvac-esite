import React from 'react'
import { useI18n } from '@/i18n/I18nProvider'
import { createInvoiceProfile, deleteInvoiceProfile, listInvoiceProfiles, setDefaultInvoiceProfile, type InvoiceProfile, type InvoiceProfileType } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function AccountInvoicesPage() {
  const { t } = useI18n()
  const [profiles, setProfiles] = React.useState<InvoiceProfile[]>([])
  const [loading, setLoading] = React.useState(true)

  const [type, setType] = React.useState<InvoiceProfileType>('individual')
  const [title, setTitle] = React.useState('')
  const [tckn, setTckn] = React.useState('')
  const [companyName, setCompanyName] = React.useState('')
  const [vkn, setVkn] = React.useState('')
  const [taxOffice, setTaxOffice] = React.useState('')
  const [eInvoice, setEInvoice] = React.useState(false)
  const [isDefault, setIsDefault] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      const rows = await listInvoiceProfiles()
      setProfiles(rows)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { load() }, [load])

  const resetForm = () => {
    setTitle(''); setTckn(''); setCompanyName(''); setVkn(''); setTaxOffice(''); setEInvoice(false); setIsDefault(false)
  }

  const onSave = async () => {
    try {
      setSaving(true)
      if (type === 'individual') {
        if (!tckn || tckn.replace(/\D/g,'').length !== 11) {
          toast.error(t('checkout.errors.tcknFormat'))
          return
        }
        await createInvoiceProfile({ type, title: title || undefined, tckn, is_default: isDefault })
      } else {
        if (!companyName?.trim()) { toast.error(t('checkout.errors.companyRequired')); return }
        if (!vkn || vkn.replace(/\D/g,'').length !== 10) { toast.error(t('checkout.errors.vknFormat')); return }
        if (!taxOffice?.trim()) { toast.error(t('checkout.errors.taxOfficeRequired')); return }
        await createInvoiceProfile({ type, title: title || undefined, company_name: companyName, vkn, tax_office: taxOffice, e_invoice: eInvoice, is_default: isDefault })
      }
      toast.success(t('account.invoices.created'))
      resetForm()
      await load()
    } catch (e) {
      console.error(e)
      toast.error(t('checkout.errors.database'))
    } finally { setSaving(false) }
  }

  const maskDigits = (v: string, max: number) => v.replace(/\D/g,'').slice(0, max)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6">
        <h2 className="text-xl font-semibold text-industrial-gray mb-4">{t('account.invoices.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-industrial-gray mb-2">{t('account.invoices.type')}</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input type="radio" name="invType" checked={type==='individual'} onChange={()=>setType('individual')} />
                <span className="text-sm">{t('account.invoices.individual')}</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="invType" checked={type==='corporate'} onChange={()=>setType('corporate')} />
                <span className="text-sm">{t('account.invoices.corporate')}</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-industrial-gray mb-2">{t('account.invoices.titleLabel')}</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-4 py-2 border border-light-gray rounded" placeholder="Ör: İş - Şirket" />
          </div>

          {type === 'individual' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-industrial-gray mb-2">{t('account.invoices.tcknLabel')}</label>
                <input value={tckn} onChange={e=>setTckn(maskDigits(e.target.value, 11))} className="w-full px-4 py-2 border border-light-gray rounded" placeholder="12345678901" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-industrial-gray mb-2">{t('account.invoices.companyLabel')}</label>
                <input value={companyName} onChange={e=>setCompanyName(e.target.value)} className="w-full px-4 py-2 border border-light-gray rounded" placeholder="Venthub Mühendislik A.Ş." />
              </div>
              <div>
                <label className="block text-sm font-medium text-industrial-gray mb-2">{t('account.invoices.vknLabel')}</label>
                <input value={vkn} onChange={e=>setVkn(maskDigits(e.target.value, 10))} className="w-full px-4 py-2 border border-light-gray rounded" placeholder="1234567890" />
              </div>
              <div>
                <label className="block text-sm font-medium text-industrial-gray mb-2">{t('account.invoices.taxOfficeLabel')}</label>
                <input value={taxOffice} onChange={e=>setTaxOffice(e.target.value)} className="w-full px-4 py-2 border border-light-gray rounded" placeholder="Kadıköy" />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input type="checkbox" checked={eInvoice} onChange={e=>setEInvoice(e.target.checked)} />
                <span className="text-sm text-steel-gray">{t('account.invoices.eInvoice')}</span>
              </div>
            </>
          )}

          <div className="flex items-center gap-2">
            <input type="checkbox" checked={isDefault} onChange={e=>setIsDefault(e.target.checked)} />
            <span className="text-sm text-steel-gray">{t('account.invoices.default')}</span>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <button disabled={saving} onClick={onSave} className="px-4 py-2 bg-primary-navy text-white rounded disabled:opacity-60">{t('account.invoices.save')}</button>
            <button onClick={resetForm} className="px-4 py-2 border rounded">{t('account.invoices.cancel')}</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6">
        <h3 className="text-lg font-semibold text-industrial-gray mb-4">{t('account.invoices.title')}</h3>
        {loading ? (
          <div className="text-sm text-steel-gray">Yükleniyor...</div>
        ) : profiles.length === 0 ? (
          <div className="text-sm text-steel-gray">{t('account.invoices.noProfiles')}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profiles.map(p => (
              <div key={p.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-industrial-gray">
                    {p.title || (p.type === 'individual' ? t('account.invoices.individual') : t('account.invoices.corporate'))}
                    {p.is_default && <span className="ml-2 text-xs text-primary-navy">({t('account.invoices.default')})</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {!p.is_default && (
                      <button onClick={async ()=>{ try { await setDefaultInvoiceProfile(p.id); toast.success(t('account.invoices.setDefaultSuccess')); await load() } catch(e){ console.error(e); toast.error(t('checkout.errors.database')) } }} className="text-xs px-3 py-1.5 rounded border hover:bg-gray-50">{t('account.invoices.setDefault')}</button>
                    )}
                    <button onClick={async ()=>{ if (!confirm(t('account.invoices.confirmDelete'))) return; try { await deleteInvoiceProfile(p.id); toast.success(t('account.invoices.deleted')); await load() } catch(e){ console.error(e); toast.error(t('checkout.errors.database')) } }} className="text-xs px-3 py-1.5 rounded border text-red-600 hover:bg-gray-50">{t('account.invoices.delete')}</button>
                  </div>
                </div>
                <div className="text-xs text-steel-gray mt-2">
                  {p.type === 'individual' ? (
                    <div>TCKN: {p.tckn || '-'}</div>
                  ) : (
                    <div className="space-y-1">
                      <div>{t('account.invoices.companyLabel')}: {p.company_name || '-'}</div>
                      <div>{t('account.invoices.vknLabel')}: {p.vkn || '-'}</div>
                      <div>{t('account.invoices.taxOfficeLabel')}: {p.tax_office || '-'}</div>
                      <div>e‑Fatura: {p.e_invoice ? 'Evet' : 'Hayır'}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

