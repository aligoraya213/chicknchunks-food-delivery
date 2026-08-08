import React from 'react';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../lib/currency';
import { productImageUrl } from '../lib/productImage';
import { Plus, Minus, Tag, Flame, ShoppingBag, Eye } from 'lucide-react';

export const DealCard = ({ deal }) => {
  const { cart, setSelectedItemForModal } = useApp();

  const dealCartId = `deal-${deal.id}`;
  const totalInCart = cart.filter(i => i.uniqueCartId?.startsWith(dealCartId) || i.id === dealCartId || i.id === deal.id).reduce((sum, i) => sum + i.quantity, 0);

  const formattedDealObj = {
    ...deal,
    id: `deal-${deal.id}`,
    rawId: deal.id,
    isDeal: true,
    category: 'deals',
    badge: deal.badge || 'SPECIAL DEAL',
    image: deal.image || '',
    options: deal.options || {
      spiceLevels: ['Mild', 'Spicy', 'Extra Hot'],
      additions: [
        { name: 'Extra Dip Sauce', price: 40 },
        { name: 'Upgrade Drink to 1.5L', price: 80 }
      ]
    }
  };

  const handleOpenModal = (e) => {
    e.stopPropagation();
    setSelectedItemForModal(formattedDealObj);
  };

  return (
    <div
      onClick={handleOpenModal}
      className="bg-white rounded-3xl border-2 border-red-500/20 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1 relative cursor-pointer"
    >
      {/* Deal Badge Banner */}
      <div className="absolute top-3 left-3 z-10">
        <span className="bg-gradient-to-r from-[#E31E24] to-[#FF6B35] text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
          <Tag className="w-3.5 h-3.5 fill-white" />
          SPECIAL DEAL
        </span>
      </div>

      {/* Deal Image Header */}
      <div className="relative overflow-hidden bg-gray-100 h-52 sm:h-56">
        <img
          src={productImageUrl(deal.image)}
          alt={deal.name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
        {totalInCart > 0 && (
          <div className="absolute bottom-3 right-3 bg-[#E31E24] text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
            {totalInCart} in cart
          </div>
        )}
      </div>

      {/* Deal Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1 font-semibold">
            <span className="uppercase tracking-wider text-[#E31E24]">Combo Deal</span>
            <span>🔥 Hot Deal</span>
          </div>

          <h3 className="text-lg font-extrabold text-gray-900 line-clamp-1 group-hover:text-[#E31E24] transition">
            {deal.name}
          </h3>

          <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {deal.description || (deal.items?.map(i => `${i.name} x${i.quantity}`).join(' + '))}
          </p>

          {deal.items && deal.items.length > 0 && (
            <div className="mt-3 bg-red-50/60 rounded-2xl p-2.5 border border-red-100">
              <p className="text-[11px] font-bold text-red-800 uppercase tracking-wide mb-1">Includes:</p>
              <ul className="text-xs text-gray-700 space-y-0.5 font-medium">
                {deal.items.map(item => (
                  <li key={item.id || item.name} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E31E24]" />
                    <span>{item.name}</span>
                    <span className="font-bold text-red-600">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Price & Action Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-xl font-extrabold text-gray-900">
              {formatPrice(deal.price)}
            </span>
          </div>

          <button
            onClick={handleOpenModal}
            className="bg-gradient-to-r from-[#E31E24] to-[#FF6B35] hover:from-[#D01419] hover:to-[#E85A26] text-white font-bold px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md shadow-red-500/20 text-xs sm:text-sm transition hover:scale-105"
          >
            <Eye className="w-4 h-4 stroke-[2.5]" />
            <span>Select Options</span>
          </button>
        </div>
      </div>
    </div>
  );
};
