import { useState, useRef, useEffect } from 'react'

interface Option {
  id: number
  label: string
}

interface Props {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}

export default function SearchableSelect({ options, value, onChange, placeholder = '-- Select --', label }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => String(o.id) === value)

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (id: number) => {
    onChange(String(id))
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        type="text"
        value={open ? query : (selected?.label ?? '')}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => { setOpen(true); setQuery('') }}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white cursor-text"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style={{ top: label ? '2rem' : '0' }}>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-400">No matches</li>
          ) : (
            filtered.map((o) => (
              <li
                key={o.id}
                onClick={() => handleSelect(o.id)}
                className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-amber-50 transition-colors ${
                  String(o.id) === value ? 'bg-amber-100 font-medium text-amber-800' : 'text-gray-700'
                }`}
              >
                {o.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
