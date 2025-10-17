import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Settings, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: { street: '', city: '', state: '', zipCode: '' },
  });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
        },
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setForm((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated');
    } catch (err) {
      // handled in context
    } finally {
      setSaving(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    setChanging(true);
    try {
      await changePassword(pwd.currentPassword, pwd.newPassword);
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      // handled in context
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
        </div>

        <div className="p-6 space-y-8">
          <form onSubmit={saveProfile} className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><User className="h-5 w-5" /> Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">First Name</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
              </div>
            </div>

            <h3 className="text-md font-semibold mt-2">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Street</label>
                <input name="address.street" value={form.address.street} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">City</label>
                <input name="address.city" value={form.address.city} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">State</label>
                <input name="address.state" value={form.address.state} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Zip Code</label>
                <input name="address.zipCode" value={form.address.zipCode} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={saving} className="bg-blue-600 text-white rounded-md px-4 py-2 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          <form onSubmit={submitPassword} className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Settings className="h-5 w-5" /> Change Password</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                <input type="password" value={pwd.currentPassword} onChange={(e)=>setPwd({...pwd, currentPassword: e.target.value})} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">New Password</label>
                <input type="password" value={pwd.newPassword} onChange={(e)=>setPwd({...pwd, newPassword: e.target.value})} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
                <input type="password" value={pwd.confirm} onChange={(e)=>setPwd({...pwd, confirm: e.target.value})} className="w-full border rounded-md px-3 py-2" />
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" disabled={changing} className="bg-gray-800 text-white rounded-md px-4 py-2 disabled:opacity-50">
                {changing ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>

          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Shield className="h-4 w-4" /> Your information is secured.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
