import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

const router = Router();

// GET /api/patients
router.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('patients')
    .select('*')
    .eq('practitioner_id', req.user.id)
    .order('nom', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/patients/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('patients')
    .select('*')
    .eq('id', req.params.id)
    .eq('practitioner_id', req.user.id)
    .single();

  if (error) return res.status(404).json({ error: 'Patient introuvable.' });
  res.json(data);
});

// POST /api/patients
router.post('/', async (req, res) => {
  const { nom, telephone, email } = req.body;

  if (!nom || !nom.trim()) {
    return res.status(400).json({ error: 'Le nom du patient est requis.' });
  }

  const { data, error } = await supabaseAdmin
    .from('patients')
    .insert({
      practitioner_id: req.user.id,
      nom: nom.trim(),
      telephone: telephone?.trim() || null,
      email: email?.trim() || null,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT /api/patients/:id
router.put('/:id', async (req, res) => {
  const { nom, telephone, email } = req.body;

  if (!nom || !nom.trim()) {
    return res.status(400).json({ error: 'Le nom du patient est requis.' });
  }

  const { data, error } = await supabaseAdmin
    .from('patients')
    .update({
      nom: nom.trim(),
      telephone: telephone?.trim() || null,
      email: email?.trim() || null,
    })
    .eq('id', req.params.id)
    .eq('practitioner_id', req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Patient introuvable.' });
  res.json(data);
});

// DELETE /api/patients/:id
router.delete('/:id', async (req, res) => {
  const { error } = await supabaseAdmin
    .from('patients')
    .delete()
    .eq('id', req.params.id)
    .eq('practitioner_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

export default router;
