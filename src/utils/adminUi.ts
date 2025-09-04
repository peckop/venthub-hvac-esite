// Centralized admin UI tokens for consistent typography and spacing
export const adminNavClass = (isActive: boolean) =>
  `block px-3 py-2 rounded text-sm ${isActive ? 'bg-primary-navy text-white' : 'text-steel-gray hover:bg-light-gray'}`

export const adminSectionTitleClass = 'text-xl font-semibold text-primary-navy'
export const adminSubtitleClass = 'text-sm text-industrial-gray'
export const adminCardClass = 'bg-white rounded-lg shadow-hvac-md'
export const adminCardPaddedClass = `${adminCardClass} p-4`
export const adminTableHeadCellClass = 'text-left p-3 text-xs font-medium text-industrial-gray uppercase tracking-wide'
export const adminTableCellClass = 'p-3 text-steel-gray'
export const adminButtonPrimaryClass = 'px-3 py-2 rounded bg-primary-navy text-white hover:opacity-90'
