import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export function Layout() {
  const { user, signOut } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">No-Show Manager</div>
        <nav className="topbar-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Tableau de bord
          </NavLink>
          <NavLink to="/patients" className={({ isActive }) => (isActive ? 'active' : '')}>
            Patients
          </NavLink>
        </nav>
        <div className="topbar-user">
          <span>{user?.email}</span>
          <button className="btn btn-secondary" onClick={() => signOut()}>
            Se déconnecter
          </button>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
