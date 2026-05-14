import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiDelete, apiGet, apiPatch } from '../../api/client';
import { Pagination } from '../../components/Pagination';
import { Modal } from '../../components/Modal';

export default function DiseasesList() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 15;
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState(null);

  const fetchList = async (p = page) => {
    const params = new URLSearchParams({ page: String(p), limit: String(limit) });
    if (search.trim()) params.set('search', search.trim());
    if (category) params.set('category', category);
    try {
      const res = await apiGet(`/api/diseases?${params}`);
      setData(res.data);
      setTotal(res.total);
      setCategories(res.categories || []);
    } catch (e) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    fetchList(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const apply = (e) => {
    e.preventDefault();
    setPage(1);
    fetchList(1);
  };

  const openEdit = (row) => {
    setEditRow(row);
    setForm({
      icd_code: row.icd_code,
      name: row.name,
      description: row.description || '',
      category: row.category,
      severity: row.severity,
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await apiPatch(`/api/diseases/${editRow.id}`, form);
      toast.success('Diagnosis updated');
      setEditRow(null);
      fetchList(page);
    } catch (err) {
      toast.error(err.body?.error || err.message);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete ${row.icd_code}?`)) return;
    try {
      await apiDelete(`/api/diseases/${row.id}`);
      toast.success('Removed');
      fetchList(page);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Diseases / ICD</h1>
          <p className="text-slate-600">Catalog for documentation and billing</p>
        </div>
        <Link
          to="/diseases/new"
          className="inline-flex justify-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white"
        >
          Add diagnosis
        </Link>
      </div>

      <form onSubmit={apply} className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          placeholder="Search code or name"
          className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white">
          Filter
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">ICD</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono text-primary-700">{d.icd_code}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{d.name}</td>
                  <td className="px-4 py-3 text-slate-600">{d.category}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{d.severity}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button type="button" className="text-primary-600 hover:underline" onClick={() => openEdit(d)}>
                      Edit
                    </button>
                    <button type="button" className="text-red-600 hover:underline" onClick={() => remove(d)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
      </div>

      <Modal open={!!editRow} onClose={() => setEditRow(null)} title="Edit diagnosis" wide>
        {form && (
          <form onSubmit={saveEdit} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">ICD code</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.icd_code}
                onChange={(e) => setForm({ ...form, icd_code: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Severity</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">Name</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Category</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
              <textarea
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" className="px-3 py-2 text-sm" onClick={() => setEditRow(null)}>
                Cancel
              </button>
              <button type="submit" className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white">
                Save
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
