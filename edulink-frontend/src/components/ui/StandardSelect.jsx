import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from '../../utils/cn'

const STANDARDS = [
  '1st Standard',
  '2nd Standard',
  '3rd Standard',
  '4th Standard',
  '5th Standard',
  '6th Standard',
  '7th Standard',
  '8th Standard',
  '9th Standard',
  '10th Standard'
]

export const StandardSelect = ({ value, onChange, name = 'standard', placeholder = 'Select Standard', disabled = false, error = false }) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  
  const containerRef = useRef(null)
  const buttonRef = useRef(null)

  // Measure trigger element bounding rect relative to the viewport
  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom,
        left: rect.left,
        width: rect.width
      })
    }
  }

  // Update coords and bind/unbind listeners on open status transitions
  useEffect(() => {
    if (open) {
      updateCoords()
      window.addEventListener('resize', updateCoords)
      // Capture scroll events at any level to keep positioning anchored
      window.addEventListener('scroll', updateCoords, true)
    }
    return () => {
      window.removeEventListener('resize', updateCoords)
      window.removeEventListener('scroll', updateCoords, true)
    }
  }, [open])

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        !e.target.closest('.standard-select-portal') // Ensure click didn't land inside portal overlay
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const filtered = STANDARDS.filter(s => s.toLowerCase().includes(search.toLowerCase()))

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } })
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-border/60 bg-background/50 px-3.5 py-2 text-sm transition-all focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 text-left font-medium shadow-sm hover:border-border",
          error && "border-destructive focus:ring-destructive/20 focus:border-destructive",
          !value && "text-muted-foreground"
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && createPortal(
        <div 
          className="overflow-hidden rounded-xl border border-border bg-white dark:bg-slate-950 text-popover-foreground shadow-premium animate-scale-up standard-select-portal"
          style={{
            position: 'fixed',
            top: `${coords.top + 6}px`,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            zIndex: 9999
          }}
        >
          <div className="relative border-b border-border/60 p-2 bg-muted/10">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search standard..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full pl-8 pr-3 text-xs bg-background border border-border/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="max-h-48 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground font-medium text-center">
                No standard found
              </div>
            ) : (
              filtered.map((std) => (
                <button
                  key={std}
                  type="button"
                  onClick={() => handleSelect(std)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold text-left transition-colors select-none",
                    value === std
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent hover:text-foreground text-muted-foreground"
                  )}
                >
                  <span>{std}</span>
                  {value === std && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
