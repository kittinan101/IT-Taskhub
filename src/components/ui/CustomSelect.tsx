"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

export interface SelectOption {
  value: string
  label: string
  dot?: string // tailwind bg color class for dot
  icon?: React.ReactNode
}

interface CustomSelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  icon?: React.ReactNode
  className?: string
}

export default function CustomSelect({ options, value, onChange, placeholder = "Select...", label, icon, className = "" }: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && (
        <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1.5">
          {icon} {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-left hover:border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
      >
        <span className="flex items-center gap-2 truncate">
          {selected?.dot && <span className={`w-2 h-2 rounded-full shrink-0 ${selected.dot}`} />}
          {selected?.icon}
          <span className={selected ? "text-gray-900" : "text-gray-400"}>{selected?.label || placeholder}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left cursor-pointer transition-colors ${
                opt.value === value ? "bg-indigo-50 text-indigo-600" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {opt.dot && <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />}
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
