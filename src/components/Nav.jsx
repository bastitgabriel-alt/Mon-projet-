import { HomeIcon, ScanIcon, CardsIcon } from './icons.jsx'

const tabs = [
  { id: 'dashboard', label: 'Accueil', Icon: HomeIcon },
  { id: 'scan', label: 'Scan', Icon: ScanIcon },
  { id: 'fiches', label: 'Fiches', Icon: CardsIcon }
]

export default function Nav({ current, onNavigate }) {
  return (
    <>
      {/* Bottom nav — mobile, toujours accessible */}
      <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-ink-100 bg-white/95 backdrop-blur safe-bottom md:hidden">
        <div className="mx-auto flex max-w-md justify-around px-2 py-2">
          {tabs.map(({ id, label, Icon }) => {
            const active = current === id
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-xs font-medium"
              >
                <Icon className={`w-6 h-6 ${active ? 'text-brand-600' : 'text-ink-400'}`} />
                <span className={active ? 'text-brand-700' : 'text-ink-500'}>{label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Side rail — desktop */}
      <nav className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-56 md:border-r md:border-ink-100 md:bg-white md:px-4 md:py-6 z-30">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white font-bold">M</div>
          <span className="text-lg font-semibold text-ink-900">Marge</span>
        </div>
        <div className="flex flex-col gap-1">
          {tabs.map(({ id, label, Icon }) => {
            const active = current === id
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
