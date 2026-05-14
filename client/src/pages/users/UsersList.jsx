import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { apiDelete, apiGet, apiPatch, apiPost } from '../../api/client';
import { Pagination } from '../../components/Pagination';
import { Modal } from '../../components/Modal';

export default function UsersList() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [createForm, setCreateForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'receptionist',
  });
  const [editForm, setEditForm] = useState(null);

  const fetchList = async (p = page) => {
    const params = new URLSearchParams({ page: String(p), limit: String(limit) });
    if (search.trim()) params.set('search', search.trim());
    try {
      const res = await apiGet(`/api/users?${params}`);
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

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await apiPost('/api/users', createForm);
      toast.success('User created');
      setCreateOpen(false);
      setCreateForm({ full_name: '', email: '', password: '', role: 'receptionist' });
      fetchList(1);
      setPage(1);
    } catch (err) {
      toast.error(err.body?.error || err.body?.errors?.[0]?.msg || err.message);
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    const body = { ...editForm };
    if (!body.password) delete body.password;
    try {
      await apiPatch(`/api/users/${editRow.id}`, body);
      toast.success('User updated');
      setEditRow(null);
      fetchList(page);
    } catch (err) {
      toast.error(err.body?.error || err.body?.errors?.[0]?.msg || err.message);
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Remove ${u.email}?`)) return;
    try {
      await apiDelete(`/api/users/${u.id}`);
      toast.success('User removed');
      fetchList(page);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-600">Staff accounts and roles</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white"
        >
          New user
        </button>
      </div>

      <form onSubmit={apply} className="flex gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          placeholder="Search name or email"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white">
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.full_name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{u.role}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      type="button"
                      className="text-primary-600 hover:underline"
                      onClick={() => {
                        setEditRow(u);
                        setEditForm({
                          full_name: u.full_name,
                          email: u.email,
                          role: u.role,
                          password: '',
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button type="button" className="text-red-600 hover:underline" onClick={() => remove(u)}>
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

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New staff user">
        <form onSubmit={createUser} className="space-y-3">
          {['full_name', 'email', 'password'].map((f) => (
            <div key={f}>
              <label className="mb-1 block text-xs font-medium text-slate-600">{f.replace('_', ' ')}</label>
              <input
                type={f === 'password' ? 'password' : f === 'email' ? 'email' : 'text'}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={createForm[f]}
                onChange={(e) => setCreateForm({ ...createForm, [f]: e.target.value })}
              />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Role</label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
            >
              <option value="admin">admin</option>
              <option value="clinician">clinician</option>
              <option value="receptionist">receptionist</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="px-3 py-2 text-sm" onClick={() => setCreateOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white">
              Create
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!editRow} onClose={() => setEditRow(null)} title="Edit user">
        {editForm && (
          <form onSubmit={saveEdit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Full name</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">New password (optional)</label>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Role</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                <option value="admin">admin</option>
                <option value="clinician">clinician</option>
                <option value="receptionist">receptionist</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
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
