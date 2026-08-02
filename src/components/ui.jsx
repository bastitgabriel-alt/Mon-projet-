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
          <p className="text-xs font-medium uppercase tracking-wide text-indigo mb-0.5">{eyebrow}</p>
        )}
        <h2 className="font-display text-lg font-semibold text-ink-900">{title}</h2>
      </div>
      {action}
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
    primary: 'bg-gradient-to-br from-indigo to-[#2e4368] text-white hover:brightness-110',
    secondary: 'bg-indigo-soft text-indigo hover:brightness-95',
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
