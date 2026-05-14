import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiPost } from '../../api/client';

export default function PatientNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    date_of_birth: '',
    gender: 'unknown',
    phone: '',
    email: '',
    address: '',
    emergency_contact: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.date_of_birth) {
      toast.error('Name and date of birth are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiPost('/api/patients', form);
      toast.success('Patient registered');
      navigate(`/patients/${res.id}`);
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
        <h1 className="text-2xl font-bold text-slate-900">Register patient</h1>
        <p className="text-slate-600">Demographics and contact information</p>
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            value={form.full_name}
            onChange={(e) => update('full_name', e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Date of birth</label>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.date_of_birth}
              onChange={(e) => update('date_of_birth', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Gender</label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.gender}
              onChange={(e) => update('gender', e.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            rows={2}
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Emergency contact</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            value={form.emergency_contact}
            onChange={(e) => update('emergency_contact', e.target.value)}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary-500 px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            Save patient
          </button>
          <button type="button" className="text-slate-600 hover:underline" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
