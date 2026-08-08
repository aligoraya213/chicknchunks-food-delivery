import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import AddressPicker from './AddressPicker';
import { X, MapPin, Check } from 'lucide-react';

export const AddressModal = ({ isOpen, onClose }) => {
  const { user, changeAddress } = useApp();
  const [selectedAddress, setSelectedAddress] = useState(user?.address || '');

  if (!isOpen) return null;

  const handleSave = () => {
    if (selectedAddress) {
      changeAddress(selectedAddress);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative space-y-4">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#E31E24] flex items-center justify-center font-bold shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">Select Delivery Location</h3>
            <p className="text-xs text-gray-500">Search address or pick from location suggestions.</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
            Search or Type Address
          </label>
          <AddressPicker
            value={selectedAddress}
            onSelect={(val) => setSelectedAddress(val)}
          />
        </div>

        {user?.address && (
          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 text-xs">
            <span className="font-bold text-gray-700 block mb-0.5">Current Saved Location:</span>
            <span className="text-gray-600 truncate block">{user.address}</span>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-gray-200 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-2xl bg-[#E31E24] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-red-700 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Update Location</span>
          </button>
        </div>

      </div>
    </div>
  );
};
