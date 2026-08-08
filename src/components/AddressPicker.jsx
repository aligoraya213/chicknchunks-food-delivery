import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, Plus, X, Check, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const AddressPicker = ({ selectedAddress, onSelect }) => {
  const { savedAddresses, setSavedAddresses, currentLocation, setCurrentLocation } = useApp();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locating, setLocating] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAddress = (value) => {
    setQuery(value);
    onSelect(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&countrycodes=pk`
        );
        const data = await res.json();
        setSuggestions(data.map((d) => ({
          label: d.display_name,
          lat: d.lat,
          lng: d.lon
        })));
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
      setLoading(false);
    }, 400);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const addr = data.display_name || `${latitude}, ${longitude}`;
          setQuery(addr);
          onSelect(addr, latitude, longitude);
        } catch {
          const addr = `${latitude}, ${longitude}`;
          setQuery(addr);
          onSelect(addr, latitude, longitude);
        }
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const selectSuggestion = (suggestion) => {
    setQuery(suggestion.label);
    setShowSuggestions(false);
    onSelect(suggestion.label, suggestion.lat, suggestion.lng);
  };

  const saveAddress = () => {
    if (!query.trim()) return;
    const newAddr = {
      id: Date.now(),
      label: `Address ${savedAddresses.length + 1}`,
      address: query,
      lat: currentLocation?.lat || null,
      lng: currentLocation?.lng || null
    };
    setSavedAddresses([...savedAddresses, newAddr]);
  };

  const removeAddress = (id) => {
    setSavedAddresses(savedAddresses.filter((a) => a.id !== id));
  };

  const selectSaved = (addr) => {
    setQuery(addr.address);
    onSelect(addr.address, addr.lat, addr.lng);
  };

  return (
    <div ref={wrapperRef} className="space-y-3">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => searchAddress(e.target.value)}
              placeholder="Search for your address..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm font-medium focus:border-[#E31E24] focus:ring-2 focus:ring-red-100"
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />}
          </div>
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={locating}
            className="flex shrink-0 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-[#E31E24] transition hover:bg-red-50 disabled:opacity-50"
          >
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
            <span className="hidden sm:inline">Current</span>
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-20 mt-1 w-full rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectSuggestion(s)}
                className="flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left text-xs transition hover:bg-gray-50"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span className="line-clamp-2 text-gray-700">{s.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {savedAddresses.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Saved Addresses</p>
          {savedAddresses.map((addr) => (
            <div
              key={addr.id}
              className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3 transition ${
                selectedAddress === addr.address
                  ? 'border-[#E31E24] bg-red-50/60'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => selectSaved(addr)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className={`h-4 w-4 shrink-0 ${selectedAddress === addr.address ? 'text-[#E31E24]' : 'text-gray-400'}`} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-700 truncate">{addr.label}</p>
                  <p className="text-[10px] text-gray-500 truncate">{addr.address}</p>
                </div>
              </div>
              {selectedAddress === addr.address && <Check className="h-4 w-4 text-[#E31E24]" />}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeAddress(addr.id); }}
                className="ml-2 rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {query.trim() && (
        <button
          type="button"
          onClick={saveAddress}
          className="flex items-center gap-2 text-xs font-bold text-[#E31E24] transition hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Save this address</span>
        </button>
      )}
    </div>
  );
};

export default AddressPicker;
