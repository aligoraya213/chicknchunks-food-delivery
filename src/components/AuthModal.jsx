import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { X, User, Lock, Phone, Mail, ArrowRight, Bike, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { api, setAuthToken } from '../lib/api';

export const AuthModal = () => {
  const navigate = useNavigate();
  const { isAuthModalOpen, setIsAuthModalOpen, user, setUser, loginUser, setActiveView } = useApp();
  
  const [authRoleTab, setAuthRoleTab] = useState('customer'); // 'customer' | 'rider' | 'admin'
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleFillDemo = (role) => {
    setError('');
    if (role === 'admin') {
      setAuthRoleTab('admin');
      setIsRegister(false);
      setEmail('admin@chicknchunks.com');
      setPassword('password');
    } else if (role === 'rider') {
      setAuthRoleTab('rider');
      setIsRegister(false);
      setEmail('rider@test.com');
      setPassword('password');
    } else {
      setAuthRoleTab('customer');
      setIsRegister(false);
      setEmail('customer@test.com');
      setPassword('password');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authRoleTab === 'customer' && isRegister) {
        const data = await api('/register', {
          method: 'POST',
          body: JSON.stringify({ name, phone, email, password, password_confirmation: password }),
        });
        if (data?.token) {
          setAuthToken(data.token);
          setUser({ ...data.user, address });
          localStorage.setItem('chicknchunksUser', JSON.stringify({ ...data.user, address }));
          setIsAuthModalOpen(false);
          setActiveView('menu');
          navigate('/');
        }
      } else {
        const result = await loginUser(email, password);
        if (result.success) {
          setIsAuthModalOpen(false);
          if (result.role === 'admin') {
            navigate('/admin');
          } else if (result.role === 'rider') {
            navigate('/rider');
          } else {
            navigate('/');
          }
        } else {
          setError('Invalid email or password. Try demo accounts below!');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
        
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Role Selector Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setAuthRoleTab('customer'); setIsRegister(false); setError(''); }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              authRoleTab === 'customer' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#E31E24]" />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthRoleTab('rider'); setIsRegister(false); setError(''); }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              authRoleTab === 'rider' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Bike className="w-3.5 h-3.5 text-amber-600" />
            <span>Rider</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthRoleTab('admin'); setIsRegister(false); setError(''); }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              authRoleTab === 'admin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Admin</span>
          </button>
        </div>

        {/* Title Header */}
        <div className="text-center mb-5">
          <h2 className="text-2xl font-black text-gray-900">
            {authRoleTab === 'rider' ? 'Rider Portal Login' : authRoleTab === 'admin' ? 'Admin Control Center' : (isRegister ? 'Create Customer Account' : 'Customer Sign In')}
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            {authRoleTab === 'rider'
              ? 'Access assigned deliveries and active orders.'
              : authRoleTab === 'admin'
              ? 'Access menu, orders, staff, and system management.'
              : 'Unlock exclusive discounts and track live orders.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authRoleTab === 'customer' && isRegister && (
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ali Raza"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#E31E24] text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              {authRoleTab === 'admin' ? 'Admin Email / Username *' : 'Email Address *'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#E31E24] text-sm font-medium"
                placeholder={authRoleTab === 'admin' ? 'admin@chicknchunks.com or admin' : authRoleTab === 'rider' ? 'rider@test.com' : 'customer@test.com'}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength="4"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#E31E24] text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {authRoleTab === 'customer' && isRegister && (
            <>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#E31E24] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Delivery Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street 4, Gulberg III, Lahore"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#E31E24] text-sm"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 text-sm shadow-xl flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : (authRoleTab === 'rider' ? 'Rider Sign In' : authRoleTab === 'admin' ? 'Admin Sign In' : (isRegister ? 'Create Account' : 'Sign In'))}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {error && <p className="text-center text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100">{error}</p>}
        </form>

        {/* Demo Quick Fill Toolbar */}
        {!isRegister && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#E31E24]" />
              <span>Quick Demo Fill:</span>
            </div>
            <div className="flex gap-1.5 flex-wrap text-xs">
              <button
                type="button"
                onClick={() => handleFillDemo('customer')}
                className="px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 text-red-700 font-bold hover:bg-red-100 text-[11px]"
              >
                Customer Demo
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('rider')}
                className="px-2.5 py-1 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 text-[11px]"
              >
                Rider Demo
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('admin')}
                className="px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 font-bold hover:bg-blue-100 text-[11px]"
              >
                Admin Demo
              </button>
            </div>
          </div>
        )}

        {authRoleTab === 'customer' && (
          <div className="mt-4 text-center text-xs">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-[#E31E24] font-bold hover:underline"
            >
              {isRegister ? 'Already registered? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
