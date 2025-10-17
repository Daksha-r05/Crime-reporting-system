import React, { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const roleOptions = [
  { value: 'citizen', label: 'Citizen' },
  { value: 'police', label: 'Police' },
  { value: 'admin', label: 'Admin' },
];

const StatusBadge = ({ isActive }) => (
  <span className={`px-2 py-1 rounded text-xs ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

const VerifyBadge = ({ isVerified }) => (
  <span className={`px-2 py-1 rounded text-xs ${isVerified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
    {isVerified ? 'Verified' : 'Unverified'}
  </span>
);

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const loadUsers = async () => {
    try {
      const res = await adminAPI.getUsers({});
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter(u => {
      const matchesRole = roleFilter ? u.role === roleFilter : true;
      const matchesSearch = term
        ? (u.email?.toLowerCase().includes(term) || u.username?.toLowerCase().includes(term) || `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(term))
        : true;
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  const verifyPolice = async (userId, isVerified) => {
    try {
      await adminAPI.verifyUser(userId, { isVerified: !isVerified });
      toast.success(!isVerified ? 'User verified' : 'Verification removed');
      await loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update verification');
    }
  };

  const toggleActive = async (userId, isActive) => {
    try {
      await adminAPI.updateUserStatus(userId, { isActive: !isActive });
      toast.success(!isActive ? 'User activated' : 'User deactivated');
      await loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const changeRole = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, { role: newRole });
      toast.success('Role updated');
      await loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted');
      await loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage users, roles, and access</p>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search by name, email, or username"
              className="border rounded-md px-3 py-2 flex-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="border rounded-md px-3 py-2 w-full md:w-48" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All roles</option>
              {roleOptions.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verification</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(u => (
                  <tr key={u._id}>
                    <td className="px-4 py-2">
                      <div className="text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</div>
                      <div className="text-xs text-gray-500">{u.username}</div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">{u.email}</td>
                    <td className="px-4 py-2">
                      <select
                        className="border rounded-md px-2 py-1 text-sm"
                        value={u.role}
                        onChange={(e) => changeRole(u._id, e.target.value)}
                      >
                        {roleOptions.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2"><StatusBadge isActive={u.isActive} /></td>
                    <td className="px-4 py-2"><VerifyBadge isVerified={u.isVerified} /></td>
                    <td className="px-4 py-2">
                      <div className="flex justify-end gap-2">
                        <button
                          className="px-2 py-1 text-xs rounded bg-blue-600 text-white"
                          onClick={() => verifyPolice(u._id, u.isVerified)}
                          disabled={u.role !== 'police'}
                          title={u.role !== 'police' ? 'Only for police accounts' : ''}
                        >
                          {u.isVerified ? 'Unverify' : 'Verify'}
                        </button>
                        <button
                          className={`px-2 py-1 text-xs rounded ${u.isActive ? 'bg-gray-600 text-white' : 'bg-green-600 text-white'}`}
                          onClick={() => toggleActive(u._id, u.isActive)}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="px-2 py-1 text-xs rounded bg-red-600 text-white"
                          onClick={() => deleteUser(u._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
