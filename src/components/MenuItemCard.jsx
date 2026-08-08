import React from 'react';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../lib/currency';
import { productImageUrl } from '../lib/productImage';
import { Plus, Minus, Star, Flame, ShoppingBag } from 'lucide-react';

export const MenuItemCard = ({ item }) => {
  const { cart, addToCart, updateQuantity, setSelectedItemForModal } = useApp();

  // Find total quantity of this base item currently in cart
  const cartItemsForItem = cart.filter(i => i.id === item.id);
  const totalInCart = cartItemsForItem.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1">
      
      {/* Image & Badges Header */}
      <div
        className="relative cursor-pointer overflow-hidden bg-gray-100 h-52 sm:h-56"
        onClick={() => setSelectedItemForModal(item)}
      >
        <img
          src={productImageUrl(item.image)}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {item.badge && (
            <span className="badge-bestseller shadow">
              {item.badge}
            </span>
          )}
          {item.spiceLevel > 0 && (
            <span className="badge-spicy shadow flex items-center gap-1">
              <Flame className="w-3 h-3 fill-red-600" />
              {'🌶️'.repeat(item.spiceLevel)}
            </span>
          )}
        </div>

        {/* Rating Overlay Pill */}
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span>{item.rating}</span>
          <span className="text-gray-400">({item.reviews})</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1 font-semibold">
            <span className="uppercase tracking-wider text-[#E31E24]">{item.category}</span>
            <span>⏱️ {item.prepTime}</span>
          </div>

          <h3
            className="text-lg font-extrabold text-gray-900 line-clamp-1 cursor-pointer group-hover:text-[#E31E24] transition"
            onClick={() => setSelectedItemForModal(item)}
          >
            {item.name}
          </h3>

          <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Price & Action Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
          
          {/* Pricing */}
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-gray-900">
                {formatPrice(item.price)}
              </span>
              {item.originalPrice && (
                <span className="text-xs text-gray-400 line-through font-semibold">
                  {formatPrice(item.originalPrice)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-gray-400 block">{item.calories}</span>
          </div>

          {/* Quick Add or Quantity Selector */}
          {totalInCart === 0 ? (
            <button
              onClick={() => setSelectedItemForModal(item)}
              className="bg-gradient-to-r from-[#E31E24] to-[#FF6B35] hover:from-[#D01419] hover:to-[#E85A26] text-white font-bold px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md shadow-red-500/20 text-xs sm:text-sm transition hover:scale-105"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add</span>
            </button>
          ) : (
            <div className="flex items-center bg-gray-100 rounded-2xl p-1 border border-gray-200 shadow-inner">
              <button
                onClick={() => {
                  const targetCartItem = cartItemsForItem[cartItemsForItem.length - 1];
                  if (targetCartItem) {
                    updateQuantity(targetCartItem.uniqueCartId, -1);
                  }
                }}
                className="w-7 h-7 bg-white text-gray-700 hover:text-[#E31E24] rounded-xl flex items-center justify-center font-extrabold shadow-sm transition active:scale-95 text-sm"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              
              <span className="w-8 text-center font-extrabold text-gray-900 text-sm">
                {totalInCart}
              </span>

              <button
                onClick={() => {
                  addToCart(item);
                }}
                className="w-7 h-7 bg-[#E31E24] text-white hover:bg-red-700 rounded-xl flex items-center justify-center font-extrabold shadow-sm transition active:scale-95 text-sm"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
