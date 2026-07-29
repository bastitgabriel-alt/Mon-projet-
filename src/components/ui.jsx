export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-white shadow-card border border-ink-100 ${className}`}>
      {children}
    </div>
  )
}

export function SectionTitle({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <div>
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600 mb-0.5">{eyebrow}</p>
        )}
        <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function ProgressBar({ value, colorClass = 'bg-brand-500' }) {
  const safe = Math.max(0, Math.min(100, value))
  return (
    <div className="h-2 w-full rounded-full bg-ink-100 overflow-hidden">
      <div
        className={`h-full rounded-full ${colorClass} transition-all duration-500`}
        style={{ width: `${safe}%` }}
      />
    </div>
  )
}

export function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800',
    secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
    ghost: 'bg-transparent text-ink-600 hover:bg-ink-100'
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
