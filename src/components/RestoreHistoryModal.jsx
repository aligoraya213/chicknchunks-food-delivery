import React from 'react';
import { Package, X, RotateCcw, ShieldCheck } from 'lucide-react';

export const RestoreHistoryModal = ({ isOpen, onClose, onRestore, historyInfo, isRestoring }) => {
  if (!isOpen || !historyInfo) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900">Previous Orders Found!</h3>
            <p className="text-xs text-gray-500 font-medium">Associated with {historyInfo.phone}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 space-y-2 text-xs">
          <p className="font-bold text-amber-900">
            We found <span className="font-black text-[#E31E24]">{historyInfo.orderCount}</span> previous guest {historyInfo.orderCount === 1 ? 'order' : 'orders'} {historyInfo.customerName ? `for "${historyInfo.customerName}"` : ''}.
          </p>
          <p className="text-amber-800 leading-relaxed">
            Would you like to restore and link your previous order history to this device?
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Your order history will be securely linked to this browser.</span>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-gray-200 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isRestoring}
            onClick={onRestore}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#E31E24] to-[#FF6B35] py-3 text-xs font-bold text-white shadow-lg shadow-red-500/25 hover:from-red-700 hover:to-orange-600 transition disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{isRestoring ? 'Restoring...' : 'Restore History'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
