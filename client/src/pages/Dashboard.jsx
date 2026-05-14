import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiGet } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, canClinical, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await apiGet('/api/stats/dashboard');
        if (!cancelled) setStats(s);
      } catch (e) {
        if (!cancelled) toast.error(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    { label: 'Patients', value: stats?.totalPatients ?? '—', to: '/patients', color: 'bg-primary-500' },
    { label: 'Active doctors', value: stats?.totalDoctors ?? '—', to: '/doctors', color: 'bg-teal-accent' },
    {
      label: 'Visits today',
      value: stats?.recordsToday ?? '—',
      to: canClinical ? '/records/new' : '/patients',
      color: 'bg-amber-500',
    },
    {
      label: 'Total records',
      value: stats?.totalRecords ?? '—',
      to: '/patients',
      color: 'bg-slate-600',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">
          Hello, {user?.full_name}. Here is a snapshot of CareTrack Clinic.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${c.color}`}>
              <span className="text-white text-lg font-bold">+</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{c.value}</div>
            <div className="text-sm font-medium text-slate-500">{c.label}</div>
          </Link>
        ))}
      </div>

      {canClinical && stats && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Clinical overview</h2>
          <p className="mt-1 text-sm text-slate-600">
            {stats.totalDiseases} ICD diagnoses in catalog. Use{' '}
            <Link to="/diseases" className="font-medium text-primary-600 hover:underline">
              Diseases
            </Link>{' '}
            to manage codes.
          </p>
        </div>
      )}

      {isAdmin && (
        <div className="rounded-xl border border-dashed border-primary-200 bg-primary-50/50 p-6">
          <h2 className="text-lg font-semibold text-primary-900">Administrator</h2>
          <p className="mt-1 text-sm text-primary-800">
            Manage staff accounts and doctor profiles from the Users and Doctors sections.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/users"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              User management
            </Link>
            <Link
              to="/doctors/new"
              className="rounded-lg border border-primary-300 bg-white px-4 py-2 text-sm font-semibold text-primary-800 hover:bg-primary-50"
            >
              Add doctor
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
