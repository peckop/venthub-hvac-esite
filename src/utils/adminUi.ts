// Centralized admin UI tokens for consistent typography, spacing and modern aesthetics
export const adminNavClass = (isActive: boolean) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary-navy text-white shadow-md shadow-primary-navy/20' : 'text-slate-600 hover:bg-slate-100 hover:text-primary-navy hover:translate-x-0.5'}`

export const adminSectionTitleClass = 'text-2xl font-bold tracking-tight text-slate-900'
export const adminSubtitleClass = 'text-sm text-slate-500 mt-1'

export const adminCardClass = 'bg-white rounded-xl shadow-sm border border-slate-200/60 transition-all duration-200'
export const adminCardPaddedClass = `${adminCardClass} p-5 lg:p-6`

export const adminTableHeadCellClass = 'text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 border-b border-slate-200'
export const adminTableCellClass = 'p-4 text-sm text-slate-600 align-middle border-b border-slate-100'

export const adminButtonPrimaryClass = 'inline-flex justify-center items-center gap-2 px-4 h-10 rounded-lg bg-primary-navy text-white text-sm font-medium hover:bg-primary-navy/90 hover:shadow-md hover:shadow-primary-navy/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-navy'
export const adminButtonSecondaryClass = 'inline-flex justify-center items-center gap-2 px-4 h-10 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 hover:text-primary-navy hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200'

export const adminTableActionClass = 'inline-flex justify-center items-center px-3 h-8 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-wider hover:bg-slate-50 hover:border-slate-300 hover:text-primary-navy hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-200 whitespace-nowrap'
export const adminTableActionDangerClass = 'inline-flex justify-center items-center px-3 h-8 rounded-md bg-white border border-rose-200 text-rose-600 text-[11px] font-bold uppercase tracking-wider hover:bg-rose-50 hover:border-rose-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-rose-200 whitespace-nowrap'
export const adminTableActionPrimaryClass = 'inline-flex justify-center items-center px-3 h-8 rounded-md bg-primary-navy border border-transparent text-white text-[11px] font-bold uppercase tracking-wider hover:bg-primary-navy/90 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-navy whitespace-nowrap'
export const adminTableActionWarningClass = 'inline-flex justify-center items-center px-3 h-8 rounded-md bg-amber-500 border border-transparent text-white text-[11px] font-bold uppercase tracking-wider hover:bg-amber-600 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-500 whitespace-nowrap'
export const adminTableActionNeutralClass = 'inline-flex justify-center items-center px-3 h-8 rounded-md bg-slate-600 border border-transparent text-white text-[11px] font-bold uppercase tracking-wider hover:bg-slate-700 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-600 whitespace-nowrap'

export const adminTableIconButtonClass = 'inline-flex justify-center items-center w-8 h-8 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-primary-navy hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-200 flex-shrink-0'
