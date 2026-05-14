import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiDelete, apiGet, apiPatch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';

const DAYS = [
  ['mon', 'Monday'],
  ['tue', 'Tuesday'],
  ['wed', 'Wednesday'],
  ['thu', 'Thursday'],
  ['fri', 'Friday'],
  ['sat', 'Saturday'],
  ['sun', 'Sunday'],
];

function emptySchedule() {
  return { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
}

export default function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(null);
  const [scheduleDraft, setScheduleDraft] = useState(emptySchedule());

  const load = async () => {
    try {
      const d = await apiGet(`/api/doctors/${id}`);
      setDoctor(d);
      setForm({
        full_name: d.full_name,
        specialization: d.specialization,
        department: d.department,
        phone: d.phone || '',
        email: d.email || '',
        status: d.status,
      });
      setScheduleDraft({ ...emptySchedule(), ...d.schedule });
    } catch (e) {
      toast.error(e.message);
      navigate('/doctors');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await apiPatch(`/api/doctors/${id}`, {
        ...form,
        schedule: scheduleDraft,
      });
      setDoctor(updated);
      toast.success('Doctor updated');
      setEditOpen(false);
    } catch (err) {
      toast.error(err.body?.errors?.[0]?.msg || err.message);
    }
  };

  const removeDoctor = async () => {
    if (!window.confirm('Delete this doctor? Only allowed if no records exist.')) return;
    try {
      await apiDelete(`/api/doctors/${id}`);
      toast.success('Doctor removed');
      navigate('/doctors');
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (!doctor || !form) return <div className="p-8 text-slate-500">Loading…</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{doctor.full_name}</h1>
          <p className="text-slate-600">
            {doctor.specialization} · {doctor.department}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {doctor.phone && <span>{doctor.phone} · </span>}
            {doctor.email}
          </p>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Edit profile & schedule
            </button>
            <button
              type="button"
              onClick={removeDoctor}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Weekly schedule</h2>
        <p className="text-sm text-slate-500">Blocks show clinic hours for each day.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {DAYS.map(([key, label]) => {
            const blocks = doctor.schedule?.[key] || [];
            return (
              <div key={key} className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                <div className="text-sm font-semibold text-slate-800">{label}</div>
                {blocks.length === 0 ? (
                  <div className="text-xs text-slate-400">Off</div>
                ) : (
                  <ul className="mt-1 space-y-1 text-sm text-slate-600">
                    {blocks.map((b, i) => (
                      <li key={i}>
                        {b.start} – {b.end}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit doctor" wide>
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {['full_name', 'specialization', 'department', 'phone', 'email'].map((f) => (
              <div key={f} className={f === 'full_name' ? 'md:col-span-2' : ''}>
                <label className="mb-1 block text-xs font-medium text-slate-600">{f}</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form[f]}
                  onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                />
              </div>
            ))}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">status</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Schedule blocks</h3>
            <p className="text-xs text-slate-500">Add one or more time ranges per day (24h).</p>
            <div className="mt-3 max-h-64 space-y-3 overflow-y-auto pr-1">
              {DAYS.map(([key, label]) => (
                <div key={key} className="rounded-lg border border-slate-100 p-2">
                  <div className="text-xs font-semibold text-slate-700">{label}</div>
                  {(scheduleDraft[key] || []).map((b, idx) => (
                    <div key={idx} className="mt-2 flex gap-2">
                      <input
                        type="time"
                        className="rounded border border-slate-200 px-2 py-1 text-sm"
                        value={b.start || ''}
                        onChange={(e) => {
                          const next = [...(scheduleDraft[key] || [])];
                          next[idx] = { ...next[idx], start: e.target.value };
                          setScheduleDraft({ ...scheduleDraft, [key]: next });
                        }}
                      />
                      <input
                        type="time"
                        className="rounded border border-slate-200 px-2 py-1 text-sm"
                        value={b.end || ''}
                        onChange={(e) => {
                          const next = [...(scheduleDraft[key] || [])];
                          next[idx] = { ...next[idx], end: e.target.value };
                          setScheduleDraft({ ...scheduleDraft, [key]: next });
                        }}
                      />
                      <button
                        type="button"
                        className="text-xs text-red-600"
                        onClick={() => {
                          const next = (scheduleDraft[key] || []).filter((_, i) => i !== idx);
                          setScheduleDraft({ ...scheduleDraft, [key]: next });
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="mt-2 text-xs font-medium text-primary-600"
                    onClick={() =>
                      setScheduleDraft({
                        ...scheduleDraft,
                        [key]: [...(scheduleDraft[key] || []), { start: '09:00', end: '17:00' }],
                      })
                    }
                  >
                    + Add block
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" className="px-4 py-2 text-sm text-slate-600" onClick={() => setEditOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white">
              Save changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
