import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../lib/currency';
import { AdminLogin } from './AdminLogin';
import {
  LayoutDashboard,
  ShoppingBag,
  DollarSign,
  Clock,
  TrendingUp,
  Package,
  Flame,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  LogOut,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Download,
  Percent,
  Save,
  Image,
  X,
  Plus,
  Minus,
  Eye,
  Bike,
  Key,
  User,
  UserCheck,
  ShieldCheck
} from 'lucide-react';

const statusOptions = [
  { value: 'placed', label: 'Order Placed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'on_way', label: 'On the Way' },
  { value: 'delivered', label: 'Delivered' }
];

const paymentStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' }
];

const paymentMethodLabels = {
  cod: 'Cash on Delivery',
  online: 'Online',
  bank_transfer: 'Bank Transfer',
  jazzcash: 'JazzCash',
  easypaisa: 'Easypaisa',
  card: 'Card'
};

export const AdminDashboard = ({ initialTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromPath = () => {
    const path = location.pathname.replace(/\/$/, '');
    if (path.endsWith('/orders')) return 'orders';
    if (path.endsWith('/menu')) return 'menu';
    if (path.endsWith('/deals')) return 'deals';
    if (path.endsWith('/inventory')) return 'inventory';
    if (path.endsWith('/staff')) return 'staff';
    if (path.endsWith('/riders')) return 'riders';
    if (path.endsWith('/settings') || path.endsWith('/promos')) return 'promos';
    return initialTab || 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState(getTabFromPath);

  useEffect(() => {
    setActiveTabState(getTabFromPath());
  }, [location.pathname]);

  const setActiveTab = (tabId) => {
    setActiveTabState(tabId);
    if (tabId === 'dashboard') navigate('/admin');
    else navigate(`/admin/${tabId}`);
  };

  const {
    isAdminLoggedIn,
    adminLogout,
    staffLogout,
    allOrders,
    updateOrderStatus,
    updatePaymentStatus,
    menuItems,
    addMenuItem,
    editMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
    promos,
    addOrUpdatePromo,
    togglePromoActive,
    staffMembers,
    riders,
    addRider,
    editRider,
    deleteRider,
    toggleRiderStatus,
    resetRiderPassword,
    updateRiderProfile,
    assignRiderToOrder,
    inventoryItems,
    refreshData,
    fetchOrders,
    addStaffMember,
    editStaffMember,
    deleteStaffMember,
    addInventoryItem,
    editInventoryItem,
    deleteInventoryItem,
    stockTransactions,
    recordStockTransaction,
    exportInventoryCSV,
    setActiveView,
    setActiveChatOrderId,
    activeChatOrderId,
    newOrderAlert,
    markNotificationsRead,
    // Categories & Deals
    categories,
    deals,
    addCategory,
    editCategory,
    deleteCategory,
    addDeal,
    editDeal,
    deleteDeal,
  } = useApp();

  useEffect(() => {
    if (isAdminLoggedIn) {
      refreshData();
    }
  }, [isAdminLoggedIn]);
  const [menuForm, setMenuForm] = useState({
    name: '',
    category: categories[0]?.name || 'zinger',
    price: '',
    description: '',
    image: '',
    imageFile: null,
    imagePreview: null,
    spiceLevel: '1',
    badge: '',
    isAvailable: true
  });
  const [editingItemId, setEditingItemId] = useState(null);
  const [dealForm, setDealForm] = useState({
    name: '',
    description: '',
    price: '',
    imageFile: null,
    imagePreview: null,
    isActive: true,
    selectedItems: []
  });
  const [editingDealId, setEditingDealId] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryFormName, setCategoryFormName] = useState('');
  const [promoForm, setPromoForm] = useState({ code: '', discountPercent: '', discountFlat: '', freeDelivery: false, isActive: true });
  
  // Non-rider Staff Management state
  const [staffForm, setStaffForm] = useState({ name: '', role: 'Chef', department: 'Kitchen', phone: '', address: '', cnic: '', status: 'active', notes: '' });
  const [editingStaffId, setEditingStaffId] = useState(null);

  // Dedicated Rider Management state
  const [riderForm, setRiderForm] = useState({
    name: '', phone: '', email: '', password: '', address: '', vehicleType: 'Motorcycle', vehicleNumber: '', licenseNumber: '', assignedArea: 'Gulberg', availabilityStatus: 'on_duty', isActive: true, notes: ''
  });
  const [editingRiderId, setEditingRiderId] = useState(null);
  const [resetRiderPasswordModal, setResetRiderPasswordModal] = useState(null);
  const [newRiderPasswordInput, setNewRiderPasswordInput] = useState('');

  const [inventoryForm, setInventoryForm] = useState({ name: '', category: 'ingredients', stockCount: 0, restockThreshold: 10, unit: 'pcs', cost: 0.0, sku: '', barcode: '', isActive: true });
  const [editingInventoryId, setEditingInventoryId] = useState(null);

  const stats = useMemo(() => {
    const totalRevenue = allOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
    const pendingOrders = allOrders.filter((order) => order.status === 'placed' || order.status === 'preparing');
    const bestSeller = menuItems.find((item) => item.badge === 'Best Seller' || item.popular) || menuItems[0];

    return { totalRevenue, pendingOrders: pendingOrders.length, bestSeller };
  }, [allOrders, menuItems]);

  const resetMenuForm = () => {
    setMenuForm({ name: '', category: categories[0]?.name || 'zinger', price: '', description: '', image: '', imageFile: null, imagePreview: null, spiceLevel: '1', badge: '', isAvailable: true });
    setEditingItemId(null);
  };

  const handleMenuSubmit = async (event) => {
    event.preventDefault();

    if (!menuForm.name.trim() || !menuForm.description.trim() || !menuForm.price) return;

    const hasFile = menuForm.imageFile instanceof File;

    if (hasFile) {
      // Use FormData when a file is selected
      const fd = new FormData();
      fd.append('name', menuForm.name.trim());
      fd.append('category', menuForm.category);
      fd.append('price', menuForm.price);
      fd.append('description', menuForm.description.trim());
      fd.append('spiceLevel', menuForm.spiceLevel || '1');
      fd.append('badge', menuForm.badge.trim() || '');
      fd.append('isAvailable', menuForm.isAvailable ? '1' : '0');
      fd.append('popular', menuForm.badge.toLowerCase().includes('best') ? '1' : '0');
      fd.append('image', menuForm.imageFile);

      if (editingItemId) {
        fd.append('id', editingItemId);
        await editMenuItem(fd);
      } else {
        await addMenuItem(fd);
      }
    } else {
      // Use JSON when no file (backward compatible)
      const itemPayload = {
        name: menuForm.name.trim(),
        category: menuForm.category,
        price: menuForm.price,
        description: menuForm.description.trim(),
        image: menuForm.image.trim() || '/images/hero_zinger_combo.png',
        spiceLevel: Number(menuForm.spiceLevel) || 1,
        badge: menuForm.badge.trim(),
        isAvailable: menuForm.isAvailable,
        popular: menuForm.badge.toLowerCase().includes('best')
      };

      if (editingItemId) {
        await editMenuItem({ ...itemPayload, id: editingItemId });
      } else {
        await addMenuItem(itemPayload);
      }
    }

    resetMenuForm();
  };

  const startEdit = (item) => {
    setEditingItemId(item.id);
    setMenuForm({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      description: item.description,
      image: item.image,
      imageFile: null,
      imagePreview: null,
      spiceLevel: String(item.spiceLevel || 1),
      badge: item.badge || '',
      isAvailable: item.isAvailable !== false
    });
    setActiveTab('menu');
  };

  // ── Deal Form Handlers ────────────────────────────────────────────
  const resetDealForm = () => {
    setDealForm({ name: '', description: '', price: '', imageFile: null, imagePreview: null, isActive: true, selectedItems: [] });
    setEditingDealId(null);
  };

  const handleDealSubmit = async (event) => {
    event.preventDefault();
    if (!dealForm.name.trim() || !dealForm.price || dealForm.selectedItems.length === 0) return;

    const fd = new FormData();
    fd.append('name', dealForm.name.trim());
    fd.append('description', dealForm.description.trim());
    fd.append('price', dealForm.price);
    fd.append('is_active', dealForm.isActive ? '1' : '0');
    if (dealForm.imageFile instanceof File) {
      fd.append('image', dealForm.imageFile);
    }
    dealForm.selectedItems.forEach((item, idx) => {
      fd.append(`items[${idx}][menu_item_id]`, item.id);
      fd.append(`items[${idx}][quantity]`, item.quantity || 1);
    });

    if (editingDealId) {
      await editDeal(editingDealId, fd);
    } else {
      await addDeal(fd);
    }

    resetDealForm();
  };

  const startDealEdit = (deal) => {
    setEditingDealId(deal.id);
    setDealForm({
      name: deal.name,
      description: deal.description || '',
      price: deal.price.toString(),
      imageFile: null,
      imagePreview: null,
      isActive: deal.isActive !== false,
      selectedItems: deal.items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity }))
    });
    setActiveTab('deals');
  };

  const toggleDealItemSelection = (menuItem) => {
    setDealForm(prev => {
      const exists = prev.selectedItems.find(i => i.id === menuItem.id);
      if (exists) {
        return { ...prev, selectedItems: prev.selectedItems.filter(i => i.id !== menuItem.id) };
      }
      return { ...prev, selectedItems: [...prev.selectedItems, { id: menuItem.id, name: menuItem.name, quantity: 1 }] };
    });
  };

  const updateDealItemQuantity = (itemId, delta) => {
    setDealForm(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.map(i =>
        i.id === itemId ? { ...i, quantity: Math.max(1, (i.quantity || 1) + delta) } : i
      )
    }));
  };

  // ── Category Modal ────────────────────────────────────────────────
  const openCategoryModal = (category = null) => {
    setEditingCategoryId(category?.id || null);
    setCategoryFormName(category?.name || '');
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    if (!categoryFormName.trim()) return;

    if (editingCategoryId) {
      await editCategory(editingCategoryId, categoryFormName.trim());
    } else {
      const saved = await addCategory(categoryFormName.trim());
      if (saved) {
        setMenuForm(prev => ({ ...prev, category: saved.name }));
      }
    }

    setCategoryModalOpen(false);
    setCategoryFormName('');
    setEditingCategoryId(null);
  };

  const handleDeleteCategory = async (category) => {
    if (window.confirm(`Delete category "${category.name}"? This cannot be undone if no items use it.`)) {
      const success = await deleteCategory(category.id);
      if (!success) {
        alert(`Cannot delete "${category.name}" — it is still used by some menu items.`);
      }
    }
  };

  const handlePromoSubmit = (event) => {
    event.preventDefault();
    const code = promoForm.code.trim().toUpperCase();
    if (!code) return;
    addOrUpdatePromo({
      code,
      discountPercent: promoForm.discountPercent ? Number(promoForm.discountPercent) : 0,
      discountFlat: promoForm.discountFlat ? Number(promoForm.discountFlat) : 0,
      freeDelivery: promoForm.freeDelivery,
      isActive: promoForm.isActive
    });
    setPromoForm({ code: '', discountPercent: '', discountFlat: '', freeDelivery: false, isActive: true });
  };

  const resetStaffForm = () => {
    setStaffForm({ name: '', role: 'Chef', department: 'Kitchen', phone: '', address: '', cnic: '', status: 'active', notes: '' });
    setEditingStaffId(null);
  };

  const handleStaffSubmit = (event) => {
    event.preventDefault();
    if (!staffForm.name.trim()) return;

    const staffPayload = {
      name: staffForm.name.trim(),
      role: staffForm.role,
      department: staffForm.department.trim(),
      phone: staffForm.phone.trim(),
      address: staffForm.address.trim(),
      cnic: staffForm.cnic.trim(),
      status: staffForm.status,
      notes: staffForm.notes.trim()
    };

    if (editingStaffId) {
      editStaffMember({ ...staffPayload, id: editingStaffId });
    } else {
      addStaffMember(staffPayload);
    }

    resetStaffForm();
  };

  const startStaffEdit = (member) => {
    setEditingStaffId(member.id);
    setStaffForm({
      name: member.name,
      role: member.role,
      department: member.department || member.assignedSection || 'Kitchen',
      phone: member.phone || '',
      address: member.address || '',
      cnic: member.cnic || '',
      status: member.status || 'active',
      notes: member.notes || ''
    });
    setActiveTab('staff');
  };

  // ── Dedicated Rider Form Handlers ─────────────────────────────────
  const resetRiderForm = () => {
    setRiderForm({
      name: '', phone: '', email: '', password: '', address: '', vehicleType: 'Motorcycle', vehicleNumber: '', licenseNumber: '', assignedArea: 'Gulberg', availabilityStatus: 'on_duty', isActive: true, notes: ''
    });
    setEditingRiderId(null);
  };

  const handleRiderSubmit = async (event) => {
    event.preventDefault();
    if (!riderForm.name.trim() || !riderForm.email.trim()) return;

    const riderPayload = {
      name: riderForm.name.trim(),
      email: riderForm.email.trim(),
      phone: riderForm.phone.trim(),
      address: riderForm.address.trim(),
      vehicleType: riderForm.vehicleType,
      vehicleNumber: riderForm.vehicleNumber.trim(),
      licenseNumber: riderForm.licenseNumber.trim(),
      assignedArea: riderForm.assignedArea.trim(),
      availabilityStatus: riderForm.availabilityStatus,
      isActive: riderForm.isActive,
      notes: riderForm.notes.trim()
    };

    if (riderForm.password) {
      riderPayload.password = riderForm.password;
    }

    try {
      if (editingRiderId) {
        await editRider(editingRiderId, riderPayload);
      } else {
        if (!riderForm.password) {
          alert('Password is required for new Rider accounts!');
          return;
        }
        await addRider(riderPayload);
      }
      resetRiderForm();
    } catch (err) {
      alert('Failed to save rider: ' + (err.message || 'Check fields'));
    }
  };

  const startRiderEdit = (rider) => {
    setEditingRiderId(rider.id);
    setRiderForm({
      name: rider.name || '',
      email: rider.email || '',
      phone: rider.phone || '',
      password: '',
      address: rider.address || '',
      vehicleType: rider.vehicleType || 'Motorcycle',
      vehicleNumber: rider.vehicleNumber || '',
      licenseNumber: rider.licenseNumber || '',
      assignedArea: rider.assignedArea || 'Gulberg',
      availabilityStatus: rider.availabilityStatus || 'on_duty',
      isActive: rider.isActive !== false,
      notes: rider.notes || ''
    });
    setActiveTab('riders');
  };

  const handleResetRiderPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetRiderPasswordModal || !newRiderPasswordInput) return;
    const ok = await resetRiderPassword(resetRiderPasswordModal.id, newRiderPasswordInput);
    if (ok) {
      alert(`Password updated successfully for Rider ${resetRiderPasswordModal.name}!`);
      setResetRiderPasswordModal(null);
      setNewRiderPasswordInput('');
    } else {
      alert('Failed to reset password.');
    }
  };

  const resetInventoryForm = () => {
    setInventoryForm({ name: '', category: 'ingredients', stockCount: 0, restockThreshold: 10, unit: 'pcs', cost: 0.0, sku: '', barcode: '', isActive: true });
    setEditingInventoryId(null);
  };

  const handleInventorySubmit = (event) => {
    event.preventDefault();
    if (!inventoryForm.name.trim()) return;

    const inventoryPayload = {
      name: inventoryForm.name.trim(),
      category: inventoryForm.category,
      stockCount: Number(inventoryForm.stockCount),
      restockThreshold: Number(inventoryForm.restockThreshold),
      unit: inventoryForm.unit.trim(),
      cost: Number(inventoryForm.cost),
      sku: inventoryForm.sku.trim(),
      barcode: inventoryForm.barcode.trim(),
      isActive: inventoryForm.isActive
    };

    if (editingInventoryId) {
      editInventoryItem({ ...inventoryPayload, id: editingInventoryId });
    } else {
      addInventoryItem(inventoryPayload);
    }

    resetInventoryForm();
  };

  const startInventoryEdit = (item) => {
    setEditingInventoryId(item.id);
    setInventoryForm({
      name: item.name,
      category: item.category || 'ingredients',
      stockCount: item.stockCount ?? item.stock_count ?? 0,
      restockThreshold: item.restockThreshold ?? item.restock_threshold ?? 10,
      unit: item.unit || 'pcs',
      cost: item.cost ?? 0,
      sku: item.sku || '',
      barcode: item.barcode || '',
      isActive: item.isActive ?? item.is_active ?? true
    });
    setActiveTab('inventory');
  };

  if (!isAdminLoggedIn) {
    return <AdminLogin />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'menu', label: 'Menu', icon: Package },
    { id: 'deals', label: 'Deals', icon: Percent },
    { id: 'staff', label: 'Staff Management', icon: UserCheck },
    { id: 'riders', label: 'Rider Management', icon: Bike },
    { id: 'inventory', label: 'Inventory', icon: TrendingUp },
    { id: 'promos', label: 'Promos', icon: Sparkles }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      <div className="app-container py-6 sm:py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-72 shrink-0 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E31E24] to-[#FF6B35] text-white shadow-lg">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Management</p>
                <h2 className="text-lg font-black text-gray-900">ChicknChunks</h2>
              </div>
            </div>

            <nav className="mt-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); if (item.id === 'orders') markNotificationsRead(); }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition ${active ? 'bg-[#E31E24] text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <div className="relative">
                      <Icon className="h-4 w-4" />
                      {item.id === 'orders' && newOrderAlert && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
                        </span>
                      )}
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <button
              onClick={() => { adminLogout(); navigate('/'); }}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </aside>

          <main className="flex-1 min-w-0 space-y-6">
            {newOrderAlert && (
              <div className="animate-fade-in rounded-3xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-3 w-3">
                      <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
                    </span>
                    <p className="text-sm font-bold text-red-800">New order received!</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setActiveTab('orders')} className="rounded-xl bg-[#E31E24] px-3 py-1.5 text-xs font-bold text-white">View Orders</button>
                    <button onClick={markNotificationsRead} className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600">Dismiss</button>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E31E24]">Restaurant Control Center</p>
                  <h1 className="mt-2 text-2xl font-black text-gray-900">Dashboard Overview</h1>
                  <p className="mt-2 text-sm text-gray-500">Track orders, revenue, and stock without leaving the kitchen.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Revenue</p>
                        <p className="text-xl font-black text-gray-900">{formatPrice(stats.totalRevenue)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Orders</p>
                        <p className="text-xl font-black text-gray-900">{allOrders.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Pending</p>
                        <p className="text-xl font-black text-gray-900">{stats.pendingOrders}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-[#E31E24]">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Best Seller</p>
                        <p className="truncate text-sm font-black text-gray-900">{stats.bestSeller?.name || 'No data'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-black text-gray-900">Recent Orders</h2>
                    <button onClick={() => setActiveTab('orders')} className="text-sm font-semibold text-[#E31E24]">View all</button>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                          <th className="px-3 py-3">Order</th>
                          <th className="px-3 py-3">Customer</th>
                          <th className="px-3 py-3">Total</th>
                          <th className="px-3 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allOrders.slice(0, 5).map((order) => (
                          <tr key={order.orderId} className="border-b border-gray-50">
                            <td className="px-3 py-3 font-semibold text-gray-900">{order.orderId}</td>
                            <td className="px-3 py-3">
                              <div className="font-semibold text-gray-900">{order.customerName}</div>
                              <div className="text-xs text-gray-500">{order.address}</div>
                            </td>
<td className="px-3 py-3 font-semibold text-gray-900">{formatPrice(Number(order.total))}</td>
                            <td className="px-3 py-3">
                              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase text-amber-700">{order.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">Orders Management</h2>
                    <p className="text-sm text-gray-500">Update fulfillment states and keep the tracking page in sync.</p>
                  </div>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                        <th className="px-3 py-3">Customer</th>
                        <th className="px-3 py-3">Phone</th>
                        <th className="px-3 py-3">Address</th>
                        <th className="px-3 py-3">Items</th>
                        <th className="px-3 py-3">Total</th>
                        <th className="px-3 py-3">Payment</th>
                        <th className="px-3 py-3">Assign Rider</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Chat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allOrders.map((order) => (
                        <tr key={order.orderId} className="border-b border-gray-50 align-top">
                          <td className="px-3 py-3">
                            <div className="font-semibold text-gray-900">{order.customerName}</div>
                            <div className="text-xs text-gray-500">{order.orderId}</div>
                          </td>
                          <td className="px-3 py-3 text-gray-600">{order.customerPhone || '—'}</td>
                          <td className="px-3 py-3 text-gray-600">{order.address}</td>
                          <td className="px-3 py-3 text-gray-600">{order.items?.map((item) => `${item.name} x${item.quantity}`).join(', ')}</td>
                          <td className="px-3 py-3 font-semibold text-gray-900">{formatPrice(Number(order.total))}</td>
                          <td className="px-3 py-3 text-gray-600">
                            <div className="text-sm font-bold">{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</div>
                            <select
                              value={order.paymentStatus || 'pending'}
                              onChange={(event) => updatePaymentStatus(order.orderId, event.target.value)}
                              className="mt-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold uppercase text-gray-500"
                            >
                              {paymentStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-3">
                            <select
                              value={order.rider?.id || ''}
                              onChange={(event) => {
                                const selectedVal = event.target.value;
                                assignRiderToOrder(order.orderId || order.id, selectedVal);
                              }}
                              className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:border-[#E31E24]"
                            >
                              <option value="">-- Unassigned --</option>
                              {riders.map(r => {
                                const isCurrent = Number(order.rider?.id) === Number(r.id);
                                const statusLabel = r.availabilityStatus || r.availability_status || 'available';
                                return (
                                  <option key={r.id} value={r.id}>
                                    {isCurrent ? '✓ ' : '🛵 '} {r.name} ({isCurrent ? 'Assigned' : statusLabel})
                                  </option>
                                );
                              })}
                            </select>
                            {order.rider ? (
                              <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                <span className="truncate">{order.rider.name}</span>
                              </div>
                            ) : (
                              <div className="mt-1 text-[10px] font-bold text-amber-600">
                                ⚠️ Waiting for Rider
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <select
                              value={order.status}
                              onChange={(event) => updateOrderStatus(order.orderId, event.target.value)}
                              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700"
                            >
                              {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  const isCurrent = activeChatOrderId?.orderId === order.orderId && activeChatOrderId?.channel === 'customer_admin';
                                  setActiveChatOrderId(isCurrent ? null : { orderId: order.orderId, channel: 'customer_admin' });
                                }}
                                className={`rounded-xl border p-2 text-xs font-bold transition flex items-center gap-1 ${
                                  activeChatOrderId?.orderId === order.orderId && activeChatOrderId?.channel === 'customer_admin'
                                    ? 'border-[#E31E24] bg-red-50 text-[#E31E24]'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                                title="Chat with Customer"
                              >
                                <User className="h-3.5 w-3.5 text-[#E31E24]" />
                              </button>

                              {order.rider && (
                                <button
                                  onClick={() => {
                                    const isCurrent = activeChatOrderId?.orderId === order.orderId && activeChatOrderId?.channel === 'admin_rider';
                                    setActiveChatOrderId(isCurrent ? null : { orderId: order.orderId, channel: 'admin_rider' });
                                  }}
                                  className={`rounded-xl border p-2 text-xs font-bold transition flex items-center gap-1 ${
                                    activeChatOrderId?.orderId === order.orderId && activeChatOrderId?.channel === 'admin_rider'
                                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                  }`}
                                  title="Chat with Rider"
                                >
                                  <Bike className="h-3.5 w-3.5 text-blue-600" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'menu' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-gray-900">Menu Management</h2>
                      <p className="text-sm text-gray-500">Add, edit, and hide items from the customer storefront.</p>
                    </div>
                  </div>

                  <form onSubmit={handleMenuSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
                    <input required value={menuForm.name} onChange={(event) => setMenuForm((prev) => ({ ...prev, name: event.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Item Name" />
                    <div className="flex gap-2">
                      <select value={menuForm.category} onChange={(event) => setMenuForm((prev) => ({ ...prev, category: event.target.value }))} className="flex-1 rounded-2xl border border-gray-200 px-3 py-3 text-sm">
                        {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                      </select>
                      <button type="button" onClick={() => openCategoryModal()} className="shrink-0 rounded-2xl bg-emerald-50 px-3 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-100" title="Add new category">
                        <Plus className="h-5 w-5" />
                      </button>
                      <button type="button" onClick={() => openCategoryModal(categories.find(c => c.name === menuForm.category))} className="shrink-0 rounded-2xl bg-blue-50 px-3 py-3 text-sm font-bold text-blue-600 hover:bg-blue-100" title="Edit category">
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                    <input required type="number" step="0.01" value={menuForm.price} onChange={(event) => setMenuForm((prev) => ({ ...prev, price: event.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Price" />
                    <div className="flex items-center gap-3">
                      <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                        <Image className="h-4 w-4" />
                        <span>{menuForm.imageFile ? 'Change Image' : 'Upload Image'}</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setMenuForm(prev => ({ ...prev, imageFile: file, imagePreview: URL.createObjectURL(file), image: '' }));
                          }
                        }} />
                      </label>
                      {menuForm.imagePreview && (
                        <div className="relative">
                          <img src={menuForm.imagePreview} alt="Preview" className="h-12 w-12 rounded-lg object-cover" />
                          <button type="button" onClick={() => setMenuForm(prev => ({ ...prev, imageFile: null, imagePreview: null }))} className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-0.5 text-white">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      {!menuForm.imageFile && menuForm.image && !menuForm.imagePreview && (
                        <span className="text-xs text-gray-400">Current: {menuForm.image.substring(0, 30)}...</span>
                      )}
                    </div>
                    <input value={menuForm.spiceLevel} onChange={(event) => setMenuForm((prev) => ({ ...prev, spiceLevel: event.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Spice Level (1-3)" />
                    <input value={menuForm.badge} onChange={(event) => setMenuForm((prev) => ({ ...prev, badge: event.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Badge (Best Seller)" />
                    <textarea required value={menuForm.description} onChange={(event) => setMenuForm((prev) => ({ ...prev, description: event.target.value }))} className="md:col-span-2 min-h-[96px] rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Description" />
                    <label className="md:col-span-2 flex items-center gap-3 text-sm font-semibold text-gray-700">
                      <input type="checkbox" checked={menuForm.isAvailable} onChange={(event) => setMenuForm((prev) => ({ ...prev, isAvailable: event.target.checked }))} />
                      Available for customers
                    </label>
                    <div className="md:col-span-2 flex flex-wrap gap-3">
                      <button type="submit" className="flex items-center gap-2 rounded-2xl bg-[#E31E24] px-4 py-3 text-sm font-semibold text-white">
                        <PlusCircle className="h-4 w-4" />
                        {editingItemId ? 'Save Item' : 'Add Item'}
                      </button>
                      <button type="button" onClick={resetMenuForm} className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700">Reset</button>
                    </div>
                  </form>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-black text-gray-900">Current Menu</h2>
                  <div className="mt-4 space-y-3">
                    {menuItems.map((item) => (
                      <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-4 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-black text-gray-900">{item.name}</h3>
                            {item.badge && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase text-amber-700">{item.badge}</span>}
                            {!item.isAvailable && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold uppercase text-gray-700">Unavailable</span>}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                          <p className="mt-1 text-sm font-semibold text-gray-900">{formatPrice(Number(item.price))}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button onClick={() => toggleItemAvailability(item.id)} className="flex items-center gap-2 rounded-2xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700">
                            {item.isAvailable ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                            {item.isAvailable ? 'Available' : 'Hidden'}
                          </button>
                          <button onClick={() => startEdit(item)} className="flex items-center gap-2 rounded-2xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700">
                            <Edit3 className="h-4 w-4" />Edit
                          </button>
                          <button onClick={() => deleteMenuItem(item.id)} className="flex items-center gap-2 rounded-2xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600">
                            <Trash2 className="h-4 w-4" />Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'deals' && (
              <div className="space-y-6">
                {/* Deal Form */}
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-gray-900">{editingDealId ? 'Edit Deal' : 'Create New Deal'}</h2>
                      <p className="text-sm text-gray-500">Bundle multiple menu items into a special deal for customers.</p>
                    </div>
                  </div>

                  <form onSubmit={handleDealSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
                    <input required value={dealForm.name} onChange={(e) => setDealForm(prev => ({ ...prev, name: e.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Deal Name (e.g. Family Feast)" />
                    <input required type="number" step="0.01" value={dealForm.price} onChange={(e) => setDealForm(prev => ({ ...prev, price: e.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Deal Price" />
                    <textarea value={dealForm.description} onChange={(e) => setDealForm(prev => ({ ...prev, description: e.target.value }))} className="md:col-span-2 min-h-[80px] rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Deal Description (optional)" />

                    {/* Image Upload */}
                    <div className="md:col-span-2 flex items-center gap-3">
                      <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                        <Image className="h-4 w-4" />
                        <span>{dealForm.imageFile ? 'Change Image' : 'Upload Deal Image'}</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setDealForm(prev => ({ ...prev, imageFile: file, imagePreview: URL.createObjectURL(file) }));
                          }
                        }} />
                      </label>
                      {dealForm.imagePreview && (
                        <div className="relative">
                          <img src={dealForm.imagePreview} alt="Preview" className="h-12 w-12 rounded-lg object-cover" />
                          <button type="button" onClick={() => setDealForm(prev => ({ ...prev, imageFile: null, imagePreview: null }))} className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-0.5 text-white">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <label className="md:col-span-2 flex items-center gap-3 text-sm font-semibold text-gray-700">
                      <input type="checkbox" checked={dealForm.isActive} onChange={(e) => setDealForm(prev => ({ ...prev, isActive: e.target.checked }))} />
                      Active (visible to customers)
                    </label>

                    {/* Select Items for Deal */}
                    <div className="md:col-span-2">
                      <h3 className="mb-2 text-sm font-bold text-gray-700">Select Menu Items for this Deal:</h3>
                      <div className="max-h-48 overflow-y-auto rounded-2xl border border-gray-200 p-2">
                        {menuItems.filter(item => item.isAvailable !== false).map(item => {
                          const selected = dealForm.selectedItems.find(i => i.id === item.id);
                          return (
                            <div key={item.id} className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm cursor-pointer ${selected ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'}`} onClick={() => toggleDealItemSelection(item)}>
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked={!!selected} onChange={() => {}} className="rounded" />
                                <span className="font-semibold">{item.name}</span>
                                <span className="text-gray-400">— {item.price} Rs</span>
                              </div>
                              {selected && (
                                <div className="flex items-center gap-2">
                                  <button type="button" onClick={(e) => { e.stopPropagation(); updateDealItemQuantity(item.id, -1); }} className="rounded-full bg-gray-200 p-1"><Minus className="h-3 w-3" /></button>
                                  <span className="font-bold text-sm">x{selected.quantity}</span>
                                  <button type="button" onClick={(e) => { e.stopPropagation(); updateDealItemQuantity(item.id, 1); }} className="rounded-full bg-gray-200 p-1"><Plus className="h-3 w-3" /></button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {dealForm.selectedItems.length === 0 && <p className="mt-1 text-xs text-red-500">Select at least one item</p>}
                      {dealForm.selectedItems.length > 0 && (
                        <p className="mt-1 text-xs text-gray-500">{dealForm.selectedItems.length} item(s) selected</p>
                      )}
                    </div>

                    <div className="md:col-span-2 flex flex-wrap gap-3">
                      <button type="submit" className="flex items-center gap-2 rounded-2xl bg-[#E31E24] px-4 py-3 text-sm font-semibold text-white">
                        <PlusCircle className="h-4 w-4" />
                        {editingDealId ? 'Save Deal' : 'Create Deal'}
                      </button>
                      <button type="button" onClick={resetDealForm} className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700">Reset</button>
                    </div>
                  </form>
                </div>

                {/* Deals List */}
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-black text-gray-900">Current Deals</h2>
                  {deals.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-400">No deals created yet. Use the form above to create your first deal.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {deals.map((deal) => (
                        <div key={deal.id} className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-4 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-black text-gray-900">{deal.name}</h3>
                              {deal.isActive ? (
                                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase text-emerald-700">Active</span>
                              ) : (
                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold uppercase text-gray-700">Inactive</span>
                              )}
                            </div>
                            {deal.description && <p className="mt-1 text-sm text-gray-500">{deal.description}</p>}
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="text-lg font-black text-[#E31E24]">{formatPrice(Number(deal.price))}</span>
                              <span className="text-xs text-gray-400">|</span>
                              <span className="text-xs text-gray-500">{deal.items?.length || 0} item(s): {deal.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}</span>
                            </div>
                            {deal.image && (
                              <img src={deal.image} alt={deal.name} className="mt-2 h-16 w-16 rounded-lg object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button onClick={() => startDealEdit(deal)} className="flex items-center gap-2 rounded-2xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700">
                              <Edit3 className="h-4 w-4" />Edit
                            </button>
                            <button onClick={() => deleteDeal(deal.id)} className="flex items-center gap-2 rounded-2xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600">
                              <Trash2 className="h-4 w-4" />Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'staff' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-gray-900">Staff Management</h2>
                      <p className="text-sm text-gray-500">Manage internal employees (Managers, Chefs, Kitchen Staff, Cashiers). System login is not required for general staff.</p>
                    </div>
                  </div>

                  <form onSubmit={handleStaffSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
                    <input required value={staffForm.name} onChange={(e) => setStaffForm(prev => ({ ...prev, name: e.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Full Name *" />
                    <select value={staffForm.role} onChange={(e) => setStaffForm(prev => ({ ...prev, role: e.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm font-semibold">
                      <option value="Manager">Manager</option>
                      <option value="Chef">Chef / Cook</option>
                      <option value="Kitchen Staff">Kitchen Staff</option>
                      <option value="Cashier">Cashier / Counter</option>
                      <option value="Store Staff">Store Staff</option>
                    </select>
                    <input value={staffForm.department} onChange={(e) => setStaffForm(prev => ({ ...prev, department: e.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Department / Section (e.g. Kitchen, Counter)" />
                    <input value={staffForm.phone} onChange={(e) => setStaffForm(prev => ({ ...prev, phone: e.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Phone Number" />
                    <input value={staffForm.address} onChange={(e) => setStaffForm(prev => ({ ...prev, address: e.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Residential Address (optional)" />
                    <input value={staffForm.cnic} onChange={(e) => setStaffForm(prev => ({ ...prev, cnic: e.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="CNIC / National ID (optional)" />
                    <select value={staffForm.status} onChange={(e) => setStaffForm(prev => ({ ...prev, status: e.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm font-semibold">
                      <option value="active">Active</option>
                      <option value="on_leave">On Leave</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <input value={staffForm.notes} onChange={(e) => setStaffForm(prev => ({ ...prev, notes: e.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Notes / Performance info (optional)" />

                    <div className="flex flex-wrap gap-3 md:col-span-2">
                      <button type="submit" className="flex items-center gap-2 rounded-2xl bg-[#E31E24] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-red-700">
                        <PlusCircle className="h-4 w-4" />
                        {editingStaffId ? 'Save Staff Changes' : 'Add Staff Member'}
                      </button>
                      <button type="button" onClick={resetStaffForm} className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50">Reset</button>
                    </div>
                  </form>

                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                          <th className="px-3 py-3">Name</th>
                          <th className="px-3 py-3">Role</th>
                          <th className="px-3 py-3">Department</th>
                          <th className="px-3 py-3">Phone</th>
                          <th className="px-3 py-3">CNIC</th>
                          <th className="px-3 py-3">Status</th>
                          <th className="px-3 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffMembers.filter(m => m.role?.toLowerCase() !== 'rider').map((member) => (
                          <tr key={member.id} className="border-b border-gray-50">
                            <td className="px-3 py-3 font-bold text-gray-900">{member.name}</td>
                            <td className="px-3 py-3 font-semibold text-[#E31E24]">{member.role}</td>
                            <td className="px-3 py-3 text-gray-600">{member.department || member.assignedSection || 'Kitchen'}</td>
                            <td className="px-3 py-3 text-gray-600">{member.phone || '—'}</td>
                            <td className="px-3 py-3 font-mono text-xs text-gray-500">{member.cnic || '—'}</td>
                            <td className="px-3 py-3">
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${member.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                {member.status}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-gray-600">
                              <div className="flex flex-wrap gap-2">
                                <button onClick={() => startStaffEdit(member)} className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50">Edit</button>
                                <button onClick={() => deleteStaffMember(member.id)} className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'riders' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-gray-900">Rider Management Module</h2>
                      <p className="text-sm text-gray-500">Dedicated management for delivery riders. Only Riders receive system login accounts.</p>
                    </div>
                  </div>

                  <form onSubmit={handleRiderSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
                    <input required value={riderForm.name} onChange={(e) => setRiderForm(prev => ({ ...prev, name: e.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm font-semibold" placeholder="Rider Full Name *" />
                    <input value={riderForm.phone} onChange={(e) => setRiderForm(prev => ({ ...prev, phone: e.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Phone Number *" />
                    <input required type="email" value={riderForm.email} onChange={(e) => setRiderForm(prev => ({ ...prev, email: e.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Email (Rider Login Credential) *" />
                    <input type="password" value={riderForm.password} onChange={(e) => setRiderForm(prev => ({ ...prev, password: e.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder={editingRiderId ? "New Password (leave blank to keep unchanged)" : "Account Password *"} />
                    
                    <select value={riderForm.vehicleType} onChange={(e) => setRiderForm(prev => ({ ...prev, vehicleType: e.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm font-semibold">
                      <option value="Motorcycle">Motorcycle</option>
                      <option value="Scooter">Scooter / Electric Bike</option>
                      <option value="Car/Van">Car / Van</option>
                      <option value="Bicycle">Bicycle</option>
                    </select>
                    <input value={riderForm.vehicleNumber} onChange={(e) => setRiderForm(prev => ({ ...prev, vehicleNumber: e.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Vehicle Plate Number (e.g. LEB-4812)" />
                    <input value={riderForm.licenseNumber} onChange={(e) => setRiderForm(prev => ({ ...prev, licenseNumber: e.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Driving License Number (optional)" />
                    <input value={riderForm.assignedArea} onChange={(e) => setRiderForm(prev => ({ ...prev, assignedArea: e.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Assigned Delivery Area (e.g. Gulberg III)" />
                    <input value={riderForm.address} onChange={(e) => setRiderForm(prev => ({ ...prev, address: e.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Residential Address (optional)" />

                    <select value={riderForm.availabilityStatus} onChange={(e) => setRiderForm(prev => ({ ...prev, availabilityStatus: e.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm font-semibold">
                      <option value="on_duty">On Duty (Available for orders)</option>
                      <option value="off_duty">Off Duty (Unavailable)</option>
                    </select>

                    <label className="md:col-span-2 flex items-center gap-3 text-sm font-semibold text-gray-700">
                      <input type="checkbox" checked={riderForm.isActive} onChange={(e) => setRiderForm(prev => ({ ...prev, isActive: e.target.checked }))} />
                      Active Rider Account (Rider can log in to Rider Panel)
                    </label>

                    <div className="flex flex-wrap gap-3 md:col-span-2">
                      <button type="submit" className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#E31E24] to-[#FF6B35] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:scale-105">
                        <Bike className="h-4 w-4" />
                        {editingRiderId ? 'Save Rider Changes' : 'Create Rider Account'}
                      </button>
                      <button type="button" onClick={resetRiderForm} className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50">Reset</button>
                    </div>
                  </form>

                  {/* Rider Directory Table */}
                  <div className="mt-8 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                          <th className="px-3 py-3">Rider Name</th>
                          <th className="px-3 py-3">Login Email</th>
                          <th className="px-3 py-3">Vehicle & Plate</th>
                          <th className="px-3 py-3">Assigned Area</th>
                          <th className="px-3 py-3">Duty Status</th>
                          <th className="px-3 py-3">Account</th>
                          <th className="px-3 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {riders.map((rider) => (
                          <tr key={rider.id} className="border-b border-gray-50">
                            <td className="px-3 py-3">
                              <div className="font-bold text-gray-900">{rider.name}</div>
                              <div className="text-xs text-gray-500">{rider.phone || 'No Phone'}</div>
                            </td>
                            <td className="px-3 py-3 font-mono text-xs text-gray-600">{rider.email}</td>
                            <td className="px-3 py-3">
                              <div className="font-semibold text-gray-800">{rider.vehicleType}</div>
                              <div className="text-xs font-mono text-gray-400">{rider.vehicleNumber || '—'}</div>
                            </td>
                            <td className="px-3 py-3 font-semibold text-gray-700">{rider.assignedArea}</td>
                            <td className="px-3 py-3">
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${rider.availabilityStatus === 'on_duty' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                {rider.availabilityStatus === 'on_duty' ? '🟢 On Duty' : '🔴 Off Duty'}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${rider.isActive ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                                {rider.isActive ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex flex-wrap gap-2">
                                <button onClick={() => toggleRiderStatus(rider.id)} className="rounded-xl border border-gray-200 px-2.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100">
                                  {rider.isActive ? 'Disable' : 'Enable'}
                                </button>
                                <button onClick={() => setResetRiderPasswordModal(rider)} className="rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 flex items-center gap-1">
                                  <Key className="h-3 w-3" /> Password
                                </button>
                                <button onClick={() => startRiderEdit(rider)} className="rounded-xl border border-gray-200 px-2.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100">Edit</button>
                                <button onClick={() => deleteRider(rider.id)} className="rounded-xl border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Reset Password Modal */}
                {resetRiderPasswordModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 relative">
                      <button onClick={() => setResetRiderPasswordModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                      </button>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Key className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-gray-900">Reset Rider Password</h3>
                          <p className="text-xs text-gray-500">For rider {resetRiderPasswordModal.name} ({resetRiderPasswordModal.email})</p>
                        </div>
                      </div>
                      <form onSubmit={handleResetRiderPasswordSubmit} className="space-y-4">
                        <input
                          required
                          type="password"
                          placeholder="Enter new password (min 6 characters)"
                          value={newRiderPasswordInput}
                          onChange={(e) => setNewRiderPasswordInput(e.target.value)}
                          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold"
                        />
                        <div className="flex gap-2 justify-end">
                          <button type="button" onClick={() => setResetRiderPasswordModal(null)} className="rounded-2xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600">Cancel</button>
                          <button type="submit" className="rounded-2xl bg-[#E31E24] px-5 py-2.5 text-xs font-bold text-white shadow-md">Update Password</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-gray-900">Inventory Control</h2>
                      <p className="text-sm text-gray-500">Track stock counts for ingredients, packaging, and hot items.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={exportInventoryCSV} className="flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                        <Download className="h-4 w-4" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="rounded-2xl bg-red-50 px-4 py-3">
                      <p className="text-xs font-bold text-red-700">
                        Low Stock Items: <span className="text-lg">{inventoryItems.filter(i => i.stockCount <= i.restockThreshold).length}</span>
                      </p>
                    </div>
                    <div className="rounded-2xl bg-blue-50 px-4 py-3">
                      <p className="text-xs font-bold text-blue-700">
                        Total Items: <span className="text-lg">{inventoryItems.length}</span>
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleInventorySubmit} className="mt-6 grid gap-4 md:grid-cols-2">
                    <input required value={inventoryForm.name} onChange={(event) => setInventoryForm((prev) => ({ ...prev, name: event.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Item Name" />
                    <select value={inventoryForm.category} onChange={(event) => setInventoryForm((prev) => ({ ...prev, category: event.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm">
                      <option value="ingredients">Ingredients</option>
                      <option value="packaging">Packaging</option>
                      <option value="beverages">Beverages</option>
                      <option value="supplies">Supplies</option>
                    </select>
                    <input value={inventoryForm.sku} onChange={(event) => setInventoryForm((prev) => ({ ...prev, sku: event.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="SKU (e.g. CHK-WNG-001)" />
                    <input value={inventoryForm.barcode} onChange={(event) => setInventoryForm((prev) => ({ ...prev, barcode: event.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm font-mono" placeholder="Barcode (optional)" />
                    <input required type="number" min="0" value={inventoryForm.stockCount} onChange={(event) => setInventoryForm((prev) => ({ ...prev, stockCount: event.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Stock Count" />
                    <input required type="number" min="0" value={inventoryForm.restockThreshold} onChange={(event) => setInventoryForm((prev) => ({ ...prev, restockThreshold: event.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Restock Threshold" />
                    <input value={inventoryForm.unit} onChange={(event) => setInventoryForm((prev) => ({ ...prev, unit: event.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Unit (pcs, kg)" />
                    <input required type="number" step="0.01" min="0" value={inventoryForm.cost} onChange={(event) => setInventoryForm((prev) => ({ ...prev, cost: event.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Cost" />
                    <label className="md:col-span-2 flex items-center gap-3 text-sm font-semibold text-gray-700">
                      <input type="checkbox" checked={inventoryForm.isActive} onChange={(event) => setInventoryForm((prev) => ({ ...prev, isActive: event.target.checked }))} />
                      Active Item
                    </label>
                    <div className="md:col-span-2 flex flex-wrap gap-3">
                      <button type="submit" className="flex items-center gap-2 rounded-2xl bg-[#E31E24] px-4 py-3 text-sm font-semibold text-white">
                        <PlusCircle className="h-4 w-4" />
                        {editingInventoryId ? 'Save Inventory' : 'Add Inventory'}
                      </button>
                      <button type="button" onClick={resetInventoryForm} className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700">Reset</button>
                    </div>
                  </form>

                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                          <th className="px-3 py-3">Item</th>
                          <th className="px-3 py-3">SKU</th>
                          <th className="px-3 py-3">Category</th>
                          <th className="px-3 py-3">Stock</th>
                          <th className="px-3 py-3">Restock</th>
                          <th className="px-3 py-3">Cost</th>
                          <th className="px-3 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryItems.map((item) => (
                          <tr key={item.id} className="border-b border-gray-50">
                            <td className="px-3 py-3">
                              <div className="font-semibold text-gray-900">{item.name}</div>
                              {item.barcode && <div className="text-[10px] font-mono text-gray-400">{item.barcode}</div>}
                            </td>
                            <td className="px-3 py-3 text-[11px] font-mono text-gray-500">{item.sku || '—'}</td>
                            <td className="px-3 py-3 text-gray-600">{item.category}</td>
                            <td className={`px-3 py-3 font-bold ${item.stockCount <= item.restockThreshold ? 'text-red-600' : 'text-gray-900'}`}>{item.stockCount} {item.unit}</td>
                            <td className="px-3 py-3 text-gray-600">{item.restockThreshold}</td>
                            <td className="px-3 py-3 text-gray-600">{formatPrice(Number(item.cost))}</td>
                            <td className="px-3 py-3 text-gray-600">
                              <div className="flex flex-wrap gap-1.5">
                                <button onClick={() => {
                                  const qty = prompt('Stock IN quantity:', '10');
                                  if (qty) { const n = Number(qty); if (n > 0) { editInventoryItem({ ...item, stockCount: (item.stockCount || 0) + n }); recordStockTransaction(item.id, item.name, 'in', n); } }
                                }} className="rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700">Stock In</button>
                                <button onClick={() => {
                                  const qty = prompt('Stock OUT quantity:', '5');
                                  if (qty) { const n = Number(qty); if (n > 0) { editInventoryItem({ ...item, stockCount: Math.max(0, (item.stockCount || 0) - n) }); recordStockTransaction(item.id, item.name, 'out', n); } }
                                }} className="rounded-xl border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-700">Stock Out</button>
                                <button onClick={() => startInventoryEdit(item)} className="rounded-xl border border-gray-200 px-2.5 py-1.5 text-[11px] font-semibold text-gray-700">Edit</button>
                                <button onClick={() => deleteInventoryItem(item.id)} className="rounded-xl border border-red-200 px-2.5 py-1.5 text-[11px] font-semibold text-red-600">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {stockTransactions.length > 0 && (
                    <div className="mt-6">
                      <h3 className="mb-3 text-base font-black text-gray-900">Stock Transaction History</h3>
                      <div className="max-h-48 overflow-y-auto rounded-2xl border border-gray-100">
                        <table className="min-w-full text-left text-xs">
                          <thead className="sticky top-0 bg-gray-50">
                            <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              <th className="px-3 py-2">Date</th>
                              <th className="px-3 py-2">Item</th>
                              <th className="px-3 py-2">Type</th>
                              <th className="px-3 py-2">Qty</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stockTransactions.slice(0, 20).map((t) => (
                              <tr key={t.id} className="border-b border-gray-50">
                                <td className="px-3 py-2 text-gray-500">{new Date(t.timestamp).toLocaleString()}</td>
                                <td className="px-3 py-2 font-semibold text-gray-900">{t.itemName}</td>
                                <td className="px-3 py-2">
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${t.type === 'in' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{t.type}</span>
                                </td>
                                <td className="px-3 py-2 font-bold text-gray-900">{t.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'promos' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-black text-gray-900">Promo Codes</h2>
                  <p className="text-sm text-gray-500">Create coupon codes and update their activity state.</p>
                  <form onSubmit={handlePromoSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
                    <input required value={promoForm.code} onChange={(event) => setPromoForm((prev) => ({ ...prev, code: event.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm uppercase" placeholder="CHICKN20" />
                    <input type="number" value={promoForm.discountPercent} onChange={(event) => setPromoForm((prev) => ({ ...prev, discountPercent: event.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Discount %" />
                    <input type="number" step="0.01" value={promoForm.discountFlat} onChange={(event) => setPromoForm((prev) => ({ ...prev, discountFlat: event.target.value }))} className="rounded-2xl border border-gray-200 px-3 py-3 text-sm" placeholder="Flat Discount" />
                    <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                      <input type="checkbox" checked={promoForm.freeDelivery} onChange={(event) => setPromoForm((prev) => ({ ...prev, freeDelivery: event.target.checked }))} />
                      Free delivery
                    </label>
                    <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                      <input type="checkbox" checked={promoForm.isActive} onChange={(event) => setPromoForm((prev) => ({ ...prev, isActive: event.target.checked }))} />
                      Active
                    </label>
                    <div className="md:col-span-2">
                      <button type="submit" className="rounded-2xl bg-[#E31E24] px-4 py-3 text-sm font-semibold text-white">Save Promo</button>
                    </div>
                  </form>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-black text-gray-900">Current Codes</h2>
                  <div className="mt-4 space-y-3">
                    {Object.entries(promos).map(([code, promo]) => (
                      <div key={code} className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="text-base font-black text-gray-900">{code}</div>
                          <div className="text-sm text-gray-500">{promo.discountPercent ? `${promo.discountPercent}% off` : promo.discountFlat ? `${formatPrice(promo.discountFlat)} off` : 'Free delivery'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${promo.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                            {promo.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <button onClick={() => togglePromoActive(code)} className="rounded-2xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700">Toggle</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Category Modal */}
            {categoryModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setCategoryModalOpen(false)}>
                <div className="mx-4 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-black text-gray-900">{editingCategoryId ? 'Edit Category' : 'Add Category'}</h3>
                    <button onClick={() => setCategoryModalOpen(false)} className="rounded-full p-1 hover:bg-gray-100">
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <input required value={categoryFormName} onChange={(e) => setCategoryFormName(e.target.value)} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm" placeholder="Category name (e.g. Nuggets)" />
                    <div className="flex flex-wrap gap-3">
                      <button type="submit" className="flex items-center gap-2 rounded-2xl bg-[#E31E24] px-5 py-3 text-sm font-semibold text-white">
                        <Save className="h-4 w-4" />
                        {editingCategoryId ? 'Save Changes' : 'Create Category'}
                      </button>
                      {editingCategoryId && (
                        <button type="button" onClick={() => { const cat = categories.find(c => c.id === editingCategoryId); if (cat) handleDeleteCategory(cat); }} className="flex items-center gap-2 rounded-2xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600">
                          <Trash2 className="h-4 w-4" />Delete Category
                        </button>
                      )}
                      <button type="button" onClick={() => setCategoryModalOpen(false)} className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
