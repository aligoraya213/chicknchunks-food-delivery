import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../lib/currency';
import { productImageUrl } from '../lib/productImage';
import { X, Plus, Minus, Flame, ShoppingBag, Check, Package, Sparkles } from 'lucide-react';

export const ItemModal = () => {
  const { selectedItemForModal, setSelectedItemForModal, addToCart, setIsCartOpen } = useApp();

  const [spice, setSpice] = useState('');
  const [selectedAdditions, setSelectedAdditions] = useState([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (selectedItemForModal) {
      setSpice(selectedItemForModal.options?.spiceLevels?.[0] || 'Original');
      setSelectedAdditions([]);
      setQuantity(1);
    }
  }, [selectedItemForModal]);

  if (!selectedItemForModal) return null;

  const item = selectedItemForModal;
  const isDeal = item.isDeal || item.category === 'deals' || (Array.isArray(item.items) && item.items.length > 0);
  const additionsTotal = selectedAdditions.reduce((acc, curr) => acc + curr.price, 0);
  const totalPrice = (item.price + additionsTotal) * quantity;

  const handleToggleAddition = (add) => {
    if (selectedAdditions.some(a => a.name === add.name)) {
      setSelectedAdditions(prev => prev.filter(a => a.name !== add.name));
    } else {
      setSelectedAdditions(prev => [...prev, add]);
    }
  };

  const handleAddToCart = () => {
    addToCart(item, {
      spice,
      additions: selectedAdditions,
      quantity
    });
    setSelectedItemForModal(null);
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in">
      
      {/* Modal Card */}
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl border border-gray-100 flex flex-col relative">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedItemForModal(null)}
          className="absolute top-3 right-3 z-30 bg-white/90 hover:bg-white text-gray-800 w-9 h-9 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition hover:scale-105"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Header Image */}
          <div className="relative h-48 sm:h-56 bg-gray-100">
            <img
              src={productImageUrl(item.image)}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            {item.badge && (
              <span className={`absolute bottom-3 left-4 shadow-lg ${isDeal ? 'bg-gradient-to-r from-[#E31E24] to-[#FF6B35] text-white text-xs font-black uppercase px-3 py-1.5 rounded-full' : 'badge-bestseller'}`}>
                {item.badge}
              </span>
            )}
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6">
            
            {/* Title & Price Header */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E31E24]">
                    {isDeal ? 'Combo Deal Bundle' : item.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight mt-0.5">{item.name}</h2>
                </div>
                <span className="text-2xl font-black text-[#E31E24] shrink-0">{formatPrice(item.price)}</span>
              </div>
              <p className="text-gray-500 text-xs sm:text-sm mt-2 leading-relaxed">
                {item.description || (item.items ? item.items.map(i => `${i.name} x${i.quantity}`).join(', ') : '')}
              </p>
            </div>

            {/* Included Items in Deal */}
            {isDeal && Array.isArray(item.items) && item.items.length > 0 && (
              <div className="space-y-2.5 pt-3 border-t border-gray-100">
                <div className="text-xs font-black uppercase tracking-wider text-[#E31E24] flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#E31E24]" />
                  <span>Items Included in this Deal:</span>
                </div>
                <div className="grid grid-cols-1 gap-2 bg-red-50/60 rounded-2xl p-3.5 border border-red-100">
                  {item.items.map((included, idx) => (
                    <div key={included.id || idx} className="flex items-center justify-between text-xs font-bold text-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#E31E24] text-[10px] font-black text-white shrink-0">
                          {included.quantity || 1}x
                        </span>
                        <span>{included.name}</span>
                      </div>
                      {included.price && <span className="text-gray-400 font-semibold text-[11px]">({formatPrice(included.price)})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Spice Level Section */}
            {item.options?.spiceLevels?.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gray-700">
                  <Flame className="w-4 h-4 text-[#E31E24]" />
                  <span>Select Spice Level:</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {item.options.spiceLevels.map((level) => {
                    const isSelected = spice === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSpice(level)}
                        className={`py-2.5 px-3 rounded-2xl border text-xs font-bold text-center transition ${
                          isSelected
                            ? 'border-[#E31E24] bg-red-50 text-[#E31E24] shadow-sm'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Extra Add-ons Section */}
            {item.options?.additions?.length > 0 && (
              <div className="space-y-2.5 pt-3 border-t border-gray-100">
                <div className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Extra Add-ons:
                </div>
                <div className="space-y-2">
                  {item.options.additions.map((add) => {
                    const isSelected = selectedAdditions.some(a => a.name === add.name);
                    return (
                      <div
                        key={add.name}
                        onClick={() => handleToggleAddition(add)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition text-xs sm:text-sm ${
                          isSelected
                            ? 'border-[#E31E24] bg-red-50/60 text-gray-900 font-bold'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                            isSelected ? 'bg-[#E31E24] border-[#E31E24] text-white' : 'border-gray-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span>{add.name}</span>
                        </div>
                        <span className="font-bold text-gray-500">+{formatPrice(add.price)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Fixed Footer */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 flex items-center gap-3 shrink-0">
          
          {/* Quantity Controls */}
          <div className="flex items-center bg-white border border-gray-200 rounded-2xl p-1 shadow-sm">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 sm:w-9 sm:h-9 text-gray-700 hover:text-[#E31E24] rounded-xl flex items-center justify-center font-bold transition hover:bg-gray-100"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-black text-gray-900 text-sm sm:text-base">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 sm:w-9 sm:h-9 text-gray-700 hover:text-[#E31E24] rounded-xl flex items-center justify-center font-bold transition hover:bg-gray-100"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add To Cart Submit Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 btn-primary py-3.5 text-sm sm:text-base shadow-lg"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{isDeal ? 'Add Deal to Cart' : 'Add to Cart'} • {formatPrice(totalPrice)}</span>
          </button>

        </div>

      </div>

    </div>
  );
};
