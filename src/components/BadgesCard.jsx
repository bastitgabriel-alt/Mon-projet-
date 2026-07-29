import { Card } from './ui.jsx'

export default function BadgesCard({ earned, nextBadge }) {
  return (
    <Card className="p-[22px]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-[15.5px] font-semibold text-ink-900">Tes succès</h2>
        <span className="text-xs text-ink-400">{earned.length} débloqué{earned.length > 1 ? 's' : ''}</span>
      </div>

      {earned.length > 0 ? (
        <div className="mb-4 flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {earned.map((b) => (
            <div key={b.id} className="flex w-[84px] shrink-0 flex-col items-center gap-1.5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-soft text-xl">
                {b.icon}
              </div>
              <span className="text-[11px] font-medium leading-tight text-ink-600">{b.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-4 text-[12.5px] text-ink-500">
          Scanne une copie ou lance une session de révision pour débloquer ton premier succès.
        </p>
      )}

      {nextBadge && (
        <div className="rounded-[9px] bg-ink-50 px-3.5 py-2.5 text-[12.5px] text-ink-600">
          <span className="mr-1.5 text-base align-middle">{nextBadge.icon}</span>
          Encore <b className="text-ink-900">{nextBadge.remaining} {nextBadge.unit}</b> pour débloquer « {nextBadge.label} »
        </div>
      )}
    </Card>
  )
}
