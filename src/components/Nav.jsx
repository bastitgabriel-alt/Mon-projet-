import { HomeIcon, ScanIcon, CardsIcon } from './icons.jsx'

const tabs = [
  { id: 'dashboard', label: 'Tableau de bord', Icon: HomeIcon },
  { id: 'scan', label: 'Copies', Icon: ScanIcon },
  { id: 'fiches', label: 'Fiches', Icon: CardsIcon }
]

export default function Nav({ current, onNavigate, userEmail, onSignOut }) {
  const initial = (userEmail || '?').trim().charAt(0).toUpperCase()

  return (
    <aside className="w-full shrink-0 bg-gradient-to-b from-sidebar-2 to-sidebar-1 text-white flex md:sticky md:top-0 md:h-screen md:w-[232px] md:flex-col md:px-[18px] md:py-[26px] items-center px-4 py-3 gap-2 md:gap-0">
      <div className="font-display font-semibold text-[21px] tracking-tight pr-4 md:pr-0 md:px-2.5 md:pb-7 shrink-0">
        Marge<span className="text-coral">.</span>
      </div>

      <nav className="flex flex-1 overflow-x-auto no-scrollbar gap-1 md:flex-col md:overflow-visible md:gap-0.5 md:mb-auto">
        {tabs.map(({ id, label, Icon }) => {
          const active = current === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`relative flex shrink-0 items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-[13.5px] transition-colors ${
                active ? 'bg-white/10 text-white font-medium' : 'text-sidebar-soft hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              {active && (
                <span className="hidden md:block absolute -left-[18px] top-2 bottom-2 w-[3px] rounded bg-coral" />
              )}
              <Icon className="w-[17px] h-[17px] shrink-0 opacity-90" />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          )
        })}
      </nav>

      <div className="hidden md:flex items-center gap-2.5 border-t border-sidebar-line pt-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-coral to-[#ff7a5c] font-mono text-[12.5px] font-bold">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium text-white leading-tight">{userEmail}</div>
          <button onClick={onSignOut} className="text-[11.5px] text-sidebar-soft hover:text-white transition-colors">
            Se déconnecter
          </button>
        </div>
      </div>
    </aside>
  )
}
