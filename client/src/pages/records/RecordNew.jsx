import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiGet, apiPost } from '../../api/client';
import { Modal } from '../../components/Modal';

export default function RecordNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prePatient = searchParams.get('patient_id');

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [icdOpen, setIcdOpen] = useState(false);
  const [icdQ, setIcdQ] = useState('');
  const [icdResults, setIcdResults] = useState([]);

  const [form, setForm] = useState({
    patient_id: prePatient || '',
    doctor_id: '',
    disease_id: '',
    visit_date: new Date().toISOString().slice(0, 10),
    symptoms: '',
    treatment_notes: '',
    prescription: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (prePatient) setForm((f) => ({ ...f, patient_id: prePatient }));
  }, [prePatient]);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, dRes, diRes] = await Promise.all([
          apiGet('/api/patients?limit=100'),
          apiGet('/api/doctors?limit=100'),
          apiGet('/api/diseases?limit=200'),
        ]);
        setPatients(pRes.data);
        setDoctors(dRes.data);
        setDiseases(diRes.data);
      } catch (e) {
        toast.error(e.message);
      }
    })();
  }, []);

  useEffect(() => {
    if (!icdOpen || icdQ.length < 1) {
      setIcdResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await apiGet(`/api/diseases/lookup?q=${encodeURIComponent(icdQ)}`);
        setIcdResults(res.data);
      } catch {
        setIcdResults([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [icdOpen, icdQ]);

  const selectDisease = (d) => {
    setForm((f) => ({ ...f, disease_id: String(d.id) }));
    setIcdOpen(false);
    setIcdQ('');
  };

  const submit = async (e) => {
    e.preventDefault();
    const patient_id = parseInt(form.patient_id, 10);
    const doctor_id = parseInt(form.doctor_id, 10);
    const disease_id = parseInt(form.disease_id, 10);
    if (!patient_id || !doctor_id || !disease_id) {
      toast.error('Select patient, doctor, and diagnosis');
      return;
    }
    setSubmitting(true);
    try {
      await apiPost('/api/medical-records', {
        patient_id,
        doctor_id,
        disease_id,
        visit_date: form.visit_date,
        symptoms: form.symptoms || null,
        treatment_notes: form.treatment_notes || null,
        prescription: form.prescription || null,
      });
      toast.success('Medical record saved');
      navigate(`/patients/${patient_id}`);
    } catch (err) {
      toast.error(err.body?.errors?.[0]?.msg || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New medical record</h1>
        <p className="text-slate-600">Link patient, clinician, and ICD diagnosis</p>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Patient</label>
            <select
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.patient_id}
              onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
            >
              <option value="">Select…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.id} — {p.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Doctor</label>
            <select
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.doctor_id}
              onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
            >
              <option value="">Select…</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name} ({d.department})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <label className="text-sm font-medium text-slate-700">Diagnosis (ICD)</label>
            <button
              type="button"
              className="text-sm font-medium text-primary-600 hover:underline"
              onClick={() => setIcdOpen(true)}
            >
              Lookup ICD…
            </button>
          </div>
          <select
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            value={form.disease_id}
            onChange={(e) => setForm({ ...form, disease_id: e.target.value })}
          >
            <option value="">Select…</option>
            {diseases.map((d) => (
              <option key={d.id} value={d.id}>
                {d.icd_code} — {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Visit date</label>
          <input
            type="date"
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            value={form.visit_date}
            onChange={(e) => setForm({ ...form, visit_date: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Symptoms</label>
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            rows={2}
            value={form.symptoms}
            onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Treatment notes</label>
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            rows={3}
            value={form.treatment_notes}
            onChange={(e) => setForm({ ...form, treatment_notes: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Prescription</label>
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            rows={2}
            value={form.prescription}
            onChange={(e) => setForm({ ...form, prescription: e.target.value })}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary-500 px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            Save record
          </button>
          <button type="button" className="text-slate-600 hover:underline" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>

      <Modal open={icdOpen} onClose={() => setIcdOpen(false)} title="ICD lookup" wide>
        <input
          placeholder="Code or diagnosis name"
          className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2"
          value={icdQ}
          onChange={(e) => setIcdQ(e.target.value)}
          autoFocus
        />
        <ul className="max-h-72 space-y-2 overflow-y-auto">
          {icdResults.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-left text-sm hover:border-primary-200"
                onClick={() => selectDisease(d)}
              >
                <span className="font-mono text-primary-700">{d.icd_code}</span> — {d.name}
                <span className="block text-xs text-slate-500">{d.category}</span>
              </button>
            </li>
          ))}
        </ul>
        {icdQ.length >= 1 && icdResults.length === 0 && (
          <p className="text-sm text-slate-500">No matches.</p>
        )}
      </Modal>
    </div>
  );
}
