import { styleFor } from '../utils/categoryStyles.js'

// Affiche une copie (photo réelle si disponible, sinon un visuel stylisé de
// feuille de copie) avec les annotations du prof superposées sous forme de
// pastilles numérotées, positionnées en pourcentage pour rester responsive.
export default function AnnotatedCopy({ imageUrl, annotations, activeId, onSelect }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-ink-100 bg-white aspect-[3/4] shadow-card">
      {imageUrl ? (
        <img src={imageUrl} alt="Copie scannée" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-[repeating-linear-gradient(to_bottom,#f7f4ec_0px,#f7f4ec_27px,#e0dbcb_28px)] p-6">
          <div className="h-full w-full opacity-60" />
        </div>
      )}
      {annotations.map((ann, i) => {
        const style = styleFor(ann.category)
        const isActive = activeId === ann.id
        return (
          <button
            key={ann.id}
            onClick={() => onSelect?.(ann.id)}
            style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-soft ring-2 ring-white transition-transform ${style.dot} ${
              isActive ? 'scale-125' : ''
            }`}
          >
            {i + 1}
          </button>
        )
      })}
    </div>
  )
}
