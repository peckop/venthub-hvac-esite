import React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { adminButtonSecondaryClass } from '../../utils/adminUi'
import { Settings2, Check, Layout, Maximize2 } from 'lucide-react'

export type ColumnToggle = { key: string; label: string; checked: boolean; onChange: (v: boolean) => void }
export type Density = 'comfortable' | 'compact'

export const ColumnsMenu: React.FC<{
  columns: ColumnToggle[]
  density: Density
  onDensityChange: (d: Density) => void
  buttonLabel?: string
}> = ({ columns, density, onDensityChange, buttonLabel }) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className={adminButtonSecondaryClass + " h-12 flex items-center gap-2 px-5 min-w-[140px]"}>
          <Settings2 size={16} className="text-cyan-400" />
          <span className="truncate">{buttonLabel || 'Görünüm'}</span>
        </button>
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="min-w-[240px] glass-strong rounded-3xl border border-white/10 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200 z-[100]"
          align="end"
          sideOffset={8}
        >
          <div className="px-4 pt-3 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/5 mb-2 flex items-center gap-2">
            <Layout size={12} />
            Aktif Kolonlar
          </div>
          
          <div className="space-y-1 overflow-y-auto max-h-[300px] custom-scrollbar px-1">
            {columns.map(col => (
              <DropdownMenu.CheckboxItem
                key={col.key}
                checked={col.checked}
                onCheckedChange={(v) => col.onChange(Boolean(v))}
                className="group flex items-center justify-between px-3 py-2.5 text-[11px] font-bold text-slate-300 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-all outline-none data-[state=checked]:text-cyan-400"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-md border transition-all flex items-center justify-center ${col.checked ? 'bg-cyan-400 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'border-white/10 bg-white/5'}`}>
                    {col.checked && <Check size={10} className="text-[#0A0F1E] stroke-[4px]" />}
                  </div>
                  {col.label}
                </div>
              </DropdownMenu.CheckboxItem>
            ))}
          </div>
          
          <DropdownMenu.Separator className="my-3 h-px bg-white/5" />
          
          <div className="px-4 pt-1 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
            <Maximize2 size={12} />
            Satır Yoğunluğu
          </div>
          
          <DropdownMenu.RadioGroup 
            value={density} 
            onValueChange={(v) => onDensityChange(v as Density)}
            className="px-1"
          >
            <DropdownMenu.RadioItem 
              value="comfortable" 
              className="group flex items-center justify-between px-3 py-2.5 text-[11px] font-bold text-slate-300 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-all outline-none data-[state=checked]:text-cyan-400"
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center ${density === 'comfortable' ? 'bg-cyan-400 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'border-white/10 bg-white/5'}`}>
                  {density === 'comfortable' && <div className="w-1.5 h-1.5 rounded-full bg-[#0A0F1E]" />}
                </div>
                Rahat (Varsayılan)
              </div>
            </DropdownMenu.RadioItem>
            
            <DropdownMenu.RadioItem 
              value="compact" 
              className="group flex items-center justify-between px-3 py-2.5 text-[11px] font-bold text-slate-300 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-all outline-none data-[state=checked]:text-cyan-400"
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center ${density === 'compact' ? 'bg-cyan-400 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'border-white/10 bg-white/5'}`}>
                  {density === 'compact' && <div className="w-1.5 h-1.5 rounded-full bg-[#0A0F1E]" />}
                </div>
                Sıkışık (Maksimum Veri)
              </div>
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default ColumnsMenu
