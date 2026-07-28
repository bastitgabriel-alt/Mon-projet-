import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { RiskBadge, StatusBadge, STATUT_LABELS } from '../components/badges';
import { AppointmentModal } from '../components/AppointmentModal';

function formatDateHeure(iso) {
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function Dashboard() {
  const [data, setData] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  async function loadAll() {
    setError('');
    try {
      const [dashboard, patientList] = await Promise.all([
        api.getDashboard(),
        api.getPatients(),
      ]);
      setData(dashboard);
      setPatients(patientList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleCreate(payload) {
    await api.createAppointment(payload);
    setModalOpen(false);
    await loadAll();
  }

  async function handleUpdate(payload) {
    await api.updateAppointment(editing.id, payload);
    setEditing(null);
    await loadAll();
  }

  async function handleQuickStatus(appointment, statut) {
    try {
      await api.updateAppointment(appointment.id, { statut });
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(appointment) {
    if (!confirm('Supprimer ce rendez-vous ?')) return;
    try {
      await api.deleteAppointment(appointment.id);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="loading-block">Chargement du tableau de bord...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vos rendez-vous à venir et le risque de no-show associé à chaque patient.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setModalOpen(true)}
          disabled={patients.length === 0}
          title={patients.length === 0 ? 'Ajoutez d’abord un patient' : ''}
        >
          + Nouveau rendez-vous
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-label">Rendez-vous à venir</div>
          <div className="stat-value">{data.upcomingAppointments.length}</div>
        </div>
        <div className="card stat-card accent">
          <div className="stat-label">No-shows évités ce mois-ci</div>
          <div className="stat-value">{data.noShowsEvitesCeMois}</div>
          <div className="stat-hint">
            Rendez-vous honorés par des patients à risque élevé (≥ {Math.round(data.seuilRisque * 100)}%)
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-header" style={{ padding: '1.1rem 1.1rem 0' }}>
          <h2>Rendez-vous à venir</h2>
        </div>
        {data.upcomingAppointments.length === 0 ? (
          <div className="empty-state">Aucun rendez-vous à venir pour le moment.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date &amp; heure</th>
                <th>Score de risque</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.upcomingAppointments.map((rdv) => (
                <tr key={rdv.id}>
                  <td>{rdv.patients?.nom}</td>
                  <td>{formatDateHeure(rdv.date_heure)}</td>
                  <td>
                    <RiskBadge score={rdv.patients?.risk_score} />
                  </td>
                  <td>
                    <StatusBadge statut={rdv.statut} />
                  </td>
                  <td>
                    <div className="table-actions">
                      <select
                        value={rdv.statut}
                        onChange={(e) => handleQuickStatus(rdv, e.target.value)}
                        style={{ padding: '0.3rem 0.5rem', borderRadius: 6, border: '1px solid var(--color-border)' }}
                      >
                        {Object.entries(STATUT_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <button className="btn-link" onClick={() => setEditing(rdv)}>
                        Modifier
                      </button>
                      <button className="btn-link" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(rdv)}>
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

      {modalOpen && (
        <AppointmentModal patients={patients} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
      )}
      {editing && (
        <AppointmentModal
          patients={patients}
          appointment={editing}
          onClose={() => setEditing(null)}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}
