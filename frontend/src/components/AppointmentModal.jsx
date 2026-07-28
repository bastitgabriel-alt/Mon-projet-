import { useState } from 'react';
import { STATUT_LABELS } from './badges';

function toLocalInputValue(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function AppointmentModal({ patients, appointment, onClose, onSubmit }) {
  const isEdit = Boolean(appointment?.id);
  const [patientId, setPatientId] = useState(appointment?.patient_id || patients[0]?.id || '');
  const [dateHeure, setDateHeure] = useState(toLocalInputValue(appointment?.date_heure));
  const [statut, setStatut] = useState(appointment?.statut || 'en_attente');
  const [notes, setNotes] = useState(appointment?.notes || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!patientId || !dateHeure) {
      setError('Veuillez sélectionner un patient et une date/heure.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        patient_id: patientId,
        date_heure: new Date(dateHeure).toISOString(),
        statut,
        notes,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card card">
        <h2>{isEdit ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}</h2>
        {error && <div className="error-banner">{error}</div>}
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="patient">Patient</label>
            <select
              id="patient"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              required
            >
              <option value="" disabled>
                Sélectionner un patient
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="date_heure">Date et heure</label>
            <input
              id="date_heure"
              type="datetime-local"
              value={dateHeure}
              onChange={(e) => setDateHeure(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="statut">Statut</label>
            <select id="statut" value={statut} onChange={(e) => setStatut(e.target.value)}>
              {Object.entries(STATUT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="notes">Notes (optionnel)</label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer le rendez-vous'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
