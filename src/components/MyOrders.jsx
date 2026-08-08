import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../lib/currency';
import {
  Package,
  Search,
  Bike,
  Clock,
  ChevronDown,
  ChevronUp,
  MapPin,
  CreditCard,
  Banknote,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ChefHat
} from 'lucide-react';

export const MyOrders = () => {
  const navigate = useNavigate();
  const { allOrders, setActiveOrder, setActiveView } = useApp();

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'placed':
      case 'pending':
        return (
          <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
            <Clock className="h-3.5 w-3.5" /> Order Placed
          </span>
        );
      case 'preparing':
        return (
          <span className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">
            <ChefHat className="h-3.5 w-3.5" /> Preparing
          </span>
        );
      case 'on_way':
        return (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            <Bike className="h-3.5 w-3.5 animate-bounce" /> On The Way
          </span>
        );
      case 'delivered':
        return (
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" /> Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
            <XCircle className="h-3.5 w-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
            {status}
          </span>
        );
    }
  };

  const filteredOrders = allOrders.filter((order) => {
    // 1. Status Filter
    if (activeFilter === 'pending' && order.status !== 'placed' && order.status !== 'pending') return false;
    if (activeFilter === 'preparing' && order.status !== 'preparing') return false;
    if (activeFilter === 'on_way' && order.status !== 'on_way') return false;
    if (activeFilter === 'delivered' && order.status !== 'delivered') return false;
    if (activeFilter === 'cancelled' && order.status !== 'cancelled') return false;

    // 2. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.orderId?.toLowerCase().includes(q);
      const matchCustomer = order.customerName?.toLowerCase().includes(q);
      const matchItem = order.items?.some(i => i.name?.toLowerCase().includes(q));
      return matchId || matchCustomer || matchItem;
    }

    return true;
  });

  const displayedOrders = filteredOrders.slice(0, visibleCount);

  const handleTrackOrder = (order) => {
    setActiveOrder(order);
    navigate(`/tracking/${order.orderId}`);
  };

  return (
    <div className="app-container mb-20 animate-fade-in py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E31E24] to-[#FF6B35] text-white shadow-md">
              <Package className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">My Order History</h1>
          </div>
          <p className="mt-1 text-xs text-gray-500 font-medium">View and track all your previous ChicknChunks orders in one place.</p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm">
          <span>Total Orders:</span>
          <span className="rounded-full bg-red-100 px-2 py-0.5 font-black text-[#E31E24]">{allOrders.length}</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending' },
            { id: 'preparing', label: 'Preparing' },
            { id: 'on_way', label: 'On The Way' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveFilter(tab.id); setVisibleCount(20); }}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                activeFilter === tab.id
                  ? 'bg-gradient-to-r from-[#E31E24] to-[#FF6B35] text-white shadow-md shadow-red-500/20'
                  : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Order # or Item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-gray-200 bg-white py-2 pl-9 pr-4 text-xs text-gray-800 shadow-sm focus:border-[#E31E24] focus:ring-2 focus:ring-red-100"
          />
        </div>
      </div>

      {/* Orders List */}
      {displayedOrders.length === 0 ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-md space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-[#E31E24]">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Orders Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery || activeFilter !== 'all'
              ? 'No orders match your current filter or search criteria.'
              : 'You haven\'t placed any orders yet. Explore our delicious menu!'}
          </p>
          <button onClick={() => { setActiveView('menu'); navigate('/'); }} className="btn-primary px-6 py-2.5 text-xs">
            Browse Menu & Order Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((order) => {
            const isExpanded = expandedOrderId === order.orderId;
            const formattedDate = order.createdAt
              ? new Date(order.createdAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Recent Order';

            return (
              <div
                key={order.orderId}
                className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E31E24] to-[#FF6B35] font-mono text-xs font-black text-white shadow">
                      #{order.orderId?.slice(-3)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900 sm:text-base font-mono">
                        {order.orderId}
                      </h3>
                      <span className="text-xs text-gray-400 font-medium">{formattedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <span className="text-base font-black text-gray-900 sm:text-lg">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-black text-gray-800">
                        {order.items?.length || 1} {order.items?.length === 1 ? 'ITEM' : 'ITEMS'}
                      </span>
                      <span className="text-gray-500 font-normal truncate max-w-md">
                        {order.items?.map(i => `${i.name} (x${i.quantity})`).join(', ') || 'Delicious Meal'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Banknote className="h-3.5 w-3.5 text-gray-400" />
                        {order.paymentMethod || 'Cash on Delivery'}
                      </span>
                      •
                      <span className="flex items-center gap-1 truncate max-w-xs">
                        <MapPin className="h-3.5 w-3.5 text-[#E31E24]" />
                        {order.address}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 sm:pt-0">
                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.orderId)}
                      className="flex items-center gap-1 rounded-2xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    <button
                      onClick={() => handleTrackOrder(order)}
                      className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#E31E24] to-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-md shadow-red-500/20 hover:from-red-700 hover:to-orange-600 transition"
                    >
                      <Bike className="h-4 w-4" />
                      <span>Track Order</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Details Breakdown Modal/Drawer */}
                {isExpanded && (
                  <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50/80 p-4 space-y-4 animate-fade-in text-xs">
                    <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2 flex items-center justify-between">
                      <span>Order Items Breakdown</span>
                      <span className="text-[11px] font-mono text-gray-500">ID: {order.orderId}</span>
                    </h4>

                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-200/60 last:border-0">
                          <div>
                            <span className="font-bold text-gray-900">{item.name}</span>
                            <span className="text-gray-500 ml-2">x{item.quantity}</span>
                            {item.selectedSpice && item.selectedSpice !== 'Default' && (
                              <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold text-[#E31E24]">
                                {item.selectedSpice}
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-gray-800">
                            {formatPrice((item.price || item.unitPrice) * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1 pt-2 border-t border-gray-200 font-medium text-gray-600">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-mono font-bold text-gray-800">{formatPrice(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span className="font-mono font-bold text-gray-800">{formatPrice(order.deliveryFee)}</span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-bold">
                          <span>Discount</span>
                          <span className="font-mono">-{formatPrice(order.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-200">
                        <span>Grand Total</span>
                        <span className="text-[#E31E24] font-mono">{formatPrice(order.total)}</span>
                      </div>
                    </div>

                    {order.rider && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bike className="h-4 w-4 text-amber-700" />
                          <span className="font-bold text-amber-900">Rider: {order.rider.name}</span>
                        </div>
                        <a href={`tel:${order.rider.phone}`} className="text-amber-800 font-bold underline">
                          Call Rider
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Load More Pagination */}
          {filteredOrders.length > visibleCount && (
            <div className="pt-6 text-center">
              <button
                onClick={() => setVisibleCount(prev => prev + 20)}
                className="btn-secondary px-8 py-3 text-xs font-bold shadow"
              >
                Load More Orders ({filteredOrders.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
