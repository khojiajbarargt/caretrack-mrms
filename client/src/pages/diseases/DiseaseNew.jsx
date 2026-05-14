import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiPost } from '../../api/client';

export default function DiseaseNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    icd_code: '',
    name: '',
    description: '',
    category: '',
    severity: 'moderate',
  });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.icd_code.trim() || !form.name.trim() || !form.category.trim()) {
      toast.error('ICD code, name, and category are required');
      return;
    }
    setSubmitting(true);
    try {
      await apiPost('/api/diseases', form);
      toast.success('Diagnosis added');
      navigate('/diseases');
    } catch (err) {
      toast.error(err.body?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New diagnosis</h1>
        <p className="text-slate-600">Add an ICD-coded condition to the catalog</p>
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">ICD code</label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono"
              placeholder="e.g. J18.9"
              value={form.icd_code}
              onChange={(e) => setForm({ ...form, icd_code: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Severity</label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
            >
              {['mild', 'moderate', 'severe', 'critical'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="e.g. Respiratory"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary-500 px-4 py-2 font-semibold text-white disabled:opacity-60"
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
