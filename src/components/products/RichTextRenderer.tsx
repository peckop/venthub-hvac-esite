import React from 'react'
import { Check } from 'lucide-react'

interface RichTextRendererProps {
  content: string
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content }) => {
  if (!content) return null;

  const sections = content.split(/\n\n+/);

  return (
    <div className="space-y-6 text-steel-gray leading-relaxed">
      {sections.map((section, idx) => {
        if (section.trim().startsWith('**') && section.trim().endsWith(':**')) {
          return <h4 key={idx} className="text-lg font-bold text-industrial-gray mt-4 mb-2">{section.replace(/\*\*/g, '')}</h4>
        }

        if (!section.trim().match(/^[*-]\s+/)) {
          const parts = section.split(/(\*\*.*?\*\*)/g);
          if (parts.length > 1) {
            return (
              <p key={idx}>
                {parts.map((part, pIdx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={pIdx} className="font-semibold text-industrial-gray">{part.replace(/\*\*/g, '')}</strong>
                  }
                  return part;
                })}
              </p>
            )
          }
        }

        if (section.includes('\n* ') || section.startsWith('* ')) {
          const items = section.split(/\n\* |\n- /).filter(i => i.trim().length > 0 && i !== '* ' && i !== '- ');
          const firstLine = items[0].startsWith('* ') ? '' : items[0];
          const listItems = firstLine ? items.slice(1) : items;

          return (
            <div key={idx}>
              {firstLine && <p className="mb-2">{firstLine}</p>}
              <ul className="space-y-3 mt-2">
                {listItems.map((item, i) => {
                  const cleanItem = item.replace(/^\* |^- /, '');
                  const itemParts = cleanItem.split(/(\*\*.*?\*\*)/g);

                  return (
                    <li key={i} className="flex items-start">
                      <Check size={18} className="text-success-green mr-3 mt-1 flex-shrink-0" />
                      <span>
                        {itemParts.map((part, partIdx) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={partIdx}>{part.replace(/\*\*/g, '')}</strong>
                          }
                          return part;
                        })}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        }

        return <p key={idx}>{section}</p>
      })}
    </div>
  )
}

export default RichTextRenderer
