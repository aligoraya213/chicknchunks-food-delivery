import React from 'react';
import { useApp } from '../context/AppContext';

export const CategoryBar = () => {
  const { categories, activeCategory, setActiveCategory } = useApp();

  const categoryList = [
    { id: 'all', name: 'All', value: 'all' },
    ...categories.map(c => {
      const val = (c.name || '').toLowerCase();
      let displayName = c.name;
      if (val === 'zinger') displayName = 'Zinger Burgers';
      else if (val === 'wings') displayName = 'Fiery Wings';
      else if (val === 'broast') displayName = 'Crispy Broast';
      else if (val === 'burgers') displayName = 'Burgers';
      else if (val === 'rolls') displayName = 'Twister Rolls';
      else if (val === 'deals') displayName = 'Exclusive Deals';
      else if (val === 'sides') displayName = 'Sides & Fries';
      else if (val === 'drinks') displayName = 'Drinks & Chilled';
      else if (val === 'desserts') displayName = 'Desserts & Sweets';
      else displayName = c.name;

      return {
        id: c.id || c.name,
        name: displayName,
        value: c.name
      };
    })
  ];

  return (
    <div id="menu-heading" className="sticky top-20 z-30 mb-8 w-full border-b border-gray-200/80 bg-white/95 py-3 shadow-sm backdrop-blur-md">
      <div className="app-container">
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar scroll-smooth">
          {categoryList.map((cat) => {
            const isActive =
              activeCategory.toLowerCase() === cat.value.toLowerCase() ||
              activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.value)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold whitespace-nowrap shadow-sm transition-all duration-200 sm:px-5 sm:text-sm ${
                  isActive
                    ? 'scale-105 bg-gradient-to-r from-[#E31E24] to-[#FF6B35] text-white shadow-md shadow-red-500/25'
                    : 'border border-gray-200/60 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
