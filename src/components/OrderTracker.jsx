import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  Phone,
  Bike,
  ChefHat,
  Check,
  MapPin,
  ArrowRight,
  Shield,
  Clock,
  ArrowLeft,
  ChevronDown,
  Package,
  Layers
} from 'lucide-react';
import { formatPrice } from '../lib/currency';

export const OrderTracker = () => {
  const navigate = useNavigate();
  const { orderId: routeOrderId } = useParams();
  const { activeOrder, setActiveOrder, allOrders, fetchOrder, setActiveChatOrderId, activeChatOrderId, setActiveView } = useApp();

  const [orderDropdownOpen, setOrderDropdownOpen] = useState(false);

  // If a route parameter is passed (e.g. /tracking/CHK-12345), find and activate that order
  useEffect(() => {
    if (routeOrderId) {
      const match = allOrders.find(o => String(o.orderId) === String(routeOrderId));
      if (match) {
        setActiveOrder(match);
      } else {
        fetchOrder(routeOrderId).then(d => {
          if (d) setActiveOrder(d);
        });
      }
    }
  }, [routeOrderId, allOrders]);

  const getStepNumber = (statusStr) => {
    switch (statusStr) {
      case 'placed':
      case 'pending':
        return 1;
      case 'preparing':
        return 2;
      case 'on_way':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 1;
    }
  };

  // Poll backend for live order status updates for the active order
  useEffect(() => {
    if (!activeOrder?.orderId) return;
    const currentId = activeOrder.orderId;
    fetchOrder(currentId);
    const interval = setInterval(() => fetchOrder(currentId), 4000);
    return () => clearInterval(interval);
  }, [activeOrder?.orderId]);

  // SCENARIO 1: NO SINGLE ORDER IS SELECTED -> SHOW MULTI-ORDER TRACKING DASHBOARD
  if (!activeOrder) {
    return (
      <div className="app-container mb-20 animate-fade-in py-8 space-y-6">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E31E24] to-[#FF6B35] text-white shadow-md">
                <Bike className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">Live Order Tracking</h1>
            </div>
            <p className="mt-1 text-xs text-gray-500 font-medium">Select any of your orders below to view live GPS status and rider updates.</p>
          </div>

          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <Package className="h-4 w-4 text-[#E31E24]" />
            <span>View All Orders History</span>
          </button>
        </div>

        {allOrders.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-md space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-[#E31E24]">
              <Bike className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Orders to Track</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">You don't have any active or past orders to track right now.</p>
            <button onClick={() => { setActiveView('menu'); navigate('/'); }} className="btn-primary px-6 py-2.5 text-xs">
              Browse Menu & Place Order
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {allOrders.map((order) => {
              const step = getStepNumber(order.status);
              const formattedDate = order.createdAt
                ? new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                : 'Today';

              return (
                <div
                  key={order.orderId}
                  className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <span className="font-mono text-sm font-black text-gray-900">{order.orderId}</span>
                        <p className="text-[11px] text-gray-400 font-medium">{formattedDate} • {order.items?.length || 1} items</p>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        step === 4 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}>
                        {step === 4 ? '🎉 Delivered' : step === 3 ? '🛵 On The Way' : step === 2 ? '👨‍🍳 Preparing' : '📋 Placed'}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-gray-700 truncate">
                      {order.items?.map(i => i.name).join(', ') || 'Hot Meal'}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                      <span>Total: <strong className="text-gray-900 font-mono">{formatPrice(order.total)}</strong></span>
                      <span className="truncate max-w-[180px]">📍 {order.address}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveOrder(order);
                      navigate(`/tracking/${order.orderId}`);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#E31E24] to-[#FF6B35] py-3 text-xs font-bold text-white shadow-md shadow-red-500/20 hover:from-red-700 hover:to-orange-600 transition"
                  >
                    <Bike className="h-4 w-4" />
                    <span>Track Order #{order.orderId}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // SCENARIO 2: A SPECIFIC ORDER IS SELECTED -> SHOW DETAILED LIVE TRACKING SCREEN
  const currentStep = getStepNumber(activeOrder.status);
  const stepsList = [
    { num: 1, label: 'Order Placed', icon: CheckCircle2 },
    { num: 2, label: 'Kitchen Preparing', icon: ChefHat },
    { num: 3, label: 'On The Way', icon: Bike },
    { num: 4, label: 'Delivered', icon: Check }
  ];

  const rider = activeOrder.rider;
  const hasRiderAssigned = !!rider;

  return (
    <div className="app-container mb-20 animate-fade-in space-y-8 overflow-x-hidden py-8 pb-12 sm:py-10">
      
      {/* Top Navigation & Order Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <button
          onClick={() => { setActiveOrder(null); navigate('/tracking'); }}
          className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#E31E24] transition"
        >
          <ArrowLeft className="h-4 w-4 text-[#E31E24]" />
          <span>Back to All Orders</span>
        </button>

        {/* Order Switcher Dropdown */}
        {allOrders.length > 1 && (
          <div className="relative">
            <button
              onClick={() => setOrderDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-800 shadow-sm hover:border-[#E31E24]"
            >
              <Layers className="h-4 w-4 text-[#E31E24]" />
              <span>Switch Order ({allOrders.length} Available)</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {orderDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-3xl border border-gray-100 bg-white p-2 shadow-2xl space-y-1">
                {allOrders.map(o => (
                  <button
                    key={o.orderId}
                    onClick={() => {
                      setActiveOrder(o);
                      setOrderDropdownOpen(false);
                      navigate(`/tracking/${o.orderId}`);
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-xs font-bold transition ${
                      o.orderId === activeOrder.orderId ? 'bg-red-50 text-[#E31E24]' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-mono">{o.orderId}</span>
                    <span className="capitalize text-[10px] text-gray-500 font-normal">{o.status?.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hero Banner Status */}
      <div className="relative overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-r from-[#111827] via-[#1E0D10] to-[#2B0E12] p-6 text-white shadow-2xl sm:p-8">
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-yellow-400">
              Live Order Status
            </span>
            <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">
              {currentStep === 4 ? '🎉 Order Delivered!' : 'Your Hot Meal is on the Way!'}
            </h1>
            <p className="mt-1 text-xs text-gray-300 sm:text-sm">
              Order ID: <span className="font-mono font-bold text-yellow-400">{activeOrder.orderId}</span> • {activeOrder.items?.length || 1} {activeOrder.items?.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          <div className="self-stretch rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-center shadow-sm backdrop-blur-md sm:self-auto">
            <span className="block text-[10px] font-bold uppercase text-gray-300">Estimated Arrival</span>
            <span className="text-2xl font-black text-white sm:text-3xl">{currentStep === 4 ? '00:00' : '25 min'}</span>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-md sm:p-8">
        <div className="relative grid grid-cols-4 gap-2">
          <div className="absolute left-6 right-6 top-5 h-1 -z-0 bg-gray-200 sm:top-6">
            <div className="h-full bg-gradient-to-r from-[#E31E24] to-[#FF6B35] transition-all duration-700" style={{ width: `${((currentStep - 1) / 3) * 100}%` }} />
          </div>

          {stepsList.map((s) => {
            const isDone = currentStep >= s.num;
            const isCurrent = currentStep === s.num;
            const Icon = s.icon;

            return (
              <div key={s.num} className="z-10 flex flex-col items-center text-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold shadow-md transition-all duration-300 sm:h-12 sm:w-12 sm:text-sm ${isDone ? 'bg-gradient-to-r from-[#E31E24] to-[#FF6B35] text-white ring-4 ring-red-100' : 'border border-gray-200 bg-gray-100 text-gray-400'} ${isCurrent ? 'scale-110 animate-bounce-badge' : ''}`}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className={`mt-2 text-[10px] font-extrabold sm:mt-3 sm:text-xs ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rider & Map Info Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {hasRiderAssigned ? (
          <div className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-5 shadow-md sm:p-6 md:col-span-5">
            <div>
              <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E31E24]">
                <Bike className="h-4 w-4" />
                <span>Assigned Delivery Rider</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E31E24] to-[#FF6B35] text-xl font-bold text-white shadow-lg sm:h-14 sm:w-14">👨‍💼</div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 sm:text-base">{rider.name}</h3>
                  {rider.vehicle && <p className="text-xs font-semibold text-gray-500">{rider.vehicle}</p>}
                  <span className="text-xs font-bold text-[#E31E24]">Status: {rider.deliveryStatus?.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
              <a href={`tel:${rider.phone || '+92 300 0000000'}`} className="btn-primary flex-1 py-2.5 text-xs">
                <Phone className="h-4 w-4" />
                <span>Call Rider</span>
              </a>
              <button
                onClick={() => {
                  const isCurrent = activeChatOrderId?.orderId === activeOrder.orderId && activeChatOrderId?.channel === 'customer_rider';
                  setActiveChatOrderId(isCurrent ? null : { orderId: activeOrder.orderId, channel: 'customer_rider' });
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 text-xs font-bold transition ${
                  activeChatOrderId?.orderId === activeOrder.orderId && activeChatOrderId?.channel === 'customer_rider'
                    ? 'border-[#E31E24] bg-red-50 text-[#E31E24]'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
                title="Chat with your rider"
              >
                <Bike className="h-4 w-4 text-[#E31E24]" />
                <span>Chat Rider</span>
              </button>
              <button
                onClick={() => {
                  const isCurrent = activeChatOrderId?.orderId === activeOrder.orderId && activeChatOrderId?.channel === 'customer_admin';
                  setActiveChatOrderId(isCurrent ? null : { orderId: activeOrder.orderId, channel: 'customer_admin' });
                }}
                className={`flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 text-xs font-bold transition ${
                  activeChatOrderId?.orderId === activeOrder.orderId && activeChatOrderId?.channel === 'customer_admin'
                    ? 'border-blue-500 bg-blue-100 text-blue-800'
                    : 'border-blue-200 bg-blue-50/60 text-blue-800 hover:bg-blue-100'
                }`}
                title="Chat with Support Admin"
              >
                <Shield className="h-4 w-4 text-blue-600" />
                <span>Chat Admin</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-between rounded-3xl border border-amber-200/60 bg-amber-50/50 p-5 shadow-sm sm:p-6 md:col-span-5">
            <div>
              <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
                <Bike className="h-4 w-4 animate-bounce" />
                <span>Rider Assignment Status</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-xl text-white shadow-md">🛵</div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 sm:text-base">Waiting for Rider Assignment</h3>
                  <p className="mt-0.5 text-xs text-gray-500">Our kitchen is preparing your order. An available rider will be assigned shortly!</p>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-white p-3 border border-amber-100 text-[11px] font-semibold text-amber-800 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>Admin is selecting an available rider...</span>
            </div>
          </div>
        )}

        <div className="relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-gray-800 p-5 text-white shadow-md sm:p-6 md:col-span-7">
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-10 [background-size:16px_16px]" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold shrink-0">
              <MapPin className="h-3.5 w-3.5 text-[#FF6B35]" />
              <span>Live GPS Track</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 shrink-0">
              <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
              Active Signal
            </span>
          </div>

          <div className="relative z-10 my-6 flex items-center justify-between px-2 sm:my-8">
            <div className="shrink-0 text-center">
              <span className="text-xl sm:text-2xl">🍗</span>
              <span className="mt-1 block text-[10px] font-bold text-gray-300">Kitchen</span>
            </div>

            <div className="relative flex-1 px-4">
              <div className="h-1 w-full rounded-full bg-white/20" />
              <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000" style={{ left: `${Math.min(80, (currentStep / 4) * 100)}%` }}>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF6B35] text-xs shadow-lg ring-4 ring-white/20 animate-pulse sm:h-8 sm:w-8 sm:text-sm">🛵</div>
              </div>
            </div>

            <div className="shrink-0 text-center">
              <span className="text-xl sm:text-2xl">🏠</span>
              <span className="mt-1 block text-[10px] font-bold text-gray-300">Your Home</span>
            </div>
          </div>

          <div className="relative z-10 px-1 text-xs text-gray-300">
            📍 Address: <span className="font-bold text-white">{activeOrder.address}</span>
          </div>
        </div>
      </div>

      <div className="pt-4 text-center">
        <button onClick={() => { setActiveOrder(null); setActiveView('menu'); navigate('/'); }} className="btn-secondary px-6 py-3 text-xs sm:text-sm">
          <span>Order Something Else</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
