import React, { useState } from 'react';
import { 
  Lock, User, Eye, EyeOff, ShieldCheck, Database, 
  Smartphone, ShieldAlert, Key, HelpCircle, LogIn
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserAccount } from '../types';

interface LoginPageProps {
  users: UserAccount[];
  dbStatus: {
    connected?: boolean;
    engine?: string;
    loading: boolean;
    error: string | null;
  };
  onLoginSuccess: (user: UserAccount) => void;
}

export default function LoginPage({ users, dbStatus, onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Harap masukkan username Anda.');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate database look-up delays
    setTimeout(() => {
      const sanitizedUsername = username.trim().toLowerCase();
      const matchedUser = users.find(u => u.username.toLowerCase() === sanitizedUsername);

      if (!matchedUser) {
        setError('Username tidak ditemukan di database HRIS. Gunakan daftar simulasi di bawah untuk bantuan.');
        setLoading(false);
        return;
      }

      if (matchedUser.status === 'Nonaktif') {
        setError('Akun Anda dinonaktifkan oleh Administrator.');
        setLoading(false);
        return;
      }

      // Validates and passes
      onLoginSuccess(matchedUser);
      setLoading(false);
    }, 850);
  };

  const handleQuickLogin = (user: UserAccount) => {
    setLoading(true);
    setError(null);
    setUsername(user.username);
    setPassword('••••••••');
    
    setTimeout(() => {
      onLoginSuccess(user);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#0F172A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200" id="login-layout-wrapper">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Animated App Icon Brand */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mx-auto h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-2xl italic shadow-lg shadow-blue-500/20"
          id="login-brand-icon"
        >
          H
        </motion.div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight" id="login-heading-id">
          HRIS Enterprise Portal
        </h2>
        <p className="mt-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-6">
          Sistem Absensi Biometrik &amp; Payroll v2.4
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white dark:bg-[#1E293B] py-8 px-6 shadow-xl rounded-2xl border border-slate-200/60 dark:border-slate-800"
          id="login-card-inner"
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Username Pegawai / Email
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(null);
                  }}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                  placeholder="Masukkan username Anda"
                  id="login-input-username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                  placeholder="Masukkan password akun"
                  id="login-input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  id="lock-toggle-eye"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-red-50 dark:bg-red-950/30 p-3.5 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-xs leading-5"
                id="login-error-alert"
              >
                <div className="flex gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block mb-0.5">Autentikasi Gagal</span>
                    {error}
                  </div>
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-center font-bold py-2.5 px-4 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer
                ${loading 
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-blue-500/10'}`}
              id="login-submit-button"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin" />
                  Memverifikasi Sesi...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Masuk ke Dashboard
                </>
              )}
            </button>
          </form>

          {/* User Simulation Guide panel */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <span className="block text-[10.5px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 text-center">
              👤 Masuk Instan (Simulasi Pengujian)
            </span>
            <div className="grid grid-cols-2 gap-2" id="demo-quick-login-grid">
              {users.slice(0, 4).map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user)}
                  className="p-2.5 text-left border border-slate-200/80 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer group text-xs flex flex-col justify-between"
                  title={`Klik untuk masuk sebagai ${user.name}`}
                  id={`demo-user-${user.username}`}
                >
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate line-clamp-1">
                      {user.name}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                      User: <code className="font-mono bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 px-1 py-0.5 rounded text-[9.5px]">{user.username}</code>
                    </p>
                  </div>
                  <span className={`inline-block mt-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase self-start leading-none
                    ${user.role === 'Super Admin' ? 'bg-red-100 dark:bg-red-950/50 text-red-650 dark:text-red-400' :
                      user.role === 'HR Manager' ? 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-650 dark:text-indigo-400' :
                      user.role === 'Division Manager' ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-650 dark:text-amber-450' :
                      'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-650 dark:text-emerald-400'}`}
                  >
                    {user.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Network engine indicator footer */}
      <div className="mt-8 text-center sm:mx-auto sm:w-full sm:max-w-md">
        <div className="inline-flex items-center gap-2 bg-white dark:bg-[#1E293B] border border-slate-250 dark:border-slate-800 px-3 py-1.5 rounded-full shadow-xs text-[10.5px] text-slate-500 dark:text-slate-400">
          <Database className={`w-3.5 h-3.5 ${dbStatus.connected ? 'text-green-500 animate-pulse' : 'text-amber-500'}`} />
          <span>Keamanan Database:</span>
          {dbStatus.loading ? (
            <span className="font-semibold text-slate-400">Memeriksa jaringan...</span>
          ) : dbStatus.connected ? (
            <span className="font-extrabold text-green-600 dark:text-green-400">MySQL VPS Koneksi Aktif</span>
          ) : (
            <span className="font-extrabold text-amber-605">JSON Disk Safe-Fallback</span>
          )}
        </div>
      </div>
    </div>
  );
}
