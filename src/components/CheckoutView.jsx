import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../lib/currency';
import AddressPicker from './AddressPicker';
import { RestoreHistoryModal } from './RestoreHistoryModal';
import confetti from 'canvas-confetti';
import { ArrowLeft, MapPin, CreditCard, Banknote, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { productImageUrl, replaceWithProductFallback } from '../lib/productImage';

export const CheckoutView = () => {
  const navigate = useNavigate();
  const {
    cart,
    subtotal,
    deliveryFee,
    discountAmount,
    total,
    user,
    setUser,
    placeOrder,
    setActiveView,
    checkGuestHistory,
    restoreGuestHistory,
    setCheckoutToast
  } = useApp();

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerPhone: user?.phone || '',
    address: user?.address || '',
    deliveryNotes: '',
    paymentMethod: 'cod',
    cardNumber: '4532 •••• •••• 8892',
    cardExpiry: '08/28',
    cardCvv: '***'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [historyInfo, setHistoryInfo] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isRestoringHistory, setIsRestoringHistory] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneBlur = async () => {
    const phone = (formData.customerPhone || '').trim();
    if (phone.length >= 7 && !user) {
      const res = await checkGuestHistory(phone);
      if (res?.hasHistory) {
        setHistoryInfo(res);
        setIsHistoryModalOpen(true);
      }
    }
  };

  const handleRestoreHistory = async () => {
    if (!historyInfo?.phone) return;
    setIsRestoringHistory(true);
    const ok = await restoreGuestHistory(historyInfo.phone);
    setIsRestoringHistory(false);
    setIsHistoryModalOpen(false);
    if (ok && setCheckoutToast) {
      setCheckoutToast('Previous order history restored to this device!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOrderError('');
    setIsSubmitting(true);

    try {
      setUser(prev => ({
        ...(prev || {}),
        name: formData.customerName,
        phone: formData.customerPhone,
        address: formData.address
      }));

      const res = await placeOrder(formData);

      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.log(err);
      }

      if (res?.order?.orderId) {
        navigate(`/tracking/${res.order.orderId}`);
      } else {
        navigate('/orders');
      }
    } catch (err) {
      setOrderError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalItemCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="app-container mb-16 animate-fade-in overflow-x-hidden py-8">
      <div className="mb-8 flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => { setActiveView('menu'); navigate('/'); }}
          className="flex items-center gap-2 text-xs font-bold text-gray-600 transition hover:text-[#E31E24] sm:text-sm"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Back to Menu</span>
        </button>

        <h1 className="text-xl font-black text-gray-900 sm:text-3xl">Checkout & Delivery</h1>

        <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="min-w-0 space-y-6 lg:col-span-7">
          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-md sm:p-8">
            <h2 className="mb-6 flex items-center gap-2 text-base font-black text-gray-900 sm:text-lg">
              <MapPin className="h-5 w-5 text-[#E31E24]" />
              <span>1. Delivery Address</span>
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700">Full Name</label>
                <input type="text" name="customerName" required value={formData.customerName} onChange={handleChange} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-xs font-medium focus:border-[#E31E24] focus:ring-2 focus:ring-red-100 sm:text-sm" />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700">Phone Number</label>
                <input
                  type="text"
                  name="customerPhone"
                  required
                  value={formData.customerPhone}
                  onChange={handleChange}
                  onBlur={handlePhoneBlur}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-xs font-medium focus:border-[#E31E24] focus:ring-2 focus:ring-red-100 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold text-gray-700">Delivery Address</label>
                <AddressPicker
                  selectedAddress={formData.address}
                  onSelect={(address) => setFormData(prev => ({ ...prev, address }))}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold text-gray-700">Delivery Instructions</label>
                <textarea name="deliveryNotes" rows="2" value={formData.deliveryNotes} onChange={handleChange} placeholder="Gate code, apartment floor, leave at door..." className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-xs font-medium focus:border-[#E31E24] focus:ring-2 focus:ring-red-100 sm:text-sm" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-md sm:p-8">
            <h2 className="mb-6 flex items-center gap-2 text-base font-black text-gray-900 sm:text-lg">
              <CreditCard className="h-5 w-5 text-[#E31E24]" />
              <span>2. Payment Method</span>
            </h2>

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cod' }))} className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${formData.paymentMethod === 'cod' ? 'border-[#E31E24] bg-red-50/60 font-bold text-[#E31E24]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                <Banknote className="h-6 w-6" />
                <span className="text-xs">Cash on Delivery</span>
              </button>

              <button type="button" onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))} className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${formData.paymentMethod === 'card' ? 'border-[#E31E24] bg-red-50/60 font-bold text-[#E31E24]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                <CreditCard className="h-6 w-6" />
                <span className="text-xs">Credit / Debit Card</span>
              </button>

              <button type="button" onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'wallet' }))} className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${formData.paymentMethod === 'wallet' ? 'border-[#E31E24] bg-red-50/60 font-bold text-[#E31E24]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                <span className="text-lg">📲</span>
                <span className="text-xs">Apple / Google Pay</span>
              </button>
            </div>

            {formData.paymentMethod === 'card' && (
              <div className="animate-fade-in space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-600">Card Number</label>
                  <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-mono sm:text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-600">Expiry Date</label>
                    <input type="text" name="cardExpiry" value={formData.cardExpiry} onChange={handleChange} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-mono sm:text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-gray-600">CVV</label>
                    <input type="password" name="cardCvv" value={formData.cardCvv} onChange={handleChange} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-mono sm:text-sm" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 lg:col-span-5">
          <div className="sticky top-28 space-y-6 overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-md sm:p-8">
            <h2 className="flex items-center justify-between border-b border-gray-100 pb-4 text-base font-black text-gray-900 sm:text-lg">
              <span>Order Summary</span>
              <span className="text-xs font-semibold text-gray-400">{totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}</span>
            </h2>

            <div className="max-h-60 space-y-3 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.uniqueCartId} className="flex items-center justify-between text-xs">
                  <div className="flex min-w-0 items-center gap-2">
                    <img src={productImageUrl(item.image)} onError={replaceWithProductFallback} alt="" className="h-9 w-9 shrink-0 rounded-lg bg-gray-100 object-cover" />
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#E31E24]/10 font-black text-[#E31E24]">{item.quantity}x</span>
                    <div className="min-w-0">
                      <span className="block truncate font-extrabold text-gray-800">{item.name}</span>
                      <span className="block text-[10px] text-gray-400">🌶️ {item.selectedSpice}</span>
                    </div>
                  </div>
                  <span className="ml-2 shrink-0 font-bold text-gray-900">{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-4 text-xs font-medium text-gray-600 sm:text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-gray-900">{deliveryFee === 0 ? <span className="font-black text-emerald-600">FREE</span> : formatPrice(deliveryFee)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between font-bold text-emerald-600">
                  <span>Voucher Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-black text-gray-900 sm:text-xl">
                <span>Total Amount</span>
                <span className="text-[#E31E24]">{formatPrice(total)}</span>
              </div>
            </div>

            {orderError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
                {orderError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="btn-primary w-full py-3.5 text-sm shadow-2xl transition hover:scale-105 sm:py-4 sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>{isSubmitting ? 'Creating Your Order...' : `Place Order Now • ${formatPrice(total)}`}</span>
            </button>

            <p className="text-center text-[11px] text-gray-400">By placing your order, you agree to ChicknChunks terms of service and instant hot delivery guarantee.</p>
          </div>
        </div>
      </form>

      <RestoreHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onRestore={handleRestoreHistory}
        historyInfo={historyInfo}
        isRestoring={isRestoringHistory}
      />
    </div>
  );
};
