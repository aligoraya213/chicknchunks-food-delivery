import React from 'react';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../lib/currency';
import { Flame, Clock, Star, ShieldCheck, Tag, ArrowRight } from 'lucide-react';

export const HeroBanner = () => {
  const { setActiveCategory, applyPromo, setIsCartOpen } = useApp();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#111827] via-[#1E0D10] to-[#2B0E12] text-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 rounded-3xl my-6 mb-10 max-w-7xl mx-auto shadow-2xl border border-red-900/30">
      
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-[#E31E24]/30 to-[#FF6B35]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#E31E24]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Content Column */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          
          {/* Discount Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E31E24]/20 to-[#FF6B35]/20 border border-[#E31E24]/40 px-4 py-1.5 rounded-full text-yellow-400 font-bold text-xs sm:text-sm tracking-wide">
            <Tag className="w-4 h-4 text-yellow-400" />
            SPECIAL OFFER: 20% OFF WITH CODE <span className="underline font-black text-white">CHICKN20</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Crispy. Juicy. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#FF6B35] via-[#FF8C38] to-yellow-400 bg-clip-text text-transparent">
              Hot & Fresh
            </span> to Your Door!
          </h1>

          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Hand-breaded crunchy zinger fillets, fiery spicy wing buckets, and secret-spiced broast fried chicken made fresh per order.
          </p>

          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-1">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border border-white/10">
              <Clock className="w-4 h-4 text-[#FF6B35]" />
              <span>30-40 Min Delivery</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border border-white/10">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>4.9 (2,400+ Reviews)</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Fresh Halal</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={() => {
                setActiveCategory('deals');
                document.getElementById('menu-heading')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-[#E31E24] to-[#FF6B35] hover:from-[#D01419] hover:to-[#E85A26] text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition hover:scale-105 text-sm sm:text-base"
            >
              <Flame className="w-5 h-5 fill-white" />
              <span>Order Best Sellers</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                applyPromo('CHICKN20');
                setIsCartOpen(true);
              }}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-3.5 rounded-2xl transition text-sm flex items-center justify-center gap-2"
            >
              <span>Apply 20% Voucher</span>
            </button>
          </div>

        </div>

        {/* Right Hero Image Card */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="relative group w-full max-w-md">
            {/* Glowing Border Behind Image */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#E31E24] to-[#FF6B35] rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition duration-500" />
            
            <img
              src="/images/hero_zinger_combo.png"
              alt="ChicknChunks Supreme Combo"
              className="relative w-full h-64 sm:h-80 object-cover rounded-3xl shadow-2xl border-2 border-red-500/30 transform group-hover:scale-105 transition duration-500"
            />

            {/* Floating Highlight Card Inside Container */}
            <div className="absolute bottom-3 left-3 bg-white text-gray-900 px-3.5 py-2.5 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-3 animate-pulse-glow z-20">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E31E24] to-[#FF6B35] flex items-center justify-center text-white font-extrabold text-base shadow">
                🔥
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Top Combo</p>
                <p className="text-xs font-extrabold text-gray-900">Zinger Supreme Meal</p>
              </div>
              <span className="text-[#E31E24] font-black text-xs sm:text-sm ml-2">{formatPrice(899)}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
