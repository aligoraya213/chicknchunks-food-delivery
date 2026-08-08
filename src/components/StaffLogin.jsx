import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Bike, Flame } from 'lucide-react';

export const StaffLogin = () => {
  const { staffLogin } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await staffLogin(email, password);
    if (!result) {
      setError('Invalid credentials. Admin: admin@chicknchunks.com / admin123 | Rider: rider@test.com / password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-[#E31E24]/20 to-[#FF6B35]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E31E24] to-[#FF6B35] text-white flex items-center justify-center shadow-lg">
              <Flame className="w-7 h-7 fill-white" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg">
              <Bike className="w-7 h-7" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-gray-900">Staff Portal</h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">ChicknChunks — Admin &amp; Rider Access</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3.5 rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-[#E31E24] text-xs sm:text-sm font-semibold"
                placeholder="admin@chicknchunks.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-[#E31E24] text-xs sm:text-sm font-semibold"
                placeholder="••••••••"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Admin: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-bold text-gray-700">admin@chicknchunks.com</code> / <code className="bg-gray-100 px-1.5 py-0.5 rounded font-bold text-gray-700">admin123</code>
              &nbsp;| Rider: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-bold text-gray-700">rider@test.com</code> / <code className="bg-gray-100 px-1.5 py-0.5 rounded font-bold text-gray-700">password</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 text-sm font-bold shadow-xl hover:scale-105 transition mt-2 disabled:opacity-50"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-gray-100 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Authorized Staff Access Only</span>
        </div>
      </div>
    </div>
  );
};
