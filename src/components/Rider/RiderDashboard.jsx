import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../lib/currency';
import { Bike, ShoppingBag, Clock, DollarSign, TrendingUp, LogOut, Navigation, CheckCircle2, MapPin, MessageSquare, User, Key, Shield, X, Phone, ShieldCheck } from 'lucide-react';

const statusSteps = [
  { value: 'placed', label: 'Accepted', icon: CheckCircle2 },
  { value: 'preparing', label: 'Preparing', icon: Clock },
  { value: 'on_way', label: 'On the Way', icon: Navigation },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle2 }
];

export const RiderDashboard = () => {
  const navigate = useNavigate();
  const { allOrders, riderProfile, riderLogout, updateOrderStatus, activeChatOrderId, setActiveChatOrderId, updateRiderProfile, fetchOrders } = useApp();

  useEffect(() => {
    fetchOrders();
  }, []);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    phone: riderProfile?.phone || '',
    availabilityStatus: riderProfile?.availabilityStatus || 'on_duty',
    currentPassword: '',
    newPassword: ''
  });
  const [profileMsg, setProfileMsg] = useState(null);

  const assignedOrders = useMemo(
    () => allOrders.filter((o) => {
      const myRiderId = riderProfile?.id ?? riderProfile?.user_id;
      const orderRiderId = o.rider?.id ?? o.riderId ?? o.rider_id;
      if (myRiderId && orderRiderId && String(orderRiderId) !== String(myRiderId)) {
        return false;
      }
      return o.status !== 'delivered';
    }),
    [allOrders, riderProfile]
  );

  const completedOrders = useMemo(
    () => allOrders.filter((o) => {
      const myRiderId = riderProfile?.id ?? riderProfile?.user_id;
      const orderRiderId = o.rider?.id ?? o.riderId ?? o.rider_id;
      if (myRiderId && orderRiderId && String(orderRiderId) !== String(myRiderId)) {
        return false;
      }
      return o.status === 'delivered';
    }),
    [allOrders, riderProfile]
  );

  const earnings = useMemo(
    () => completedOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
    [completedOrders]
  );

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      await updateRiderProfile(profileForm);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    }
  };

  const stats = [
    { label: 'Active Deliveries', value: assignedOrders.length, icon: ShoppingBag, color: 'bg-orange-50 text-orange-600' },
    { label: 'Completed', value: completedOrders.length, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Total Earnings', value: formatPrice(earnings), icon: DollarSign, color: 'bg-blue-50 text-blue-600' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      <div className="app-container py-6 sm:py-8 lg:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
              <Bike className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Rider Dashboard</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${riderProfile?.availabilityStatus === 'on_duty' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {riderProfile?.availabilityStatus === 'on_duty' ? '🟢 On Duty' : '🔴 Off Duty'}
                </span>
              </div>
              <h2 className="text-xl font-black text-gray-900">{riderProfile?.name || 'Delivery Partner'}</h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {assignedOrders.length > 0 && (
              <button
                onClick={() => {
                  const isCurrent = activeChatOrderId?.orderId === assignedOrders[0].orderId && activeChatOrderId?.channel === 'admin_rider';
                  setActiveChatOrderId(isCurrent ? null : { orderId: assignedOrders[0].orderId, channel: 'admin_rider' });
                }}
                className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                  activeChatOrderId?.orderId === assignedOrders[0].orderId && activeChatOrderId?.channel === 'admin_rider'
                    ? 'border-blue-500 bg-blue-100 text-blue-800'
                    : 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                <Shield className="h-4 w-4 text-blue-600" />
                <span>Chat Admin</span>
              </button>
            )}

            <button
              onClick={() => {
                setProfileForm({
                  phone: riderProfile?.phone || '',
                  availabilityStatus: riderProfile?.availabilityStatus || 'on_duty',
                  currentPassword: '',
                  newPassword: ''
                });
                setProfileModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              <User className="h-4 w-4 text-[#E31E24]" />
              <span>Profile & Settings</span>
            </button>

            <button
              onClick={() => { riderLogout(); navigate('/'); }}
              className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">{stat.label}</p>
                  <p className="text-xl font-black text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {assignedOrders.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <Bike className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-lg font-black text-gray-900">No Active Deliveries</p>
            <p className="mt-1 text-sm text-gray-500">You'll see new orders here as they are assigned to you by Admin.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-gray-900">Active Deliveries ({assignedOrders.length})</h3>
            {assignedOrders.map((order) => {
              const currentStep = statusSteps.findIndex((s) => s.value === order.status);
              const isCustomerChatActive = activeChatOrderId?.orderId === order.orderId && activeChatOrderId?.channel === 'customer_rider';
              const isAdminChatActive = activeChatOrderId?.orderId === order.orderId && activeChatOrderId?.channel === 'admin_rider';

              return (
                <div key={order.orderId} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-gray-900 font-mono">{order.orderId}</span>
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase text-amber-700">{order.status}</span>
                        {order.assignedAt && (
                          <span className="text-[10px] text-gray-400 font-semibold">
                            Assigned: {new Date(order.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-700">
                        <MapPin className="h-3.5 w-3.5 text-[#E31E24] shrink-0" />
                        <span className="font-bold">{order.address}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="font-bold text-gray-900">👤 {order.customerName}</span>
                        <a href={`tel:${order.customerPhone}`} className="font-bold text-[#E31E24] hover:underline">📞 {order.customerPhone}</a>
                      </div>
                    </div>

                    <div className="flex flex-wrap shrink-0 items-center gap-2">
                      <button
                        onClick={() => setActiveChatOrderId(isCustomerChatActive ? null : { orderId: order.orderId, channel: 'customer_rider' })}
                        className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2.5 text-xs font-bold transition ${
                          isCustomerChatActive
                            ? 'border-[#E31E24] bg-red-50 text-[#E31E24]'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                        title="Chat with Customer"
                      >
                        <User className="h-3.5 w-3.5 text-[#E31E24]" />
                        <span>Chat Customer</span>
                      </button>

                      <button
                        onClick={() => setActiveChatOrderId(isAdminChatActive ? null : { orderId: order.orderId, channel: 'admin_rider' })}
                        className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2.5 text-xs font-bold transition ${
                          isAdminChatActive
                            ? 'border-blue-500 bg-blue-100 text-blue-800'
                            : 'border-blue-200 bg-blue-50/50 text-blue-800 hover:bg-blue-100'
                        }`}
                        title="Chat with Admin Support"
                      >
                        <Shield className="h-3.5 w-3.5 text-blue-600" />
                        <span>Chat Admin</span>
                      </button>

                      {(() => {
                        const nextConfig = order.status === 'placed'
                          ? { value: 'preparing', label: 'Preparing' }
                          : order.status === 'preparing'
                          ? { value: 'on_way', label: 'On the Way' }
                          : order.status === 'on_way'
                          ? { value: 'delivered', label: 'Delivered' }
                          : null;

                        if (!nextConfig) return null;

                        return (
                          <button
                            onClick={() => updateOrderStatus(order.orderId, nextConfig.value)}
                            className="flex items-center gap-1.5 rounded-2xl bg-[#E31E24] px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-red-700"
                          >
                            <Navigation className="h-3.5 w-3.5" />
                            <span>Mark {nextConfig.label}</span>
                          </button>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Order Details & Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                    <div>
                      <span className="font-bold text-gray-500 block uppercase text-[10px]">Items Included:</span>
                      <p className="font-semibold text-gray-800 mt-0.5">
                        {order.items?.map(i => `${i.name} (x${i.quantity})`).join(', ') || 'Standard Combo'}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500 block uppercase text-[10px]">Payment & Total:</span>
                      <p className="font-black text-[#E31E24] mt-0.5 text-sm">
                        {formatPrice(Number(order.total))} • <span className="text-gray-700 text-xs uppercase font-bold">{order.paymentMethod || 'Cash on Delivery'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 border-t border-gray-100 pt-3">
                    {statusSteps.map((step, i) => {
                      const StepIcon = step.icon;
                      const isDone = i <= currentStep;
                      const isLast = i === statusSteps.length - 1;
                      return (
                        <React.Fragment key={step.value}>
                          <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold ${
                            isDone ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'
                          }`}>
                            <StepIcon className={`h-3.5 w-3.5 ${isDone ? 'text-emerald-600' : ''}`} />
                            <span>{step.label}</span>
                          </div>
                          {!isLast && <div className={`h-px flex-1 ${i < currentStep ? 'bg-emerald-400' : 'bg-gray-200'}`} />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rider Profile Drawer/Modal */}
        {profileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 space-y-4 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setProfileModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-red-50 text-[#E31E24] flex items-center justify-center font-bold">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Rider Profile & Settings</h3>
                  <p className="text-xs text-gray-500">{riderProfile?.email}</p>
                </div>
              </div>

              {profileMsg && (
                <div className={`p-3 rounded-2xl text-xs font-bold ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold"
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Duty Availability</label>
                  <select
                    value={profileForm.availabilityStatus}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, availabilityStatus: e.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold"
                  >
                    <option value="on_duty">🟢 On Duty (Ready for deliveries)</option>
                    <option value="off_duty">🔴 Off Duty (Unavailable)</option>
                  </select>
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-3">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Change Password</span>
                  <input
                    type="password"
                    value={profileForm.currentPassword}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold"
                    placeholder="Current Password"
                  />
                  <input
                    type="password"
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold"
                    placeholder="New Password (min 6 chars)"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-gray-100">
                  <button type="button" onClick={() => setProfileModalOpen(false)} className="rounded-2xl border border-gray-200 px-4 py-3 text-xs font-bold text-gray-600">Close</button>
                  <button type="submit" className="rounded-2xl bg-[#E31E24] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-red-700">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
