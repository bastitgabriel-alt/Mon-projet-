import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, options = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (response.status === 204) return null;

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.error || `Erreur ${response.status}`);
  }

  return body;
}

export const api = {
  getDashboard: () => request('/api/dashboard'),

  getPatients: () => request('/api/patients'),
  createPatient: (patient) =>
    request('/api/patients', { method: 'POST', body: JSON.stringify(patient) }),
  updatePatient: (id, patient) =>
    request(`/api/patients/${id}`, { method: 'PUT', body: JSON.stringify(patient) }),
  deletePatient: (id) => request(`/api/patients/${id}`, { method: 'DELETE' }),

  getAppointments: (upcoming = false) =>
    request(`/api/appointments${upcoming ? '?upcoming=true' : ''}`),
  createAppointment: (appointment) =>
    request('/api/appointments', { method: 'POST', body: JSON.stringify(appointment) }),
  updateAppointment: (id, appointment) =>
    request(`/api/appointments/${id}`, { method: 'PUT', body: JSON.stringify(appointment) }),
  deleteAppointment: (id) => request(`/api/appointments/${id}`, { method: 'DELETE' }),
};
