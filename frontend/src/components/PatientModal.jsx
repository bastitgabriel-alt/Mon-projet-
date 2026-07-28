import { useState } from 'react';

export function PatientModal({ patient, onClose, onSubmit }) {
  const isEdit = Boolean(patient?.id);
  const [nom, setNom] = useState(patient?.nom || '');
  const [telephone, setTelephone] = useState(patient?.telephone || '');
  const [email, setEmail] = useState(patient?.email || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!nom.trim()) {
      setError('Le nom du patient est requis.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({ nom, telephone, email });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card card">
        <h2>{isEdit ? 'Modifier le patient' : 'Nouveau patient'}</h2>
        {error && <div className="error-banner">{error}</div>}
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="nom">Nom complet</label>
            <input
              id="nom"
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="telephone">Téléphone</label>
            <input
              id="telephone"
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
            />
          </div>

          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Ajouter le patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
