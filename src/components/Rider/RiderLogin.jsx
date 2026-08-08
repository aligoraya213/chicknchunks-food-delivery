import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bike, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const RiderLogin = () => {
  const { riderLogin } = useApp();
  const [email, setEmail] = useState('rider@chicknchunks.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await riderLogin(email, password);
    if (!success) {
      setError('Invalid rider credentials. Try rider@chicknchunks.com / rider123');
    } else {
      setError('');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center mx-auto shadow-lg mb-3">
            <Bike className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Rider Portal</h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">ChicknChunks Delivery Partner Dashboard</p>
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
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-500 text-xs sm:text-sm font-semibold"
                placeholder="rider@chicknchunks.com"
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
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-500 text-xs sm:text-sm font-semibold"
                placeholder="••••••••"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Demo Password: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-bold text-gray-700">rider123</code></p>
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-4 text-sm font-bold shadow-xl hover:scale-105 transition mt-2"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
          >
            <span>Sign In as Rider</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-gray-100 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Authorized Delivery Partners Only</span>
        </div>
      </div>
    </div>
  );
};
