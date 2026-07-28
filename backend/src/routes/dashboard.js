import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

const router = Router();

// Seuil au-dela duquel un patient est considere "a risque" pour le calcul
// du nombre de no-shows evites (rendez-vous honores malgre un risque eleve).
const SEUIL_RISQUE = 0.3;

// GET /api/dashboard
router.get('/', async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  const [upcomingRes, monthRes] = await Promise.all([
    supabaseAdmin
      .from('rendez_vous')
      .select('*, patients(id, nom, telephone, email, risk_score)')
      .eq('practitioner_id', req.user.id)
      .gte('date_heure', now.toISOString())
      .order('date_heure', { ascending: true })
      .limit(50),
    supabaseAdmin
      .from('rendez_vous')
      .select('id, statut, patients(risk_score)')
      .eq('practitioner_id', req.user.id)
      .eq('statut', 'honore')
      .gte('date_heure', startOfMonth)
      .lt('date_heure', startOfNextMonth),
  ]);

  if (upcomingRes.error) return res.status(500).json({ error: upcomingRes.error.message });
  if (monthRes.error) return res.status(500).json({ error: monthRes.error.message });

  const noShowsEvites = monthRes.data.filter(
    (rdv) => (rdv.patients?.risk_score ?? 0) >= SEUIL_RISQUE
  ).length;

  res.json({
    upcomingAppointments: upcomingRes.data,
    noShowsEvitesCeMois: noShowsEvites,
    seuilRisque: SEUIL_RISQUE,
  });
});

export default router;
