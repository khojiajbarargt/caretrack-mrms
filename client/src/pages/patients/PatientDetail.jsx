import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiGet, apiPatch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canClinical } = useAuth();
  const [patient, setPatient] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(null);

  const load = async () => {
    try {
      const p = await apiGet(`/api/patients/${id}`);
      setPatient(p);
      setForm({
        full_name: p.full_name,
        date_of_birth: p.date_of_birth,
        gender: p.gender,
        phone: p.phone || '',
        email: p.email || '',
        address: p.address || '',
        emergency_contact: p.emergency_contact || '',
      });
    } catch (e) {
      toast.error(e.message);
      navigate('/patients');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const save = async (e) => {
    e.preventDefault();
    try {
      const p = await apiPatch(`/api/patients/${id}`, form);
      setPatient((prev) => ({ ...prev, ...p }));
      toast.success('Patient updated');
      setEditOpen(false);
    } catch (err) {
      toast.error(err.body?.errors?.[0]?.msg || err.message);
    }
  };

  if (!patient || !form) return <div className="p-8 text-slate-500">Loading…</div>;

  const records = patient.medical_records || [];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{patient.full_name}</h1>
          <p className="text-slate-600">
            ID #{patient.id} · {patient.date_of_birth} ·{' '}
            <span className="capitalize">{patient.gender}</span>
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Registered by {patient.registered_by_name || '—'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Edit demographics
          </button>
          {canClinical && (
            <Link
              to={`/records/new?patient_id=${patient.id}`}
              className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white"
            >
              New visit record
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Contact</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-slate-400">Phone</dt>
              <dd className="text-slate-800">{patient.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Email</dt>
              <dd className="text-slate-800">{patient.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Address</dt>
              <dd className="text-slate-800">{patient.address || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Emergency</dt>
              <dd className="text-slate-800">{patient.emergency_contact || '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Medical history</h2>
          {patient._restricted ? (
            <p className="mt-3 text-sm text-amber-800 bg-amber-50 rounded-lg p-3 border border-amber-100">
              {patient.message}
            </p>
          ) : records.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No visits on file.</p>
          ) : (
            <ul className="mt-4 space-y-4 border-l-2 border-primary-200 pl-4">
              {records.map((r) => (
                <li key={r.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary-500 ring-4 ring-white" />
                  <div className="text-xs font-semibold text-primary-700">{r.visit_date}</div>
                  <div className="text-sm font-medium text-slate-900">
                    {r.disease_name}{' '}
                    <span className="font-normal text-slate-500">({r.icd_code})</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {r.doctor_name} · {r.created_by_name || '—'}
                  </div>
                  {r.symptoms && (
                    <p className="mt-1 text-sm text-slate-600">
                      <span className="font-medium">Symptoms:</span> {r.symptoms}
                    </p>
                  )}
                  {r.treatment_notes && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Notes:</span> {r.treatment_notes}
                    </p>
                  )}
                  {r.prescription && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Rx:</span> {r.prescription}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit patient">
        <form onSubmit={save} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Full name</label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">DOB</label>
              <input
                type="date"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.date_of_birth}
                onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Gender</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                {['male', 'female', 'other', 'unknown'].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Phone</label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Address</label>
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Emergency contact</label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.emergency_contact}
              onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="px-3 py-2 text-sm text-slate-600" onClick={() => setEditOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white">
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
