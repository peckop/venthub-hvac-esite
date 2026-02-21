import React, { useEffect, useCallback, useState } from 'react'
import { createInvoiceProfile, deleteInvoiceProfile, listInvoiceProfiles, setDefaultInvoiceProfile, updateInvoiceProfile, type InvoiceProfile, type InvoiceProfileType } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { useI18n } from '../../i18n/I18nProvider'
import { FileText, Plus, Trash2, Edit2, CheckCircle, User, Building2, Landmark, Loader2 } from 'lucide-react'

export default function AccountInvoicesPage() {
  const { t } = useI18n()
  const [profiles, setProfiles] = useState<InvoiceProfile[]>([])
  const [loading, setLoading] = useState(true)

  const [type, setType] = useState<InvoiceProfileType>('individual')
  const [title, setTitle] = useState('')
  const [tckn, setTckn] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [vkn, setVkn] = useState('')
  const [taxOffice, setTaxOffice] = useState('')
  const [eInvoice, setEInvoice] = useState(false)
  const [isDefault, setIsDefault] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [edit, setEdit] = useState<{ title?: string; tckn?: string; company_name?: string; vkn?: string; tax_office?: string; e_invoice?: boolean }>({})

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const rows = await listInvoiceProfiles()
      setProfiles(rows)
    } catch (e) {
      console.error(e)
      toast.error(t('account.invoices.toasts.loadError') || 'Fatura profilleri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  const resetForm = () => {
    setTitle(''); setTckn(''); setCompanyName(''); setVkn(''); setTaxOffice(''); setEInvoice(false); setIsDefault(false); setEditingId(null)
  }

  const onSave = async () => {
    try {
      setSaving(true)
      if (type === 'individual') {
        if (!tckn || tckn.replace(/\D/g, '').length !== 11) {
          toast.error(t('checkout.errors.tcknFormat') || 'TCKN 11 haneli olmalıdır')
          return
        }
        await createInvoiceProfile({ type, title: title || undefined, tckn, is_default: isDefault })
      } else {
        if (!companyName?.trim()) { toast.error(t('checkout.errors.companyRequired') || 'Firma adı zorunludur'); return }
        if (!vkn || vkn.replace(/\D/g, '').length !== 10) { toast.error(t('checkout.errors.vknFormat') || 'VKN 10 haneli olmalıdır'); return }
        if (!taxOffice?.trim()) { toast.error(t('checkout.errors.taxOfficeRequired') || 'Vergi dairesi zorunludur'); return }
        await createInvoiceProfile({ type, title: title || undefined, company_name: companyName, vkn, tax_office: taxOffice, e_invoice: eInvoice, is_default: isDefault })
      }
      toast.success(t('account.invoices.created') || 'Fatura profili başarıyla oluşturuldu')
      resetForm()
      await load()
    } catch (e) {
      console.error(e)
      toast.error(t('checkout.errors.database') || 'Bir hata oluştu')
    } finally { setSaving(false) }
  }

  const maskDigits = (v: string, max: number) => v.replace(/\D/g, '').slice(0, max)

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <section className="w-full lg:w-[400px] shrink-0 order-first lg:order-last">
        <div className="bg-white border border-gray-100/80 rounded-2xl shadow-sm p-6 sm:p-8 sticky top-[100px]">
          <h2 className="text-xl font-bold text-industrial-gray mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary-navy" />
            {t('account.invoices.formTitleNew') || 'Yeni Fatura Profili'}
          </h2>
          <div className="space-y-5">
            <div className="flex p-1 bg-gray-100 rounded-xl">
              <button onClick={() => setType('individual')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${type === 'individual' ? 'bg-white text-primary-navy shadow-sm' : 'text-steel-gray hover:text-industrial-gray'}`}>
                <User className="w-4 h-4" /> Bireysel
              </button>
              <button onClick={() => setType('corporate')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${type === 'corporate' ? 'bg-white text-primary-navy shadow-sm' : 'text-steel-gray hover:text-industrial-gray'}`}>
                <Building2 className="w-4 h-4" /> Kurumsal
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-steel-gray uppercase tracking-wider px-1">Profil Başlığı</label>
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-industrial-gray focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all focus:bg-white" placeholder="Ör: Şahsi Faturalarım" />
              </div>
              {type === 'individual' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-steel-gray uppercase tracking-wider px-1">TC Kimlik No</label>
                  <input value={tckn} onChange={e => setTckn(maskDigits(e.target.value, 11))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-industrial-gray focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all focus:bg-white" placeholder="11 haneli TCKN" />
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-steel-gray uppercase tracking-wider px-1">Firma Ünvanı</label>
                    <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-industrial-gray focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all focus:bg-white" placeholder="Firma tam adı" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-steel-gray uppercase tracking-wider px-1">Vergi No</label>
                      <input value={vkn} onChange={e => setVkn(maskDigits(e.target.value, 10))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-industrial-gray focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all focus:bg-white" placeholder="10 haneli VKN" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-steel-gray uppercase tracking-wider px-1">Vergi Dairesi</label>
                      <input value={taxOffice} onChange={e => setTaxOffice(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-industrial-gray focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all focus:bg-white" placeholder="Daire adı" />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer group pt-1">
                    <div className="relative flex items-center justify-center w-5 h-5 rounded border border-gray-300 group-hover:border-primary-navy transition-colors">
                      <input type="checkbox" className="peer sr-only" checked={eInvoice} onChange={e => setEInvoice(e.target.checked)} />
                      <div className="absolute inset-0 bg-primary-navy opacity-0 peer-checked:opacity-100 rounded transition-opacity" />
                      <CheckCircle className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-sm font-medium text-industrial-gray select-none">e-Fatura Mükellefiyim</span>
                  </label>
                </>
              )}
              <label className="flex items-center gap-3 cursor-pointer group border-t border-gray-100 pt-4 mt-2">
                <div className="relative flex items-center justify-center w-5 h-5 rounded border border-gray-300 group-hover:border-primary-navy transition-colors">
                  <input type="checkbox" className="peer sr-only" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} />
                  <div className="absolute inset-0 bg-primary-navy opacity-0 peer-checked:opacity-100 rounded transition-opacity" />
                  <CheckCircle className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-medium text-industrial-gray select-none">Varsayılan Profil Yap</span>
              </label>
              <button disabled={saving} onClick={onSave} className="w-full bg-primary-navy hover:bg-industrial-gray text-white px-4 py-3 rounded-xl font-bold shadow-sm shadow-primary-navy/20 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-4">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Profil Oluştur
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="flex-1 min-w-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-industrial-gray flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-navy" />
            {t('account.invoices.title') || 'Fatura Bilgilerim'}
          </h1>
          <p className="text-sm text-steel-gray mt-1">Siparişleriniz için bireysel veya kurumsal fatura profilleri oluşturun.</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-48 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <div className="flex flex-col items-center text-steel-gray gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary-navy" />
              <span className="text-sm font-medium">Profiller yükleniyor...</span>
            </div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center px-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-industrial-gray mb-1">Henüz Profil Eklenmemiş</h3>
            <p className="text-sm text-steel-gray max-w-sm">Hızlı fatura kesimi için ilk profilinizi yan taraftaki formdan ekleyin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profiles.map(p => (
              <div key={p.id} className="group bg-white border border-gray-200 hover:border-primary-navy/30 rounded-2xl shadow-sm hover:shadow relative overflow-hidden transition-all flex flex-col p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${p.type === 'individual' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                      {p.type === 'individual' ? <User className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-industrial-gray">{p.title || (p.type === 'individual' ? 'Bireysel' : 'Kurumsal')}</h3>
                      {p.is_default && <span className="text-[10px] font-bold text-primary-navy uppercase tracking-widest">{t('account.invoices.default') || 'Varsayılan'}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingId(p.id); setEdit({ title: p.title || '', tckn: p.tckn || '', company_name: p.company_name || '', vkn: p.vkn || '', tax_office: p.tax_office || '', e_invoice: !!p.e_invoice }) }} className="text-gray-400 hover:text-primary-navy transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={async () => { if (!confirm(t('account.invoices.confirmDelete') || 'Silmek istediğinize emin misiniz?')) return; try { await deleteInvoiceProfile(p.id); toast.success(t('account.invoices.deleted') || 'Profil silindi'); await load() } catch (e) { console.error(e); toast.error(t('checkout.errors.database')) } }} className="text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {editingId === p.id ? (
                  <div className="mt-2 space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-1">
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-steel-gray uppercase">Başlık</label>
                        <input value={edit.title || ''} onChange={e => setEdit(s => ({ ...s, title: e.target.value }))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
                      </div>
                      {p.type === 'individual' ? (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-steel-gray uppercase">TCKN</label>
                          <input value={edit.tckn || ''} onChange={e => setEdit(s => ({ ...s, tckn: e.target.value.replace(/\D/g, '').slice(0, 11) }))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-steel-gray uppercase">Firma Ünvanı</label>
                            <input value={edit.company_name || ''} onChange={e => setEdit(s => ({ ...s, company_name: e.target.value }))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-steel-gray uppercase">VKN</label>
                              <input value={edit.vkn || ''} onChange={e => setEdit(s => ({ ...s, vkn: e.target.value.replace(/\D/g, '').slice(0, 10) }))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-steel-gray uppercase">V. Dairesi</label>
                              <input value={edit.tax_office || ''} onChange={e => setEdit(s => ({ ...s, tax_office: e.target.value }))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
                            </div>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 text-primary-navy rounded border-gray-300" checked={!!edit.e_invoice} onChange={e => setEdit(s => ({ ...s, e_invoice: e.target.checked }))} />
                            <span className="text-xs font-medium text-industrial-gray">e-Fatura Mükellefi</span>
                          </label>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button className="flex-1 text-xs font-bold px-3 py-2 rounded-lg bg-primary-navy text-white hover:bg-industrial-gray transition-colors" onClick={async () => {
                        try {
                          if (p.type === 'individual') {
                            const tt = (edit.tckn || '').toString().trim(); if (tt.length !== 11) { toast.error(t('checkout.errors.tcknFormat') || 'TCKN 11 hane olmalı'); return }
                          } else {
                            const cc = (edit.company_name || '').trim(); const vv = (edit.vkn || '').trim(); const oo = (edit.tax_office || '').trim();
                            if (!cc) { toast.error(t('checkout.errors.companyRequired') || 'Firma adı eksik'); return }
                            if (vv.length !== 10) { toast.error(t('checkout.errors.vknFormat') || 'VKN 10 hane olmalı'); return }
                            if (!oo) { toast.error(t('checkout.errors.taxOfficeRequired') || 'Vergi dairesi eksik'); return }
                          }
                          await updateInvoiceProfile(p.id, edit)
                          toast.success(t('account.invoices.updated') || 'Güncellendi')
                          setEditingId(null)
                          await load()
                        } catch (e) { console.error(e); toast.error(t('checkout.errors.database')) }
                      }}>{t('account.invoices.save') || 'Güncelle'}</button>
                      <button className="text-xs font-bold px-3 py-2 rounded-lg border border-gray-200 text-steel-gray hover:bg-gray-50 transition-colors" onClick={() => { setEditingId(null) }}>{t('account.invoices.cancel') || 'İptal'}</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2">
                      {p.type === 'individual' ? (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-steel-gray">TCKN</span>
                          <span className="font-bold text-industrial-gray">{p.tckn}</span>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm font-bold text-industrial-gray border-b border-gray-200/50 pb-2 mb-1">{p.company_name}</div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-steel-gray">VKN</span>
                            <span className="font-bold text-industrial-gray">{p.vkn}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-steel-gray">Vergi Dairesi</span>
                            <span className="font-bold text-industrial-gray">{p.tax_office}</span>
                          </div>
                          {p.e_invoice && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 mt-1">
                              <CheckCircle className="w-3 h-3" /> e-Fatura Mükellefi
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      {!p.is_default ? (
                        <button onClick={async () => { try { await setDefaultInvoiceProfile(p.id); toast.success(t('account.invoices.setDefaultSuccess') || 'Varsayılan yapıldı'); await load() } catch (e) { console.error(e); toast.error(t('checkout.errors.database')) } }} className="text-xs font-bold text-primary-navy hover:underline">
                          Varsayılan Yap
                        </button>
                      ) : (
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Varsayılan Profil</div>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 italic">
                        <Landmark className="w-3 h-3" /> {p.type === 'individual' ? 'Kişisel' : 'Kurumsal'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
