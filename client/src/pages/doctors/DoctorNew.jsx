import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiPost } from '../../api/client';

const defaultSchedule = {
  mon: [],
  tue: [],
  wed: [],
  thu: [],
  fri: [],
  sat: [],
  sun: [],
};

export default function DoctorNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    specialization: '',
    department: '',
    phone: '',
    email: '',
    status: 'active',
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.specialization.trim() || !form.department.trim()) {
      toast.error('Name, specialization, and department are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiPost('/api/doctors', { ...form, schedule: defaultSchedule });
      toast.success('Doctor created');
      navigate(`/doctors/${res.id}`);
    } catch (err) {
      const msg = err.body?.errors?.[0]?.msg || err.message;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New doctor</h1>
        <p className="text-slate-600">Admin only — add a clinician to the directory</p>
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {['full_name', 'specialization', 'department'].map((field) => (
          <div key={field}>
            <label className="mb-1 block text-sm font-medium capitalize text-slate-700">
              {field.replace('_', ' ')}
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form[field]}
              onChange={(e) => update(field, e.target.value)}
            />
          </div>
        ))}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            value={form.status}
            onChange={(e) => update('status', e.target.value)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary-500 px-4 py-2 font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
          >
            Save
          </button>
          <button type="button" className="text-slate-600 hover:underline" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
