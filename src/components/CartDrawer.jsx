import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../lib/currency';
import { X, Plus, Minus, Trash2, Tag, ArrowRight, ShoppingBag, Truck, AlertCircle } from 'lucide-react';
import { productImageUrl, replaceWithProductFallback } from '../lib/productImage';

export const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    subtotal,
    deliveryFee,
    discountAmount,
    total,
    appliedPromo,
    applyPromo,
    promoError,
    setActiveView
  } = useApp();

  const [promoInput, setPromoInput] = useState('');

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 1000;
  const progressToFreeDel = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);
  const remainingForFreeDel = Math.max(0, freeDeliveryThreshold - subtotal);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoInput) {
      applyPromo(promoInput);
    }
  };

  const totalItemCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 flex w-full max-w-full justify-end pl-4 pr-2 sm:pl-8 sm:pr-4">
        <div className="flex max-h-[100dvh] w-full max-w-[28rem] flex-col overflow-hidden border-l border-gray-100 bg-white shadow-2xl">
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gray-50/80 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E31E24]/10 font-bold text-[#E31E24]">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 sm:text-xl">Your Order Cart</h2>
                <p className="text-xs font-semibold text-gray-500">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-full p-2 text-gray-400 transition hover:bg-gray-200/60 hover:text-gray-700"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          <div className="shrink-0 border-b border-orange-100 bg-gradient-to-r from-red-50 to-orange-50 px-4 py-3 sm:px-6">
            <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-gray-800">
              <span className="flex items-center gap-1">
                <Truck className="h-4 w-4 text-[#E31E24]" />
                {remainingForFreeDel === 0 || appliedPromo?.freeDelivery
                  ? 'FREE Delivery Unlocked!'
                  : `Add ${formatPrice(remainingForFreeDel)} more for FREE Delivery!`}
              </span>
              <span>{Math.round(progressToFreeDel)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#E31E24] to-[#FF6B35] transition-all duration-500"
                style={{ width: `${appliedPromo?.freeDelivery ? 100 : progressToFreeDel}%` }}
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-3.5 p-4 sm:p-6">
            {cart.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Your cart is empty</h3>
                <p className="mx-auto mt-1 max-w-xs text-xs text-gray-500">
                  Add crispy zingers, hot wings, or broast combos to start your order!
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.uniqueCartId} className="flex gap-3.5 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition hover:border-gray-200">
                  <img src={productImageUrl(item.image)} onError={replaceWithProductFallback} alt={item.name} className="h-16 w-16 shrink-0 rounded-xl bg-gray-100 object-cover sm:h-20 sm:w-20" />

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="truncate text-xs font-extrabold text-gray-900 sm:text-sm">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.uniqueCartId)} className="shrink-0 p-0.5 text-gray-400 transition hover:text-red-600">
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>

                      <div className="mt-0.5 space-y-0.5 text-[11px] text-gray-500">
                        <p className="font-semibold text-red-600">🌶️ {item.selectedSpice}</p>
                        {item.selectedAdditions?.length > 0 && (
                          <p className="truncate text-gray-400">+{item.selectedAdditions.map((a) => a.name).join(', ')}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-black text-gray-900 sm:text-sm">{formatPrice(item.unitPrice * item.quantity)}</span>
                      <div className="flex items-center rounded-xl bg-gray-100 p-0.5">
                        <button onClick={() => updateQuantity(item.uniqueCartId, -1)} className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-xs font-bold text-gray-700 shadow-sm transition hover:text-red-600">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-gray-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.uniqueCartId, 1)} className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-xs font-bold text-gray-700 shadow-sm transition hover:text-red-600">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="shrink-0 space-y-3.5 border-t border-gray-200 bg-gray-50 p-4 sm:p-6">
              <form onSubmit={handleApplyPromo} className="flex w-full gap-2">
                <div className="relative min-w-0 flex-1">
                  <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Promo Code (e.g. CHICKN20)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs font-bold uppercase"
                  />
                </div>
                <button type="submit" className="shrink-0 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-black">
                  Apply
                </button>
              </form>

              {appliedPromo && (
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                  <span>🎉 Code <b>{appliedPromo.code}</b> Applied</span>
                </div>
              )}
              {promoError && (
                <div className="flex items-center gap-1 text-xs font-semibold text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{promoError}</span>
                </div>
              )}

              <div className="space-y-1.5 border-t border-gray-200 pt-2 text-xs font-medium text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-gray-900">
                    {deliveryFee === 0 ? <span className="font-black uppercase text-emerald-600">FREE</span> : formatPrice(deliveryFee)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between font-bold text-emerald-600">
                    <span>Voucher Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-black text-gray-900">
                  <span>Total</span>
                  <span className="text-[#E31E24]">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setActiveView('checkout');
                  navigate('/checkout');
                }}
                className="btn-primary w-full py-3.5 text-sm shadow-xl sm:py-4 sm:text-base"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
