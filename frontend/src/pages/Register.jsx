import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await signUp(email, password, nom);
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      navigate('/');
    } else {
      setInfo('Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse.');
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card card">
        <h1>Créer un compte praticien</h1>
        <p className="subtitle">Suivez vos rendez-vous et réduisez les no-shows.</p>
        {error && <div className="error-banner">{error}</div>}
        {info && <div className="error-banner" style={{ background: '#e5f6ee', color: '#1b8a5a' }}>{info}</div>}
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="nom">Nom complet</label>
            <input id="nom" type="text" value={nom} onChange={(e) => setNom(e.target.value)} required />
          </div>
          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>
        <p className="auth-switch">
          Déjà inscrit ? <Link to="/connexion">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
