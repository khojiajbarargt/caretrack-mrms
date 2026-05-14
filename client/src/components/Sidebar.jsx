import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-primary-500 text-white shadow-sm'
      : 'text-slate-600 hover:bg-slate-100'
  }`;

export function Sidebar({ onNavigate }) {
  const { user, logout, isAdmin, canClinical } = useAuth();

  const item = (to, label) => (
    <NavLink to={to} className={linkClass} onClick={() => onNavigate?.()}>
      {label}
    </NavLink>
  );

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-primary-600">
          CareTrack Clinic
        </div>
        <div className="mt-1 text-lg font-bold text-slate-800">MRMS</div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {item('/dashboard', 'Dashboard')}
        {item('/doctors', 'Doctors')}
        {item('/patients', 'Patients')}
        {canClinical && item('/records/new', 'New record')}
        {canClinical && item('/diseases', 'Diseases / ICD')}
        {isAdmin && item('/users', 'Users')}
      </nav>
      <div className="border-t border-slate-100 p-3">
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <div className="font-semibold text-slate-800">{user?.full_name}</div>
          <div className="capitalize">{user?.role}</div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="mt-2 w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
