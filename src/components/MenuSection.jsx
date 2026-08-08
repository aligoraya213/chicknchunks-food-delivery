import React from 'react';
import { useApp } from '../context/AppContext';
import { MenuItemCard } from './MenuItemCard';
import { DealCard } from './DealCard';
import { SearchX } from 'lucide-react';

export const MenuSection = () => {
  const { activeCategory, searchQuery, setSearchQuery, menuItems, categories, deals } = useApp();

  const filteredItems = menuItems.filter((item) => {
    const isVisible = item.isAvailable !== false;
    const itemCat = (item.category || '').toLowerCase();
    const actCat = (activeCategory || '').toLowerCase();

    const matchesCategory = actCat === 'all' || itemCat === actCat || item.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

    return isVisible && matchesCategory && matchesSearch;
  });

  const activeDeals = deals.filter((deal) => {
    const isActive = deal.isActive !== false;
    const actCat = (activeCategory || '').toLowerCase();
    const isDealsCategory = actCat === 'all' || actCat === 'deals';
    const matchesSearch =
      searchQuery.trim() === '' ||
      deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deal.description && deal.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return isActive && isDealsCategory && matchesSearch;
  });

  const activeCatObj = categories.find(c => c.name?.toLowerCase() === activeCategory?.toLowerCase() || c.id === activeCategory);
  const categoryDisplayName = activeCategory === 'all' ? 'Full Menu' : (activeCatObj?.name || activeCategory);
  const totalCount = filteredItems.length + (activeCategory === 'deals' || activeCategory === 'all' ? activeDeals.length : 0);

  return (
    <section id="menu-heading" className="mx-auto mb-16 max-w-7xl overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black text-gray-900 sm:text-3xl capitalize">
            <span>{categoryDisplayName}</span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-400">{totalCount} items</span>
          </h2>
          <p className="mt-1 text-sm text-gray-500">Made fresh to order with our signature 11-spice red crunchy coating.</p>
        </div>
      </div>

      {totalCount > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {activeDeals.map((deal) => (
            <DealCard key={`deal-${deal.id}`} deal={deal} />
          ))}
          {filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="mx-auto my-8 max-w-md rounded-3xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[#E31E24]">
            <SearchX className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-extrabold text-gray-900">No items found</h3>
          <p className="mt-1 mb-6 px-4 text-sm text-gray-500">We couldn't find anything matching "{searchQuery}". Try searching for Zinger, Wings, or Broast!</p>
          <button onClick={() => setSearchQuery('')} className="btn-secondary text-xs">Clear Search</button>
        </div>
      )}
    </section>
  );
};
