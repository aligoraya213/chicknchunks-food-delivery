import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../lib/currency';
import { AddressModal } from './AddressModal';
import {
  ShoppingBag,
  Search,
  MapPin,
  User,
  Flame,
  Clock,
  ChevronDown,
  LayoutDashboard,
  Bike,
  Package,
  Settings,
  LogOut,
  ShieldCheck
} from 'lucide-react';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    totalCartCount,
    subtotal,
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
    user,
    setIsAuthModalOpen,
    activeView,
    setActiveView,
    isAdminLoggedIn,
    isRiderLoggedIn,
    riderProfile,
    userLogout
  } = useApp();

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Auto-detect logged in status and user display details
  const isLoggedIn = Boolean(user?.name || isAdminLoggedIn || isRiderLoggedIn);

  const displayName = isAdminLoggedIn
    ? 'Admin'
    : isRiderLoggedIn
    ? riderProfile?.name?.split(' ')[0] || 'Rider'
    : user?.name
    ? user.name.split(' ')[0]
    : 'Account';

  const displayRoleBadge = isAdminLoggedIn
    ? 'Admin'
    : isRiderLoggedIn
    ? 'Rider'
    : 'Customer';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await userLogout();
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-[100] glass-header border-b border-gray-200/80 shadow-sm transition-all w-full">
        <div className="app-container">
          <div className="flex h-20 items-center justify-between gap-2 sm:gap-4">
            
            {/* Brand Logo */}
            <div
              className="flex shrink-0 items-center gap-2.5 sm:gap-3 cursor-pointer group"
              onClick={() => { setActiveView('menu'); navigate('/'); }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E31E24] to-[#FF6B35] shadow-lg shadow-red-500/30 transition-transform group-hover:scale-105 sm:h-12 sm:w-12">
                <Flame className="h-5 w-5 fill-white text-white sm:h-7 sm:w-7 animate-bounce-badge" />
              </div>
              <div className="min-w-0">
                <span className="block bg-gradient-to-r from-[#E31E24] to-[#FF6B35] bg-clip-text text-lg font-extrabold leading-tight tracking-tight text-transparent sm:text-2xl">
                  ChicknChunks
                </span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 sm:text-xs">
                  <Clock className="h-3 w-3 text-[#E31E24]" /> 30-40 min • 4.9 ⭐
                </span>
              </div>
            </div>

            {/* Change Address Location Trigger */}
            <div
              onClick={() => setIsAddressModalOpen(true)}
              title={user?.address || 'Select Delivery Location'}
              className="hidden min-w-0 max-w-[240px] flex-1 items-center gap-2 rounded-full border border-gray-200 bg-gray-100/90 px-3.5 py-2 text-xs font-medium text-gray-700 transition hover:bg-red-50/50 hover:border-red-200 cursor-pointer lg:flex group"
            >
              <MapPin className="h-4 w-4 shrink-0 text-[#E31E24]" />
              <span className="truncate">{user?.address || 'Select Location'}</span>
              <span className="shrink-0 rounded-full bg-[#E31E24]/10 px-2 py-0.5 text-[10px] font-bold text-[#E31E24] group-hover:bg-[#E31E24] group-hover:text-white transition">
                Change
              </span>
            </div>

            {/* Search Input */}
            {(location.pathname === '/' || location.pathname === '/menu') && (
              <div className="relative hidden min-w-0 flex-1 max-w-md md:block">
                <div className="pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 items-center">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search Zinger, Wings, Broast..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.6rem' }}
                  className="w-full rounded-full border border-transparent bg-gray-100 py-2.5 pr-9 text-xs text-gray-800 shadow-inner transition focus:border-[#E31E24]/30 focus:bg-white focus:ring-2 focus:ring-[#E31E24]/10 sm:text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-400 transition hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* Right Header Action Controls */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              
              {/* Cart Toggle Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#E31E24] to-[#FF6B35] px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-red-500/25 transition active:scale-95 sm:px-4 sm:text-sm"
              >
                <div className="relative">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                  {totalCartCount > 0 && (
                    <span className="absolute -right-2.5 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-black text-black shadow animate-bounce-badge sm:h-5 sm:w-5">
                      {totalCartCount}
                    </span>
                  )}
                </div>
                <span className="font-bold">{formatPrice(subtotal)}</span>
              </button>

              {/* Authentication / Profile Dropdown */}
              {!isLoggedIn ? (
                /* Before Login: Show ONLY Login Button */
                <button
                  onClick={() => { setIsAuthModalOpen(true); navigate('/login'); }}
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm transition hover:border-[#E31E24] hover:text-[#E31E24] hover:shadow"
                >
                  <User className="h-4 w-4 text-[#E31E24]" />
                  <span>Login</span>
                </button>
              ) : (
                /* After Login: Show ONLY User Profile Avatar & Dropdown */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(prev => !prev)}
                    className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-800 shadow-sm transition hover:border-[#E31E24] hover:shadow"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#E31E24] to-[#FF6B35] text-xs font-black text-white shadow">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline font-black text-gray-900">{displayName}</span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${profileDropdownOpen ? 'rotate-180 text-[#E31E24]' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 z-[9999] w-64 rounded-3xl border border-gray-100 bg-white p-3 shadow-2xl animate-fade-in space-y-1">
                      
                      {/* User Header Info */}
                      <div className="px-3 py-2.5 border-b border-gray-100 bg-gray-50/80 rounded-2xl mb-1">
                        <p className="text-xs font-black text-gray-900 truncate">{user?.name || riderProfile?.name || (isAdminLoggedIn ? 'System Administrator' : 'User')}</p>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[10px] text-gray-500 font-mono truncate">{user?.email || riderProfile?.email || 'authenticated'}</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${isAdminLoggedIn ? 'bg-blue-100 text-blue-800' : isRiderLoggedIn ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                            {displayRoleBadge}
                          </span>
                        </div>
                      </div>

                      {/* Role Based Menu Items */}
                      {isAdminLoggedIn ? (
                        /* Admin Dropdown Menu */
                        <>
                          <button
                            onClick={() => { setProfileDropdownOpen(false); navigate('/admin/staff'); }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-red-50 hover:text-[#E31E24]"
                          >
                            <User className="h-4 w-4 text-[#E31E24]" />
                            <span>My Profile</span>
                          </button>
                          <button
                            onClick={() => { setProfileDropdownOpen(false); navigate('/admin'); }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-red-50 hover:text-[#E31E24]"
                          >
                            <LayoutDashboard className="h-4 w-4 text-blue-600" />
                            <span>Admin Dashboard</span>
                          </button>
                          <button
                            onClick={() => { setProfileDropdownOpen(false); navigate('/admin/settings'); }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-red-50 hover:text-[#E31E24]"
                          >
                            <Settings className="h-4 w-4 text-gray-600" />
                            <span>Settings</span>
                          </button>
                        </>
                      ) : isRiderLoggedIn ? (
                        /* Rider Dropdown Menu */
                        <>
                          <button
                            onClick={() => { setProfileDropdownOpen(false); navigate('/rider/profile'); }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-red-50 hover:text-[#E31E24]"
                          >
                            <User className="h-4 w-4 text-[#E31E24]" />
                            <span>My Profile</span>
                          </button>
                          <button
                            onClick={() => { setProfileDropdownOpen(false); navigate('/rider'); }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-red-50 hover:text-[#E31E24]"
                          >
                            <Bike className="h-4 w-4 text-amber-600" />
                            <span>Rider Dashboard</span>
                          </button>
                          <button
                            onClick={() => { setProfileDropdownOpen(false); navigate('/rider/orders'); }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-red-50 hover:text-[#E31E24]"
                          >
                            <Package className="h-4 w-4 text-orange-600" />
                            <span>Assigned Orders</span>
                          </button>
                        </>
                      ) : (
                        /* Customer Dropdown Menu */
                        <>
                          <button
                            onClick={() => { setProfileDropdownOpen(false); navigate('/profile'); }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-red-50 hover:text-[#E31E24]"
                          >
                            <User className="h-4 w-4 text-[#E31E24]" />
                            <span>My Profile</span>
                          </button>
                          <button
                            onClick={() => { setProfileDropdownOpen(false); navigate('/orders'); }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-red-50 hover:text-[#E31E24]"
                          >
                            <Package className="h-4 w-4 text-emerald-600" />
                            <span>My Orders</span>
                          </button>
                          <button
                            onClick={() => { setProfileDropdownOpen(false); navigate('/tracking'); }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-red-50 hover:text-[#E31E24]"
                          >
                            <Bike className="h-4 w-4 text-[#E31E24]" />
                            <span>Order Tracking</span>
                          </button>
                        </>
                      )}

                      {/* Logout Button */}
                      <div className="pt-1 border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {activeView === 'menu' && (
            <div className="pb-3 md:hidden">
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search food items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  className="w-full rounded-full border border-transparent bg-gray-100 py-2 pr-4 text-xs text-gray-800"
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Address Selection Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
      />
    </>
  );
};
