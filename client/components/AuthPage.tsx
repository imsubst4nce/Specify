import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Lock, Mail, User as UserIcon, CheckCircle2, ArrowRight, Upload, Trash2 } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess?: (user: { id: string; name: string; email: string; avatarUrl?: string }, token: string) => void;
  editMode?: boolean;
  currentUser?: { id: string; name: string; email: string; avatarUrl?: string } | null;
  onProfileUpdateCancel?: () => void;
}

/**
 * AuthHeader Modular Component View
 */
interface AuthHeaderProps {
  editMode: boolean;
}

function AuthHeader({ editMode }: AuthHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-wood-900 via-ivy-900 to-wood-950 p-6 text-white text-center border-b border-wood-850">
      <div className="h-10 w-10 rounded-xl bg-ivy-700/30 text-ivy-200 border border-ivy-500/20 flex items-center justify-center mx-auto mb-3">
        <Lock className="h-5 w-5" />
      </div>
      <h2 className="text-lg font-serif font-bold tracking-tight">
        {editMode ? 'Update Account Settings' : 'Join Specify'}
      </h2>
      <p className="text-xs text-stone-350 mt-1.5 font-medium">
        {editMode
          ? 'Verify your password to save changes'
          : 'Enter account details to access your workspace'}
      </p>
    </div>
  );
}

/**
 * AuthTabs Modular Navigation Component View
 */
interface AuthTabsProps {
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
}

function AuthTabs({ activeTab, onTabChange }: AuthTabsProps) {
  return (
    <div className="flex border-b border-stone-150 text-xs text-stone-500 font-bold bg-stone-50/50">
      <button
        onClick={() => onTabChange('login')}
        type="button"
        className={`flex-1 py-3 border-b-2 text-center select-none cursor-pointer transition-colors ${
          activeTab === 'login'
            ? 'border-ivy-700 text-stone-900 font-extrabold bg-white dark:bg-wood-800 dark:text-stone-100'
            : 'border-transparent hover:text-stone-700 hover:bg-stone-50/50'
        }`}
      >
        Log In
      </button>
      <button
        onClick={() => onTabChange('register')}
        type="button"
        className={`flex-1 py-3 border-b-2 text-center select-none cursor-pointer transition-colors ${
          activeTab === 'register'
            ? 'border-ivy-700 text-stone-900 font-extrabold bg-white dark:bg-wood-800 dark:text-stone-100'
            : 'border-transparent hover:text-stone-700 hover:bg-stone-50/50'
        }`}
      >
        Sign Up
      </button>
    </div>
  );
}

/**
 * InputField Reusable Input Column View
 */
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

/**
 * Main AuthPage Component
 */
export default function AuthPage({
  onAuthSuccess,
  editMode = false,
  currentUser,
  onProfileUpdateCancel,
}: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Input States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Drag and Drop State
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status indicators
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle Tab Switch (Login / Register Reset fields)
  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
  };

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please provide a valid image file format (PNG, JPG, WEBP)');
      return;
    }
    
    // Check if the file size is reasonable (up to 2MB)
    if (file.size > 1 * 1024 * 1024) {
      setError('Image file is too large. Please upload an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        setAvatarUrl(event.target.result);
        setError('');
      } else {
        setError('Failed to read image file');
      }
    };
    reader.onerror = () => {
      setError('Error reading image file');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeAvatar = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Synchronize on editMode activation
  useEffect(() => {
    if (editMode && currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setAvatarUrl(currentUser.avatarUrl || '');
      setPassword('');
      setCurrentPassword('');
      setError('');
      setSuccess('');
    }
  }, [editMode, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || (!editMode && !password) || (!editMode && activeTab === 'register' && !name)) {
      setError('Please provide all required core fields');
      return;
    }

    if (editMode && !currentPassword) {
      setError('Your current password is required to save changes safely');
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
          body: JSON.stringify({ name, email, password, currentPassword, avatarUrl }),
        });

        if (res.ok) {
          const data = await res.json();
          setSuccess('Profile specifications updated successfully!');
          setCurrentPassword('');
          if (onAuthSuccess) {
            onAuthSuccess(data.user, token || '');
          }
        } else {
          const err = await res.json();
          setError(err.error || 'Failed to update profile specifications');
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
            // Successful Registration -> Redirect to login tab instead of automatic authentication
            setSuccess('Account created successfully! Please log in below to access your secure workspace.');
            setPassword('');
            setActiveTab('login');
          }
        } else {
          const err = await res.json();
          setError(err.error || 'Check authentication credentials and try again.');
        }
      }
    } catch {
      setError('Connection failure communicating with authentication servers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mx-auto w-full ${editMode ? 'max-w-md' : 'max-w-sm mt-12'}`} id="auth-portal-root">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
        
        {/* Dynamic header fragment */}
        <AuthHeader editMode={editMode} />

        {/* Dynamic Tab picker fragment (only for Login/Signup) */}
        {!editMode && (
          <AuthTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        )}

        {/* Dynamic Form input fields */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-lg flex items-start gap-2 text-rose-600 text-[11px]">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg flex items-start gap-2 text-emerald-800 text-[11px]">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-3.5">
            {/* Custom Avatar Upload Module (DND & Manual) */}
            {editMode && (
              <div className="space-y-2" id="avatar-dropzone-row">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Profile Avatar Image
                </label>
                
                <div className="flex items-center gap-4 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <div className="relative group shrink-0">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Avatar Preview" 
                        referrerPolicy="no-referrer"
                        className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-xs"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-ivy-100 border border-ivy-200 text-ivy-700 flex items-center justify-center font-extrabold text-lg uppercase shadow-2xs">
                        {name ? name[0] : 'U'}
                      </div>
                    )}
                    
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-1 -right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-all shadow-xs cursor-pointer"
                        title="Remove Avatar image"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                    className={`flex-1 flex flex-col items-center justify-center py-3.5 px-3 border-2 border-dashed rounded-lg text-center cursor-pointer select-none transition-all ${
                      dragActive 
                        ? 'border-ivy-600 bg-ivy-50/50' 
                        : 'border-stone-300 hover:border-ivy-500/50 hover:bg-white'
                    }`}
                  >
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      title="Upload profile avatar image"
                    />
                    <Upload className={`h-4 w-4 mb-1 transition-colors ${dragActive ? 'text-ivy-600' : 'text-stone-400'}`} />
                    <span className="text-xs font-bold text-stone-700 leading-tight">
                      {dragActive ? 'Drop image here' : 'Drop image or click here to upload'}
                    </span>
                    <span className="text-[10px] text-stone-400 mt-0.5 leading-none">
                      PNG, JPG or WEBP
                    </span>
                    <span className="text-[10px] text-stone-400 mt-0.5 leading-none">
                      ( max 2 MB )
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Optional Name (only register or edit mode) */}
            {(editMode || activeTab === 'register') && (
              <InputField
                label="Full Name"
                type="text"
                value={name}
                onChange={setName}
                required={true}
                placeholder="e.g., Alice Vance"
                icon={<UserIcon className="h-3.5 w-3.5" />}
              />
            )}

            {/* Email Address */}
            <InputField
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              required={true}
              placeholder="e.g., email@example.com"
              icon={<Mail className="h-3.5 w-3.5" />}
            />

            {/* Current Password - REQUIRED in editMode to proceed */}
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

            {/* Password / New password Option */}
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
                ? 'Save Profile changes'
                : activeTab === 'login'
                ? 'Login'
                : 'Create Account'}
            </span>
            {!loading && <ArrowRight className="h-3.5 w-3.5" />}
          </button>

          {editMode && onProfileUpdateCancel && (
            <button
              type="button"
              onClick={onProfileUpdateCancel}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer block text-center mt-2"
            >
              Cancel Profile Edits
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
