import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { RiskBadge } from '../components/badges';
import { PatientModal } from '../components/PatientModal';

export function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    setError('');
    try {
      setPatients(await api.getPatients());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(payload) {
    await api.createPatient(payload);
    setModalOpen(false);
    await load();
  }

  async function handleUpdate(payload) {
    await api.updatePatient(editing.id, payload);
    setEditing(null);
    await load();
  }

  async function handleDelete(patient) {
    if (!confirm(`Supprimer ${patient.nom} et son historique de rendez-vous ?`)) return;
    try {
      await api.deletePatient(patient.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="loading-block">Chargement des patients...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Patients</h1>
          <p>Coordonnées et score de risque de no-show de chaque patient.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + Nouveau patient
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        {patients.length === 0 ? (
          <div className="empty-state">Aucun patient enregistré pour le moment.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Rendez-vous</th>
                <th>Score de risque</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>{p.nom}</td>
                  <td>{p.telephone || '—'}</td>
                  <td>{p.email || '—'}</td>
                  <td>{p.total_rdv}</td>
                  <td>
                    <RiskBadge score={p.risk_score} />
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-link" onClick={() => setEditing(p)}>
                        Modifier
                      </button>
                      <button
                        className="btn-link"
                        style={{ color: 'var(--color-danger)' }}
                        onClick={() => handleDelete(p)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && <PatientModal onClose={() => setModalOpen(false)} onSubmit={handleCreate} />}
      {editing && (
        <PatientModal patient={editing} onClose={() => setEditing(null)} onSubmit={handleUpdate} />
      )}
    </div>
  );
}
