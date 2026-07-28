import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

const router = Router();

const STATUTS_VALIDES = ['confirme', 'en_attente', 'annule', 'honore', 'no_show'];

// GET /api/appointments?upcoming=true
router.get('/', async (req, res) => {
  let query = supabaseAdmin
    .from('rendez_vous')
    .select('*, patients(id, nom, telephone, email, risk_score)')
    .eq('practitioner_id', req.user.id)
    .order('date_heure', { ascending: true });

  if (req.query.upcoming === 'true') {
    query = query.gte('date_heure', new Date().toISOString());
  }

  const { data, error } = await query;

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/appointments
router.post('/', async (req, res) => {
  const { patient_id, date_heure, statut, notes } = req.body;

  if (!patient_id || !date_heure) {
    return res.status(400).json({ error: 'Le patient et la date/heure sont requis.' });
  }
  if (statut && !STATUTS_VALIDES.includes(statut)) {
    return res.status(400).json({ error: 'Statut invalide.' });
  }

  // Verifie que le patient appartient bien au praticien authentifie
  const { data: patient, error: patientError } = await supabaseAdmin
    .from('patients')
    .select('id')
    .eq('id', patient_id)
    .eq('practitioner_id', req.user.id)
    .single();

  if (patientError || !patient) {
    return res.status(404).json({ error: 'Patient introuvable.' });
  }

  const { data, error } = await supabaseAdmin
    .from('rendez_vous')
    .insert({
      practitioner_id: req.user.id,
      patient_id,
      date_heure,
      statut: statut || 'en_attente',
      notes: notes?.trim() || null,
    })
    .select('*, patients(id, nom, telephone, email, risk_score)')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT /api/appointments/:id
router.put('/:id', async (req, res) => {
  const { patient_id, date_heure, statut, notes } = req.body;

  if (statut && !STATUTS_VALIDES.includes(statut)) {
    return res.status(400).json({ error: 'Statut invalide.' });
  }

  const updates = {};
  if (patient_id !== undefined) updates.patient_id = patient_id;
  if (date_heure !== undefined) updates.date_heure = date_heure;
  if (statut !== undefined) updates.statut = statut;
  if (notes !== undefined) updates.notes = notes?.trim() || null;

  const { data, error } = await supabaseAdmin
    .from('rendez_vous')
    .update(updates)
    .eq('id', req.params.id)
    .eq('practitioner_id', req.user.id)
    .select('*, patients(id, nom, telephone, email, risk_score)')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Rendez-vous introuvable.' });
  res.json(data);
});

// DELETE /api/appointments/:id
router.delete('/:id', async (req, res) => {
  const { error } = await supabaseAdmin
    .from('rendez_vous')
    .delete()
    .eq('id', req.params.id)
    .eq('practitioner_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

export default router;
