export const STATUT_LABELS = {
  confirme: 'Confirmé',
  en_attente: 'En attente',
  annule: 'Annulé',
  honore: 'Honoré',
  no_show: 'No-show',
};

export function StatusBadge({ statut }) {
  return <span className={`badge badge-${statut}`}>{STATUT_LABELS[statut] || statut}</span>;
}

export function riskLevel(score) {
  if (score >= 0.5) return 'high';
  if (score >= 0.2) return 'medium';
  return 'low';
}

export function RiskBadge({ score }) {
  const level = riskLevel(score ?? 0);
  const pct = Math.round((score ?? 0) * 100);
  return (
    <span className={`risk-pill risk-${level}`}>
      <span className="risk-dot" />
      {pct}%
    </span>
  );
}
