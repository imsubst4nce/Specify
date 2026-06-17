import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Lock, Mail, User as UserIcon, CheckCircle2, ArrowRight, Upload, Trash2, FileIcon } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess?: (user: { id: string; name: string; email: string }, token: string) => void;
  editMode?: boolean;
  currentUser?: { id: string; name: string; email: string } | null;
  onProfileDelete?: () => void;
}

interface AuthHeaderProps {
  editMode: boolean;
}

function AuthHeader({ editMode }: AuthHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-wood-900 via-ivy-900 to-wood-950 p-6 text-white text-center">
      <h2 className="text-lg font-serif font-bold tracking-tight">
        {editMode ? 'Account Settings' : 'Join Specify'}
      </h2>
      <p className="text-xs text-stone-350 mt-1.5 font-medium">
        {editMode
          ? 'Edit your account information'
          : 'Login or Sign Up to access your workspace'}
      </p>
    </div>
  );
}

interface AuthTabsProps {
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
}

function AuthTabs({ activeTab, onTabChange }: AuthTabsProps) {
  return (
    <div className="flex text-xs text-stone-500 font-bold bg-stone-50/50">
      <button
        onClick={() => onTabChange('login')}
        type="button"
        className={`flex-1 py-3 text-center select-none cursor-pointer transition-colors ${
          activeTab === 'login'
            ? 'font-bold bg-white'
            : 'border-transparent hover:text-ivy-50 hover:bg-ivy-600'
        }`}
      >
        Login
      </button>
      <button
        onClick={() => onTabChange('register')}
        type="button"
        className={`flex-1 py-3 text-center select-none cursor-pointer transition-colors ${
          activeTab === 'register'
            ? 'font-bold bg-white'
            : 'border-transparent hover:text-ivy-50 hover:bg-ivy-600'
        }`}
      >
        Sign Up
      </button>
    </div>
  );
}

// Custom input field
interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  icon: React.ReactNode;
  placeholder?: string;
}

function InputField({ label, type, value, onChange, required = false, icon, placeholder }: InputFieldProps) {
  return (
    <div>
      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
        {label} {required && <span className="text-rose-600 font-extrabold ml-1" title="Required">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400 flex items-center justify-center">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-xs pl-8 pr-3 py-2 bg-stone-50 text-stone-800 border border-stone-250 focus:outline-none focus:ring-1 focus:ring-ivy-600 rounded-lg transition-all"
          required={required}
        />
      </div>
    </div>
  );
}

// Main AuthPage component
export default function AuthPage({
  onAuthSuccess,
  editMode = false,
  currentUser,
  onProfileDelete
}: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Input field states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  // Status indicators
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Handle tab switch (must reset fields everytime)
  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
  };

  // Synchronize in editMode
  useEffect(() => {
    if (editMode && currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setPassword('');
      setCurrentPassword('');
      setError('');
      setSuccess('');
    }
  }, [editMode, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || (!editMode && !password) || (!editMode && activeTab === 'register' && !name)) {
      setError('Please provide all required fields');
      return;
    }

    if (editMode && !currentPassword) {
      setError('Your current password is required to save changes');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (editMode) {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ name, email, password, currentPassword }),
        });

        if (res.ok) {
          const data = await res.json();
          setSuccess('Profile details updated successfully!');
          setCurrentPassword('');
          if (onAuthSuccess) {
            onAuthSuccess(data.user, token || '');
          }
        } else {
          const err = await res.json();
          setError(err.error || 'Failed to update profile details');
        }
      } else {
        const endpoint = activeTab === 'login' ? 'login' : 'register';
        const payload = activeTab === 'login' ? { email, password } : { name, email, password };

        const res = await fetch(`/api/auth/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (activeTab === 'login') {
            localStorage.setItem('token', data.token);
            if (onAuthSuccess) {
              onAuthSuccess(data.user, data.token);
            }
          } else {
            // Successful registration -> Redirects to login tab instead of automatic authentication for extra security
            setSuccess('Account created successfully! Please login to access your workspace.');
            setPassword('');
            setActiveTab('login');
          }
        } else {
          const err = await res.json();
          setError(err.error || 'Check authentication credentials and try again.');
        }
      }
    } catch {
      setError('Communication with authentication servers failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileDeletePress = () => {
    if (!currentPassword) {
      setError('Your current password is required to delete your profile');
      return;
    }

    setShowDeleteConfirm(true);
  };

  const handleProfileDelete = async () => {
    setShowDeleteConfirm(false)

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token is missing');
        return;
      }

      const res = await fetch('/api/auth/profile', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword }),
      });

      if (res.ok) {
        setSuccess('Profile deleted successfully.');
        localStorage.removeItem('token');
        setShowDeleteConfirm(false);
        if (onProfileDelete) {
          onProfileDelete();
        }
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to delete profile');
      }
    } catch {
      setError('Communication with authentication servers failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mx-auto w-full ${editMode ? 'max-w-md' : 'max-w-sm mt-12'}`} id="auth-portal-root">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        
        {/* AuthHeader */}
        <AuthHeader editMode={editMode} />

        {/* AuthTabs */}
        {!editMode && (
          <AuthTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* On error, will display error message */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-lg flex items-start gap-2 text-rose-600 text-[11px]">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}
          
          {/* On success, will display success message */}
          {success && (
            <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg flex items-start gap-2 text-emerald-800 text-[11px]">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-3.5">
            {/* Optional name field (only in register and edit view) */}
            {(editMode || activeTab === 'register') && (
              <InputField
                label="Full Name"
                type="text"
                value={name}
                onChange={setName}
                required={true}
                placeholder="John Doe"
                icon={<UserIcon className="h-3.5 w-3.5" />}
              />
            )}

            {/* Email address */}
            <InputField
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              required={true}
              placeholder="email@example.com"
              icon={<Mail className="h-3.5 w-3.5" />}
            />

            {/* Current password - REQUIRED in editMode to save changes */}
            {editMode && (
              <InputField
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={setCurrentPassword}
                required={true}
                placeholder="••••••••"
                icon={<Lock className="h-3.5 w-3.5 text-amber-500" />}
              />
            )}

            {/* Password / New password option */}
            <InputField
              label={editMode ? 'New Password (Optional)' : 'Password'}
              type="password"
              value={password}
              onChange={setPassword}
              required={!editMode}
              placeholder="••••••••"
              icon={<Lock className="h-3.5 w-3.5" />}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ivy-700 hover:bg-ivy-800 text-white rounded-lg py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-ivy-600 transition-all cursor-pointer flex items-center justify-center gap-1 mt-4"
          >
            <span>
              {loading
                ? 'Saving updates...'
                : editMode
                ? 'Save changes'
                : activeTab === 'login'
                ? 'Login'
                : 'Create Account'}
            </span>
            {!loading}
          </button>

          {editMode && (
            <button
              type="button"
              disabled={loading}
              onClick={handleProfileDeletePress}
              className="w-full bg-rose-700 hover:bg-rose-800 text-white rounded-lg py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-600 transition-all cursor-pointer flex items-center justify-center gap-1 mt-4"
            >
              Delete user
            </button>
          )}
        </form>
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" onClick={(e) => e.stopPropagation()}>
              <div className="bg-white rounded-xl border border-slate-100 shadow-xl max-w-sm w-full p-5 space-y-4">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider text-rose-600 block text-serif">Delete Account?</h3>
                <p className="text-[11px] text-stone-500 leading-normal">
                  Are you sure you want to permanently delete your account? This will remove all your projects and data and cannot be undone.
                </p>
                <div className="flex justify-end gap-2 text-[11px] font-semibold pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleProfileDelete}
                    disabled={loading}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}