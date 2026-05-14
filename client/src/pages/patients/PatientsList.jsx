import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiGet } from '../../api/client';
import { Pagination } from '../../components/Pagination';

export default function PatientsList() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState('');

  const fetchList = async (p = page) => {
    const params = new URLSearchParams({ page: String(p), limit: String(limit) });
    if (search.trim()) params.set('search', search.trim());
    try {
      const res = await apiGet(`/api/patients?${params}`);
      setData(res.data);
      setTotal(res.total);
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="text-slate-600">Search by name or patient ID</p>
        </div>
        <Link
          to="/patients/new"
          className="inline-flex justify-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white"
        >
          Register patient
        </Link>
      </div>

      <form onSubmit={apply} className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          placeholder="Name or ID"
          className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white">
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">DOB</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono text-slate-500">#{p.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{p.full_name}</td>
                  <td className="px-4 py-3 text-slate-600">{p.date_of_birth}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{p.gender}</td>
                  <td className="px-4 py-3 text-slate-600">{p.phone || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/patients/${p.id}`} className="text-primary-600 hover:underline">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
      </div>
    </div>
  );
}
