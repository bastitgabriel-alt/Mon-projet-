import { supabaseAdmin } from '../lib/supabaseAdmin.js';

/**
 * Verifie le JWT Supabase envoye dans l'en-tete Authorization et attache
 * l'utilisateur authentifie (praticien) a req.user.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentification requise.' });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: 'Session invalide ou expiree.' });
  }

  req.user = data.user;
  next();
}
