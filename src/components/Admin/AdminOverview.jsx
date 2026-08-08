import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../lib/currency';
import { DollarSign, ShoppingBag, Clock, Flame, ArrowUpRight } from 'lucide-react';

export const AdminOverview = ({ onNavigate }) => {
  const { allOrders, menuItems } = useApp();

  const totalRevenue = allOrders.reduce((acc, curr) => acc + curr.total, 0);
  const pendingOrders = allOrders.filter(o => o.status === 'placed' || o.status === 'preparing');
  const popularItem = menuItems.find(i => i.badge === 'Best Seller' || i.popular) || menuItems[0];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Dashboard Overview</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Real-time performance metrics and active orders overview.</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Revenue */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 block uppercase">Total Revenue</span>
            <span className="text-2xl font-black text-gray-900">{formatPrice(totalRevenue)}</span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 block uppercase">Total Orders</span>
            <span className="text-2xl font-black text-gray-900">{allOrders.length}</span>
          </div>
        </div>

        {/* Card 3: Pending Orders */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 block uppercase">Pending Orders</span>
            <span className="text-2xl font-black text-amber-600">{pendingOrders.length}</span>
          </div>
        </div>

        {/* Card 4: Best Seller */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E31E24] flex items-center justify-center font-bold text-xl shrink-0">
            <Flame className="w-6 h-6 fill-[#E31E24]" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-gray-400 block uppercase">Top Seller</span>
            <span className="text-sm font-black text-gray-900 truncate block">{popularItem?.name || 'Zinger Supreme'}</span>
          </div>
        </div>

      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900">Recent Customer Orders</h2>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-extrabold text-[#E31E24] hover:underline flex items-center gap-1"
          >
            <span>View All Orders ({allOrders.length})</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Responsive Table */}
        <div className="responsive-table-container">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allOrders.slice(0, 5).map((order) => (
                <tr key={order.orderId} className="hover:bg-gray-50/80 font-medium">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{order.orderId}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-gray-900">{order.customerName}</div>
                    <div className="text-gray-400 text-[10px] truncate max-w-[160px]">{order.address}</div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 font-semibold">{order.paymentMethod}</td>
                  <td className="py-3.5 px-4 font-black text-gray-900">{formatPrice(order.total)}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      order.status === 'delivered'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : order.status === 'on_way'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
