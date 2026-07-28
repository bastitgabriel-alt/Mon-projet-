import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

const router = Router();

// GET /api/practitioners/me
router.get('/me', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('practitioners')
    .select('id, nom, email, created_at')
    .eq('id', req.user.id)
    .single();

  if (error) return res.status(404).json({ error: 'Profil praticien introuvable.' });
  res.json(data);
});

export default router;
