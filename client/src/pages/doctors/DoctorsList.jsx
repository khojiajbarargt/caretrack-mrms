import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiGet } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Pagination } from '../../components/Pagination';

export default function DoctorsList() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [status, setStatus] = useState('');
  const [departments, setDepartments] = useState([]);

  const fetchList = async (p = page) => {
    const params = new URLSearchParams({ page: String(p), limit: String(limit) });
    if (search.trim()) params.set('search', search.trim());
    if (department) params.set('department', department);
    if (specialization.trim()) params.set('specialization', specialization.trim());
    if (status) params.set('status', status);
    try {
      const res = await apiGet(`/api/doctors?${params}`);
      setData(res.data);
      setTotal(res.total);
      setDepartments(res.departments || []);
    } catch (e) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    fetchList(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const applyFilters = (e) => {
    e?.preventDefault();
    setPage(1);
    fetchList(1);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctors</h1>
          <p className="text-slate-600">Directory and schedules</p>
        </div>
        {isAdmin && (
          <Link
            to="/doctors/new"
            className="inline-flex justify-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
          >
            New doctor
          </Link>
        )}
      </div>

      <form
        onSubmit={applyFilters}
        className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5"
      >
        <input
          placeholder="Search name, email, phone"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <input
          placeholder="Specialization"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
        />
        <div className="flex gap-2">
          <select
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
          >
            Filter
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Specialization</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{d.full_name}</td>
                  <td className="px-4 py-3 text-slate-600">{d.department}</td>
                  <td className="px-4 py-3 text-slate-600">{d.specialization}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        d.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/doctors/${d.id}`} className="text-primary-600 hover:underline">
                      View
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
