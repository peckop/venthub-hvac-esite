'use client'

import * as Dialog from '@radix-ui/react-dialog'
import React from 'react'

import { useI18n } from '@/i18n/I18nProvider'

import { InventoryRow, ReservedRow } from '../../types/inventory'
import InventoryMovementHistory, { Movement } from './InventoryMovementHistory'
import { printQrLabel } from './InventoryQrLabel'
import InventoryReservedTable from './InventoryReservedTable'
import InventoryStockAdjust from './InventoryStockAdjust'

/**
 * STOK DETAY ÇEKMECESİ.
 *
 * Cetvel: `docs/standards/admin-design-standard.md` §4.
 *
 * NEDEN MODAL (§4.1/§4.3): §4.1 "tablo satırı seçince hızlı detay" için non-modal split
 * panel öneriyor; ama §4.3 net: **"Modal bir drawer, sadece şekli değişmiş bir modaldır"** ve
 * panelin non-modal SAYILMASI için arka içeriğin ETKİLEŞİMLİ kalması gerekir. Bu çekmece
 * arkayı `aria-modal` + perde ile kapatıyor, içinde YAZMA yolları (eşik kaydetme, stok
 * giriş/çıkış, geri alma) barındırıyor ve Carbon'un kısıtına göre girdi isteyen akış zaten
 * modal olmalı. Dolayısıyla **modal olarak adlandırılır ve §4.2/§4.8'e tabi tutulur** —
 * "non-modal gibi davranmadığı hâlde `aria-modal` yazmak" APG'nin "severe negative
 * ramifications" uyarısına giren yalan etikettir.
 *
 * NEDEN RADIX (§4.8): elle yazılmış hâli `role="dialog" aria-modal="true"` basıyordu ama
 * sözleşmenin 11 maddesinden 4'ünü SAĞLAMIYORDU — odak tuzağı yok, açılışta odak içeri
 * taşınmıyor, kapanışta tetikleyiciye dönmüyor, body scroll lock yok. Perdesi de
 * `<button className="fixed inset-0">` idi: ekran okuyucuya "buton" diye duyurulan bir
 * perde. Radix Dialog dördünü de yapıdan verir; `aria-modal` elle basılır (Radix basmaz,
 * INV-ADMIN-OVERLAY-2 bunu ölçer).
 *
 * Katman: ham `z-40/z-50` yerine `z-backdrop`/`z-modal` token'ları (§4.9).
 */

interface InventoryDetailDrawerProps {
    selected: InventoryRow | null
    /** kapanış — Radix her yoldan (ESC, perde, kapat butonu) buraya çıkar */
    onClose: () => void
    printingQr: boolean
    setPrintingQr: (v: boolean) => void
    selectedStock: number | null
    selectedThreshold: number | ''
    setSelectedThreshold: (v: number | '') => void
    defaultThreshold: number | null
    saving: boolean
    saveThreshold: (id: string) => void
    hasWriteAccess: boolean
    moveQty: number
    setMoveQty: (v: number) => void
    moving: boolean
    adjustStock: (id: string, delta: number, reason: string) => void
    reservedOrders: ReservedRow[]
    movements: Movement[] // Use the defined Movement type
    undoLastMovement: () => void
    undoing: boolean
}

export default function InventoryDetailDrawer(props: InventoryDetailDrawerProps) {
    const {
        selected, onClose, printingQr, setPrintingQr, selectedStock,
        selectedThreshold, setSelectedThreshold, defaultThreshold, saving, saveThreshold,
        hasWriteAccess, moveQty, setMoveQty, moving, adjustStock,
        reservedOrders, movements, undoLastMovement, undoing
    } = props

    const { t } = useI18n()

    if (!selected) return null

    return (
        <Dialog.Root open onOpenChange={(next) => { if (!next) onClose() }}>
            <Dialog.Portal>
                {/* Perde = görsel örtü + body scroll lock. ASLA çıkarma (cetvel §2.5). */}
                <Dialog.Overlay className="fixed inset-0 z-backdrop bg-black/60" />
                <Dialog.Content
                    // Radix `aria-modal` basmıyor → elle (INV-ADMIN-OVERLAY-2).
                    aria-modal="true"
                    // Gövde semantik yapı (tablolar, çok bölüm) içeriyor → APG: başlığa değil
                    // panelin kendisine odaklan, `aria-describedby` KOYMA.
                    aria-describedby={undefined}
                    className="fixed right-0 top-0 h-full w-full sm:w-480px bg-admin-surface z-modal shadow-admin-overlay border-l border-admin-border flex flex-col animate-in slide-in-from-right duration-300"
                >
                    <header className="px-6 py-6 border-b border-admin-border flex items-center justify-between bg-admin-surface-2">
                        <div className="flex flex-col truncate pr-4">
                            <Dialog.Title className="text-xl font-semibold text-admin-fg truncate tracking-tight">{selected.name}</Dialog.Title>
                            <span className="text-xs font-mono text-admin-accent mt-1">{selected.product_id}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                type="button"
                                disabled={printingQr}
                                className="h-10 px-4 rounded-admin-md bg-admin-accent text-admin-accent-fg text-xs font-semibold hover:bg-admin-accent-hover transition-opacity disabled:opacity-50"
                                onClick={() => void printQrLabel(selected, setPrintingQr, {
                                    documentTitle: t('admin.inventory.qrLabel.documentTitle'),
                                    skuLabel: t('admin.inventory.qrLabel.sku'),
                                    shelfLabel: t('admin.inventory.qrLabel.shelf'),
                                    stockLine: t('admin.inventory.qrLabel.stockLine', { count: selected.physical_stock }),
                                    qrAlt: t('admin.inventory.qrLabel.qrAlt'),
                                    failed: t('admin.inventory.qrLabel.failed'),
                                })}
                            >
                                {printingQr ? t('admin.ui.loadingShort') : t('admin.inventory.qr')}
                            </button>
                            <Dialog.Close asChild>
                                <button
                                    type="button"
                                    className="h-10 px-4 rounded-admin-md bg-admin-surface border border-admin-border text-admin-fg-muted hover:text-admin-fg transition-colors text-xs font-semibold"
                                >
                                    {t('admin.ui.close')}
                                </button>
                            </Dialog.Close>
                        </div>
                    </header>

                    <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
                        {/* Özet Kartları */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-admin-surface rounded-admin-md border border-admin-border p-4 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-admin-accent"></div>
                                <div className="text-xs font-semibold text-admin-fg-muted mb-2">{t('admin.inventory.currentStock')}</div>
                                <div className="text-3xl font-semibold text-admin-fg">{selectedStock ?? '-'}</div>
                            </div>
                            <div className="bg-admin-surface rounded-admin-md border border-admin-border p-4 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-admin-warning" style={{ boxShadow: '0 0 15px rgba(245,158,11,0.5)' }}></div>
                                <div className="text-xs font-semibold text-admin-fg-muted mb-2">{t('admin.inventory.thresholdAlarm')}</div>
                                <div className="text-3xl font-semibold text-admin-fg">{(selectedThreshold === '' ? (defaultThreshold ?? '-') : selectedThreshold) as string | number}</div>
                            </div>
                        </div>

                        {/* Zeki Öneri Bölümü */}
                        {selected.daily_velocity !== undefined && selected.daily_velocity > 0 && (
                            <section
                                className="bg-admin-surface rounded-admin-lg border border-admin-accent/30 p-6 relative overflow-hidden"
                                style={{ boxShadow: '0 0 30px rgba(34,211,238,0.05)' }}
                            >
                                <div className="absolute -right-8 -top-8 w-32 h-32 bg-admin-accent-weak rounded-full blur-3xl"></div>
                                <h3 className="text-xs font-semibold text-admin-accent mb-4 flex items-center gap-3">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-admin-accent opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-admin-accent" style={{ boxShadow: '0 0 10px rgba(34,211,238,0.8)' }}></span>
                                    </span>
                                    {t('admin.inventory.smartPurchaseRecommendation')}
                                </h3>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-xs text-admin-fg-muted mb-2 font-semibold">{t('admin.inventory.salesVelocity30d')}</div>
                                        <div className="font-mono text-base font-bold text-admin-fg tracking-tight">
                                            {selected.daily_velocity.toFixed(2)}{' '}
                                            <span className="text-xs text-admin-fg-muted">
                                                {t('admin.inventory.perDayUnit')}
                                            </span>
                                        </div>
                                        <div className="text-xs text-admin-fg-subtle mt-1 font-semibold">
                                            {t('admin.inventory.approxMonthlyVolume', { count: Math.ceil(selected.daily_velocity * 30) })}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-admin-accent font-semibold mb-2">{t('admin.inventory.recommendedOrder')}</div>
                                        <div className="font-mono text-3xl font-semibold text-admin-fg leading-none">
                                            {Math.max(0, Math.ceil((selected.daily_velocity * 30)) - selected.available_stock)}{' '}
                                            <span className="text-xs font-bold text-admin-fg-muted">
                                                {t('admin.inventory.pcsUnit')}
                                            </span>
                                        </div>
                                        <div className="text-xs text-admin-fg-subtle mt-2 font-semibold tracking-tighter">
                                            {t('admin.inventory.for30dBuffer')}
                                        </div>
                                    </div>
                                </div>

                                {selected.abc_class === 'A' && (
                                    <div className="mt-5 text-xs bg-admin-accent-weak text-admin-accent px-3 py-2.5 rounded-admin-md border border-admin-accent/30 flex items-center gap-2 font-bold leading-relaxed">
                                        <div className="w-1.5 h-1.5 rounded-full bg-admin-accent animate-pulse"></div>
                                        <span className="opacity-80">{t('admin.inventory.abcClassAHelp')}</span>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Eşik Düzenleme */}
                        {hasWriteAccess && (
                            <section className="space-y-4">
                                <h3 className="text-xs font-semibold text-admin-fg-muted ml-1">{t('admin.inventory.updateThresholdLevel')}</h3>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={selectedThreshold}
                                        aria-label={t('admin.inventory.updateThresholdLevel')}
                                        onChange={(e) => setSelectedThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder={t('admin.inventory.valuePlaceholder')}
                                        className="w-full bg-admin-surface-2 border border-admin-border rounded-admin-lg px-5 py-3 text-sm text-admin-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/30 focus-visible:border-admin-accent/40 transition-colors font-bold"
                                    />
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={() => saveThreshold(selected.product_id)}
                                        className="h-12 px-6 rounded-admin-lg bg-admin-accent text-admin-accent-fg text-xs font-semibold hover:bg-admin-accent-hover transition-shadow shadow-admin-md shadow-cyan-400/10 disabled:opacity-50"
                                    >
                                        {saving ? t('admin.ui.loadingShort') : t('admin.ui.save')}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={() => setSelectedThreshold('')}
                                        className="h-12 px-5 rounded-admin-lg bg-admin-surface border border-admin-border text-admin-fg-muted text-xs font-semibold hover:text-admin-warning hover:border-admin-warning/30 transition-colors"
                                    >
                                        {t('admin.inventory.reset')}
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* Stok Hareketleri */}
                        {hasWriteAccess && (
                            <div className="bg-admin-surface rounded-admin-lg border border-admin-border p-6 space-y-4">
                                <InventoryStockAdjust
                                    _productId={selected.product_id}
                                    onAdjust={adjustStock}
                                    moving={moving}
                                    moveQty={moveQty}
                                    setMoveQty={setMoveQty}
                                />
                            </div>
                        )}

                        {/* Rezerve Siparişler */}
                        <div className="bg-admin-surface rounded-admin-lg border border-admin-border overflow-hidden">
                            <div className="p-5 border-b border-admin-border bg-admin-surface-2">
                                <h3 className="text-xs font-semibold text-admin-fg-muted">{t('admin.inventory.reservedOrders')}</h3>
                            </div>
                            <InventoryReservedTable reservedOrders={reservedOrders} />
                        </div>

                        {/* Hareket Geçmişi */}
                        <div className="bg-admin-surface rounded-admin-lg border border-admin-border overflow-hidden">
                            <div className="p-5 border-b border-admin-border bg-admin-surface-2 flex items-center justify-between">
                                <h3 className="text-xs font-semibold text-admin-fg-muted">{t('admin.inventory.recentMovements')}</h3>
                                {movements.length > 0 && hasWriteAccess && (
                                    <button
                                        type="button"
                                        onClick={undoLastMovement}
                                        disabled={undoing}
                                        className="text-xs font-semibold text-admin-danger hover:text-admin-danger transition-opacity disabled:opacity-50"
                                    >
                                        {undoing ? t('admin.inventory.undoing') : t('admin.inventory.undoLast')}
                                    </button>
                                )}
                            </div>
                            <InventoryMovementHistory
                                movements={movements}
                            />
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
