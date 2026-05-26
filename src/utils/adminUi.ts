// Centralized admin UI tokens for consistent typography, spacing and modern aesthetics (Industrial Navy)

export const adminSectionTitleClass = 'text-3xl font-black tracking-tight text-white sm:text-4xl uppercase'
export const adminSubtitleClass = 'text-sm font-bold text-slate-500 uppercase tracking-widest mt-2 leading-relaxed max-w-2xl'

export const glassStrongClass = 'glass-strong backdrop-blur-xl border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.3)]'
export const adminCardClass = `${glassStrongClass} rounded-hvac-xl transition-colors duration-500 hover:border-white/10`
export const adminCardPaddedClass = `${adminCardClass} p-8 lg:p-10`

export const adminTableHeadCellClass = 'text-left px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-hvac-normal glass-strong border-b border-white/5'
export const adminTableCellClass = 'px-6 py-5 text-sm text-slate-200 font-bold align-middle border-b border-white/5 group-hover:bg-white/5 transition-colors'
export const adminTableContainerClass = 'relative overflow-hidden glass rounded-hvac-xl border border-white/5 shadow-2xl'

export const adminButtonPrimaryClass = 'inline-flex justify-center items-center gap-2 px-6 h-12 rounded-2xl bg-cyan-400 text-surface-deep text-sm font-black uppercase tracking-widest hover:bg-cyan-300 hover:shadow-glow-md transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400/50'
export const adminButtonSecondaryClass = 'inline-flex justify-center items-center gap-2 px-6 h-12 rounded-2xl glass border border-white/5 text-slate-300 text-sm font-black uppercase tracking-widest hover:bg-white/5 hover:border-white/10 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/10'

export const adminTableActionClass = 'inline-flex justify-center items-center px-4 h-9 rounded-xl glass border border-white/5 text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition-colors whitespace-nowrap'
export const adminTableActionDangerClass = 'inline-flex justify-center items-center px-4 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-black uppercase tracking-widest hover:bg-rose-500/20 transition-colors whitespace-nowrap'
export const adminTableActionPrimaryClass = 'inline-flex justify-center items-center px-4 h-9 rounded-xl bg-cyan-400 text-surface-deep text-xs font-black uppercase tracking-widest hover:bg-cyan-300 transition-colors whitespace-nowrap'
export const adminTableActionWarningClass = 'inline-flex justify-center items-center px-4 h-9 rounded-xl bg-amber-500 text-surface-deep text-xs font-black uppercase tracking-widest hover:bg-amber-400 transition-colors whitespace-nowrap'


export const adminInputClass = 'w-full bg-white/3 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/40 transition-colors placeholder:text-slate-600 font-bold'
export const adminSelectClass = 'w-full bg-white/3 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/40 transition-colors font-bold cursor-pointer appearance-none bg-no-repeat bg-[right_0.75rem_center]'
export const adminSelectStyle = { 
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(34,211,238,0.6)' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`,
  backgroundSize: '0.875rem'
}

// Admin Settings Page specific "Pro Max" UI Tokens
export const adminSettingsLabelClass = 'block text-xs font-black text-slate-500 uppercase tracking-hvac-normal mb-3 ml-1'
