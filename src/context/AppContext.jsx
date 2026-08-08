import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initialMenuItems, initialOrdersList, promoCodesList } from '../data/menuData';
import { api, setAuthToken, clearAuthToken, getAuthToken } from '../lib/api';
import { formatPrice } from '../lib/currency';
import { getOrCreateGuestId } from '../lib/guestId';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('menu');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('chicknchunksAdminLoggedIn') === 'true';
  });

  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [allOrders, setAllOrders] = useState([]);
  const [promos, setPromos] = useState(promoCodesList);
  const [staffMembers, setStaffMembers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [stockTransactions, setStockTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deals, setDeals] = useState([]);
  const [checkoutToast, setCheckoutToast] = useState(null);

  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  const [user, setUser] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isRiderLoggedIn, setIsRiderLoggedIn] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('chicknchunksRiderLoggedIn') === 'true';
  });
  const [riderProfile, setRiderProfile] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('chicknchunksRiderProfile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [chatConversations, setChatConversations] = useState([]);
  const [chatNotifications, setChatNotifications] = useState(0);
  const [activeChatOrderId, setActiveChatOrderId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  const [riders, setRiders] = useState([]);

  const fetchMenuItems = async () => {
    try { const d = await api('/menu-items'); if (Array.isArray(d)) setMenuItems(d); } catch (e) { console.error('Failed to load menu items', e); }
  };
  const isFetchingOrdersRef = useRef(false);
  const fetchOrders = async () => {
    if (isFetchingOrdersRef.current) return null;
    isFetchingOrdersRef.current = true;
    try {
      const guestId = getOrCreateGuestId();
      const savedUser = JSON.parse(localStorage.getItem('chicknchunksUser') || 'null');
      const savedPhone = user?.phone || savedUser?.phone || localStorage.getItem('chicknchunks_customer_phone') || '';
      
      let endpoint = '/orders';
      if (!isAdminLoggedIn && !isRiderLoggedIn && !getAuthToken()) {
        const params = new URLSearchParams();
        if (guestId) params.append('guest_id', guestId);
        if (savedPhone) params.append('phone', savedPhone);
        if (user?.id || savedUser?.id) params.append('customer_id', user?.id || savedUser?.id);
        endpoint = `/orders?${params.toString()}`;
      }

      const d = await api(endpoint);
      if (Array.isArray(d)) {
        setAllOrders(d);
        return d;
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      isFetchingOrdersRef.current = false;
    }
    return null;
  };
  const fetchOrder = async (orderId) => {
    try {
      const d = await api(`/orders/${orderId}`);
      if (d && d.orderId) {
        setAllOrders(prev => prev.map(o => o.orderId === d.orderId ? d : o));
        setActiveOrder(prev => (prev && prev.orderId === d.orderId) ? d : prev);
        return d;
      }
    } catch (e) { console.error('Failed to load order', e); }
    return null;
  };
  const fetchPromos = async () => {
    try { const d = await api('/promos'); if (d && typeof d === 'object') setPromos(d); } catch (e) { console.error('Failed to load promos', e); }
  };
  const fetchStaff = async () => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('chicknchunksUser') || 'null');
      if (savedUser?.role !== 'admin') return;
      const d = await api('/staff-members');
      if (Array.isArray(d)) setStaffMembers(d);
    } catch (e) { /* suppress non-admin 403 logs */ }
  };
  const fetchRiders = async () => {
    try { const d = await api('/riders'); if (Array.isArray(d)) setRiders(d); } catch (e) { console.error('Failed to load riders', e); }
  };
  const fetchInventory = async () => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('chicknchunksUser') || 'null');
      if (savedUser?.role !== 'admin') return;
      const d = await api('/inventory-items');
      if (Array.isArray(d)) setInventoryItems(d);
    } catch (e) { /* suppress non-admin 403 logs */ }
  };
  const fetchCategories = async () => {
    try { const d = await api('/categories'); if (Array.isArray(d)) setCategories(d); } catch (e) { console.error('Failed to load categories', e); }
  };
  const fetchDeals = async () => {
    try { const d = await api('/deals'); if (Array.isArray(d)) setDeals(d); } catch (e) { console.error('Failed to load deals', e); }
  };

  const refreshData = async () => {
    const savedUser = JSON.parse(localStorage.getItem('chicknchunksUser') || 'null');
    const isAdmin = savedUser?.role === 'admin';
    const calls = [fetchMenuItems(), fetchOrders(), fetchPromos(), fetchCategories(), fetchDeals(), fetchRiders()];
    if (getAuthToken() && isAdmin) {
      calls.push(fetchStaff(), fetchInventory());
    }
    await Promise.allSettled(calls);
    if (savedUser?.name) setUser(savedUser);
  };

  useEffect(() => { refreshData(); }, []);

  const changeAddress = (newAddress) => {
    const trimmed = (newAddress || '').trim();
    if (!trimmed) return;
    setUser(prev => ({ ...(prev || {}), address: trimmed }));
    localStorage.setItem('chicknchunksUserAddress', trimmed);
    const existingUser = JSON.parse(localStorage.getItem('chicknchunksUser') || '{}');
    localStorage.setItem('chicknchunksUser', JSON.stringify({ ...existingUser, address: trimmed }));
  };

  const loginUser = async (email, password) => {
    try {
      const data = await api('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (data?.token && data?.user) {
        setAuthToken(data.token);
        const role = data.user.role;

        if (role === 'admin') {
          setIsAdminLoggedIn(true);
          localStorage.setItem('chicknchunksAdminLoggedIn', 'true');
          setActiveView('staff');
          refreshData();
          return { success: true, role: 'admin', user: data.user };
        } else if (role === 'rider') {
          setIsRiderLoggedIn(true);
          setRiderProfile(data.user);
          localStorage.setItem('chicknchunksRiderLoggedIn', 'true');
          localStorage.setItem('chicknchunksRiderProfile', JSON.stringify(data.user));
          setActiveView('rider');
          refreshData();
          return { success: true, role: 'rider', user: data.user };
        } else {
          setUser(data.user);
          localStorage.setItem('chicknchunksUser', JSON.stringify(data.user));
          setActiveView('menu');
          refreshData();
          return { success: true, role: 'customer', user: data.user };
        }
      }
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
    return { success: false };
  };

  const adminLogin = async (username, password) => {
    const res = await loginUser(username, password);
    return res.role === 'admin';
  };

  const riderLogin = async (email, password) => {
    const res = await loginUser(email, password);
    return res.role === 'rider';
  };

  const userLogout = async () => {
    try {
      await api('/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed', error);
    }
    clearAuthToken();
    localStorage.removeItem('chicknchunksUser');
    localStorage.removeItem('chicknchunksAdminLoggedIn');
    localStorage.removeItem('chicknchunksRiderLoggedIn');
    localStorage.removeItem('chicknchunksRiderProfile');
    setUser(null);
    setIsAdminLoggedIn(false);
    setIsRiderLoggedIn(false);
    setRiderProfile(null);
    setActiveView('menu');
  };

  const riderLogout = async () => {
    await userLogout();
  };

  const adminLogout = async () => {
    await userLogout();
  };

  const staffLogin = async (email, password) => {
    const res = await loginUser(email, password);
    return res.success;
  };

  const staffLogout = () => {
    clearAuthToken();
    if (isAdminLoggedIn) adminLogout();
    else if (isRiderLoggedIn) riderLogout();
  };

  // Cart Functions
  const addToCart = (item, customization = {}) => {
    const spice = customization.spice || item.options?.spiceLevels?.[0] || 'Default';
    const additions = customization.additions || [];
    const uniqueCartId = `${item.id}-${spice}-${additions.map(a => a.name).sort().join(',')}`;

    const extraPrice = additions.reduce((acc, curr) => acc + curr.price, 0);
    const finalItemPrice = item.price + extraPrice;

    setCart(prev => {
      const existing = prev.find(i => i.uniqueCartId === uniqueCartId);
      if (existing) {
        return prev.map(i =>
          i.uniqueCartId === uniqueCartId
            ? { ...i, quantity: i.quantity + (customization.quantity || 1) }
            : i
        );
      }
      return [
        ...prev,
        {
          ...item,
          uniqueCartId,
          unitPrice: finalItemPrice,
          quantity: customization.quantity || 1,
          selectedSpice: spice,
          selectedAdditions: additions
        }
      ];
    });
  };

  const removeFromCart = (uniqueCartId) => {
    setCart(prev => prev.filter(i => i.uniqueCartId !== uniqueCartId));
  };

  const updateQuantity = (uniqueCartId, delta) => {
    setCart(prev =>
      prev
        .map(i => {
          if (i.uniqueCartId === uniqueCartId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
  };

  const applyPromo = (code) => {
    const formatted = code.trim().toUpperCase();
    const targetPromo = promos[formatted];
    const isActive = targetPromo?.isActive ?? targetPromo?.is_active;
    if (targetPromo && isActive) {
      setAppliedPromo(targetPromo);
      setPromoError('');
      return true;
    } else {
      setPromoError('Invalid or inactive promo code. Try CHICKN20!');
      return false;
    }
  };

  // Pricing calculations
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const promoFreeDelivery = appliedPromo?.freeDelivery ?? appliedPromo?.free_delivery ?? false;
  const deliveryFee = promoFreeDelivery || subtotal > 1000 || subtotal === 0 ? 0 : 99;

  let discountAmount = 0;
  const promoDiscountPercent = appliedPromo?.discountPercent ?? appliedPromo?.discount_percent ?? 0;
  const promoDiscountFlat = appliedPromo?.discountFlat ?? appliedPromo?.discount_flat ?? 0;
  if (promoDiscountPercent) {
    discountAmount = (subtotal * promoDiscountPercent) / 100;
  } else if (promoDiscountFlat) {
    discountAmount = promoDiscountFlat;
  }
  
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);
  const totalCartCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Customer Order Placement
  const placeOrder = async (orderDetails) => {
    if (!cart || cart.length === 0) {
      throw new Error('Your cart is empty. Please add items before placing an order.');
    }

    const paymentMethodLabel = orderDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : orderDetails.paymentMethod === 'card' ? 'Credit Card' : 'Apple Pay';
    const paymentStatus = orderDetails.paymentMethod === 'cod' ? 'pending' : 'paid';
    const finalAddress = (orderDetails.address || user?.address || '').trim();
    const finalName = (orderDetails.customerName || user?.name || '').trim();
    const finalPhone = (orderDetails.customerPhone || user?.phone || '').trim();

    if (!finalAddress) throw new Error('Delivery address is required.');
    if (!finalName) throw new Error('Customer name is required.');
    if (!finalPhone) throw new Error('Customer phone number is required.');

    if (typeof window !== 'undefined' && finalPhone) {
      localStorage.setItem('chicknchunks_customer_phone', finalPhone);
    }

    const guestId = getOrCreateGuestId();
    const newOrderPayload = {
      orderId: 'CHK-' + Math.floor(100000 + Math.random() * 900000),
      guest_id: user ? null : guestId,
      items: cart.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        selectedSpice: i.selectedSpice || 'Default',
        selectedAdditions: i.selectedAdditions || []
      })),
      subtotal: Number(subtotal),
      deliveryFee: Number(deliveryFee),
      discountAmount: Number(discountAmount),
      total: Number(total),
      address: finalAddress,
      paymentMethod: paymentMethodLabel,
      paymentStatus: paymentStatus,
      customerName: finalName,
      customerPhone: finalPhone
    };

    let savedOrder = null;
    try {
      savedOrder = await api('/orders', {
        method: 'POST',
        body: JSON.stringify(newOrderPayload)
      });
    } catch (error) {
      console.error('Failed to create order on backend:', error);
      // DO NOT clear cart on backend error! Preserves cart items and totals.
      throw new Error(error.message || 'Failed to process order. Please try again.');
    }

    const finalOrder = (savedOrder && savedOrder.orderId) ? savedOrder : {
      ...newOrderPayload,
      status: 'placed',
      statusStep: 1,
      estimatedMinutes: 30,
      createdAt: new Date().toISOString()
    };

    // SUCCESS: Order created in database
    setActiveOrder(finalOrder);
    setAllOrders(prev => {
      const exists = prev.some(o => o.orderId === finalOrder.orderId);
      return exists ? prev : [finalOrder, ...prev];
    });

    // NOW SAFE TO CLEAR CART
    clearCart();
    setCheckoutToast(`Order ${finalOrder.orderId} confirmed! Live tracking active.`);
    setActiveView('tracking');
    fetchOrders();

    return { success: true, order: finalOrder };
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chicknchunksUser', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (!checkoutToast) return;
    const timer = setTimeout(() => setCheckoutToast(null), 4500);
    return () => clearTimeout(timer);
  }, [checkoutToast]);

  // Admin Order Status Update (propagates to live tracker)
  const updatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      const saved = await api(isRiderLoggedIn ? `/rider/orders/${orderId}/status` : `/orders/${orderId}`, {
        method: isRiderLoggedIn ? 'PATCH' : 'PUT',
        body: JSON.stringify({ paymentStatus: newPaymentStatus })
      });
      if (saved?.orderId) {
        setAllOrders(prev => prev.map(ord => ord.orderId === orderId ? saved : ord));
        if (activeOrder?.orderId === orderId) setActiveOrder(saved);
      }
    } catch (error) {
      console.error('Failed to update payment status', error);
    }
    fetchOrders();
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const stepMap = { placed: 1, preparing: 2, on_way: 3, delivered: 4 };
    const stepNum = stepMap[newStatus] || 1;

    try {
      const endpoint = isRiderLoggedIn ? `/rider/orders/${orderId}/status` : `/orders/${orderId}`;
      const method = isRiderLoggedIn ? 'PATCH' : 'PUT';
      const saved = await api(endpoint, {
        method,
        body: JSON.stringify({ status: newStatus, statusStep: stepNum })
      });
      if (saved?.orderId) {
        setAllOrders(prev => prev.map(ord => ord.orderId === orderId ? saved : ord));
        if (activeOrder?.orderId === orderId) setActiveOrder(saved);
        if (newStatus === 'delivered') fetchRiders();
      }
    } catch (error) {
      console.error('Failed to update order status', error);
    }
    fetchOrders();
  };

  const assignRiderToOrder = async (orderId, riderId) => {
    try {
      const numericId = (riderId !== null && riderId !== '' && riderId !== undefined) ? Number(riderId) : null;
      const res = await api(`/orders/${orderId}/assign-rider`, {
        method: 'POST',
        body: JSON.stringify({ rider_id: numericId })
      });
      if (res && (res.orderId || res.id)) {
        setAllOrders(prev => prev.map(o => (o.orderId === orderId || o.id === orderId) ? res : o));
        if (activeOrder?.orderId === orderId) setActiveOrder(res);
        await fetchRiders();
        await fetchOrders();
        return true;
      }
    } catch (err) {
      console.error('Failed to assign rider:', err);
    }
    return false;
  };

  // Chat Functions
  const sendMessage = async (orderId, text, senderRole, senderName, channel = 'customer_rider') => {
    if (!text.trim()) return;
    const role = senderRole || (isAdminLoggedIn ? 'admin' : isRiderLoggedIn ? 'rider' : 'customer');
    const name = senderName || (isAdminLoggedIn ? 'Admin' : isRiderLoggedIn ? riderProfile?.name || 'Rider' : user?.name || 'Customer');
    const targetChan = channel || 'customer_rider';

    // 1. Optimistic Instant UI Update (0ms delay)
    const tempMsgId = 'temp-' + Date.now() + '-' + Math.random();
    const tempMsg = {
      id: tempMsgId,
      channel: targetChan,
      sender: role,
      senderName: name,
      text: text.trim(),
      status: 'sent',
      timestamp: new Date().toISOString()
    };

    setChatConversations(prev => {
      const existing = prev.find(c => c.orderId === orderId);
      if (existing) {
        return prev.map(c => c.orderId === orderId ? { ...c, messages: [...c.messages, tempMsg] } : c);
      }
      return [...prev, { orderId, participants: ['customer', 'admin', 'rider'], messages: [tempMsg] }];
    });

    try {
      const saved = await api('/chat', {
        method: 'POST',
        body: JSON.stringify({
          order_id: orderId,
          channel: targetChan,
          sender: role,
          sender_name: name,
          text: text.trim()
        })
      });

      if (saved) {
        // Replace tempMsg with confirmed saved message (status = 'delivered')
        const confirmedMsg = {
          id: saved.id,
          channel: saved.channel || targetChan,
          sender: saved.sender,
          senderName: saved.senderName,
          text: saved.text,
          status: saved.status || 'delivered',
          timestamp: saved.timestamp,
          deliveredAt: saved.deliveredAt,
          readAt: saved.readAt
        };
        setChatConversations(prev => {
          return prev.map(c => {
            if (c.orderId !== orderId) return c;
            const updated = (c.messages || []).map(m => m.id === tempMsgId ? confirmedMsg : m);
            return { ...c, messages: updated };
          });
        });
      }
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const markChannelMessagesAsRead = async (orderId, channel) => {
    try {
      const role = isAdminLoggedIn ? 'admin' : isRiderLoggedIn ? 'rider' : 'customer';
      await api(`/chat/${orderId}/read`, {
        method: 'POST',
        body: JSON.stringify({ channel: channel || 'customer_rider', role })
      });
    } catch (error) {
      console.error('Failed to mark messages as read', error);
    }
  };

  // Single Bell Sound Synthesizer (0.25s crisp bell chime)
  const audioCtxRef = useRef(null);
  const playSingleBellSound = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime); // E6 Bell chime
      osc.frequency.exponentialRampToValueAtTime(1567.98, ctx.currentTime + 0.08); // G6

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      /* Audio playback fallback */
    }
  };

  // Browser Native Notifications
  const requestBrowserNotificationPermission = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  };

  const sendBrowserNotification = (title, body, targetPath = '/') => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const notif = new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'chicknchunks-' + Date.now(),
        });
        notif.onclick = () => {
          window.focus();
          if (targetPath) {
            window.location.hash = targetPath;
          }
          notif.close();
        };
      }
    } catch (e) {
      /* Suppress browser notification errors */
    }
  };

  const addNotification = (title, message, type = 'info') => {
    const notification = { id: Date.now(), title, message, type, timestamp: new Date().toISOString(), read: false };
    setNotifications((prev) => [notification, ...prev]);
    if (type === 'new_order') {
      setNewOrderAlert(true);
    }
  };

  const markNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setNewOrderAlert(false);
  };

  // Chat Message Notifications: Recipient ONLY (Sender NEVER receives notification)
  const knownMessageIds = useRef(new Set());
  const messagesBaselineReady = useRef(false);

  const fetchMessages = async (orderId, channel) => {
    try {
      const endpoint = channel ? `/chat/${orderId}?channel=${channel}` : `/chat/${orderId}`;
      const data = await api(endpoint);
      if (Array.isArray(data)) {
        const messages = data.map((m) => ({
          id: m.id,
          channel: m.channel || 'customer_rider',
          sender: m.sender,
          senderName: m.senderName,
          receiver: m.receiver,
          text: m.text,
          status: m.status || 'read',
          timestamp: m.timestamp,
          deliveredAt: m.deliveredAt,
          readAt: m.readAt
        }));

        // Deduplication & Recipient-only Notification Trigger
        const myRole = isAdminLoggedIn ? 'admin' : isRiderLoggedIn ? 'rider' : 'customer';
        const newUnseenMsgs = messages.filter(m => !knownMessageIds.current.has(m.id));

        if (messagesBaselineReady.current && newUnseenMsgs.length > 0) {
          const recipientNewMsgs = newUnseenMsgs.filter(m => m.sender !== myRole);
          if (recipientNewMsgs.length > 0) {
            playSingleBellSound();
            const lastMsg = recipientNewMsgs[recipientNewMsgs.length - 1];
            sendBrowserNotification(
              `New Message from ${lastMsg.senderName} 💬`,
              lastMsg.text,
              isAdminLoggedIn ? '/admin/orders' : isRiderLoggedIn ? '/rider/orders' : '/orders'
            );
          }
        }

        messages.forEach(m => knownMessageIds.current.add(m.id));
        messagesBaselineReady.current = true;

        setChatConversations((prev) => {
          const existing = prev.find((c) => c.orderId === orderId);
          if (existing) {
            const otherMsgs = channel ? (existing.messages || []).filter(m => m.channel !== channel) : [];
            const merged = [...otherMsgs, ...messages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            const uniqueMap = new Map();
            merged.forEach(m => uniqueMap.set(m.id, m));
            const uniqueMsgs = Array.from(uniqueMap.values());
            return prev.map((c) => c.orderId === orderId ? { ...c, messages: uniqueMsgs } : c);
          }
          return [...prev, { orderId, participants: ['customer', 'admin', 'rider'], messages }];
        });
      }
    } catch (error) {
      console.error('Failed to fetch messages', error);
    }
  };

  // Unified Single Polling Loop for Orders & Notifications (Admin & Rider)
  const knownAdminOrderIds = useRef(new Set());
  const adminOrdersBaselineReady = useRef(false);

  const knownRiderOrderIds = useRef(new Set());
  const riderOrdersBaselineReady = useRef(false);

  useEffect(() => {
    if (!isAdminLoggedIn && !isRiderLoggedIn) {
      adminOrdersBaselineReady.current = false;
      riderOrdersBaselineReady.current = false;
      knownAdminOrderIds.current = new Set();
      knownRiderOrderIds.current = new Set();
      return undefined;
    }

    requestBrowserNotificationPermission();
    let cancelled = false;

    const pollOrders = async () => {
      const orders = await fetchOrders();
      if (cancelled || !Array.isArray(orders)) return;

      // 1. Customer Places New Order Event -> Admin Notification
      if (isAdminLoggedIn) {
        if (adminOrdersBaselineReady.current) {
          const newOrders = orders.filter(o => !knownAdminOrderIds.current.has(o.orderId));
          newOrders.forEach(order => {
            playSingleBellSound();
            sendBrowserNotification(
              'New Order Received! 🛒',
              `Order #${order.orderId} from ${order.customerName} - ${formatPrice(Number(order.total))}`,
              '/admin/orders'
            );
            addNotification(
              'New Order Received!',
              `Order ${order.orderId} from ${order.customerName} — ${formatPrice(Number(order.total))}`,
              'new_order'
            );
          });
        }
        knownAdminOrderIds.current = new Set(orders.map(o => o.orderId));
        adminOrdersBaselineReady.current = true;
      }

      // 2. Rider Assigned Event -> Rider Notification
      if (isRiderLoggedIn) {
        if (riderOrdersBaselineReady.current) {
          const newlyAssigned = orders.filter(o => !knownRiderOrderIds.current.has(o.orderId));
          newlyAssigned.forEach(order => {
            playSingleBellSound();
            sendBrowserNotification(
              'New Delivery Assigned! 🛵',
              `Order #${order.orderId} for ${order.customerName} - ${order.address}`,
              '/rider/orders'
            );
            addNotification(
              'New Delivery Assigned!',
              `Order ${order.orderId} assigned to you for delivery.`,
              'rider_assigned'
            );
          });
        }
        knownRiderOrderIds.current = new Set(orders.map(o => o.orderId));
        riderOrdersBaselineReady.current = true;
      }
    };

    pollOrders();
    const interval = window.setInterval(pollOrders, 2000); // Clean 2-second single loop
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isAdminLoggedIn, isRiderLoggedIn]);

  // Admin Menu CRUD Functions
  const addMenuItem = async (newItem) => {
    const isFormData = newItem instanceof FormData;
    try {
      const saved = await api('/menu-items', {
        method: 'POST',
        body: isFormData ? newItem : JSON.stringify({
          ...newItem,
          price: parseFloat(newItem.price),
          isAvailable: newItem.isAvailable !== false,
          options: newItem.options || { spiceLevels: ['Mild', 'Spicy'], additions: [] },
        })
      });
      if (saved?.id) {
        setMenuItems(prev => [saved, ...prev]);
      }
    } catch (error) {
      console.error('Failed to add menu item', error);
    }
    fetchMenuItems();
  };

  const editMenuItem = async (updatedItem, optionalId = null) => {
    const isFormData = updatedItem instanceof FormData;
    const itemId = optionalId || (isFormData ? updatedItem.get('id') : updatedItem.id);
    try {
      const saved = await api(`/menu-items/${itemId}`, {
        method: 'PUT',
        body: isFormData ? updatedItem : JSON.stringify(updatedItem)
      });
      if (saved?.id) {
        setMenuItems(prev => prev.map(i => (i.id === saved.id ? saved : i)));
      }
    } catch (error) {
      console.error('Failed to edit menu item', error);
    }
    fetchMenuItems();
  };

  const deleteMenuItem = async (itemId) => {
    try {
      await api(`/menu-items/${itemId}`, { method: 'DELETE' });
      setMenuItems(prev => prev.filter(i => i.id !== itemId));
    } catch (error) {
      console.error('Failed to delete menu item', error);
    }
    fetchMenuItems();
  };

  const toggleItemAvailability = async (itemId) => {
    const currentItem = menuItems.find((item) => item.id === itemId);
    if (!currentItem) return;

    try {
      const saved = await api(`/menu-items/${itemId}`, { method: 'PUT', body: JSON.stringify({ ...currentItem, isAvailable: !currentItem.isAvailable }) });
      setMenuItems(prev => saved?.id ? prev.map(i => (i.id === saved.id ? saved : i)) : prev);
    } catch (error) {
      console.error('Failed to toggle availability', error);
    }
    fetchMenuItems();
  };

  // -- Category CRUD --
  const addCategory = async (name) => {
    try {
      const saved = await api('/categories', { method: 'POST', body: JSON.stringify({ name }) });
      if (saved?.id) {
        setCategories(prev => [...prev, saved]);
        return saved;
      }
    } catch (error) {
      console.error('Failed to add category', error);
    }
    fetchCategories();
    return null;
  };

  const editCategory = async (id, name) => {
    try {
      const saved = await api(`/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name }) });
      if (saved?.id) {
        setCategories(prev => prev.map(c => (c.id === saved.id ? saved : c)));
      }
    } catch (error) {
      console.error('Failed to edit category', error);
    }
    fetchCategories();
  };

  const deleteCategory = async (id) => {
    try {
      const result = await api(`/categories/${id}`, { method: 'DELETE' });
      if (result?.success !== false) {
        setCategories(prev => prev.filter(c => c.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete category', error);
      return false;
    }
  };

  // -- Deal CRUD --
  const addDeal = async (formData) => {
    try {
      const saved = await api('/deals', { method: 'POST', body: formData });
      if (saved?.id) {
        setDeals(prev => [saved, ...prev]);
      }
    } catch (error) {
      console.error('Failed to add deal', error);
    }
    fetchDeals();
  };

  const editDeal = async (id, formData) => {
    try {
      const saved = await api(`/deals/${id}`, { method: 'PUT', body: formData });
      if (saved?.id) {
        setDeals(prev => prev.map(d => (d.id === saved.id ? saved : d)));
      }
    } catch (error) {
      console.error('Failed to edit deal', error);
    }
    fetchDeals();
  };

  const deleteDeal = async (id) => {
    try {
      await api(`/deals/${id}`, { method: 'DELETE' });
      setDeals(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete deal', error);
    }
    fetchDeals();
  };

  // Admin Promo Code Functions
  const addOrUpdatePromo = async (promoObj) => {
    try {
      const saved = await api('/promos', { method: 'POST', body: JSON.stringify(promoObj) });
      setPromos(prev => saved?.code ? { ...prev, [saved.code]: saved } : prev);
    } catch (error) {
      console.error('Failed to save promo', error);
    }
    fetchPromos();
  };

  const togglePromoActive = async (code) => {
    const currentPromo = promos[code];
    if (!currentPromo) return;

    try {
      const saved = await api(`/promos/${code}`, { method: 'PUT', body: JSON.stringify({ ...currentPromo, isActive: !currentPromo.isActive }) });
      setPromos(prev => saved?.code ? { ...prev, [code]: saved } : prev);
    } catch (error) {
      console.error('Failed to toggle promo', error);
    }
    fetchPromos();
  };

  const addStaffMember = async (staff) => {
    try {
      const saved = await api('/staff-members', { method: 'POST', body: JSON.stringify(staff) });
      setStaffMembers(prev => saved?.id ? [saved, ...prev] : prev);
    } catch (error) {
      console.error('Failed to add staff member', error);
    }
    fetchStaff();
  };

  const editStaffMember = async (staff) => {
    try {
      const saved = await api(`/staff-members/${staff.id}`, { method: 'PUT', body: JSON.stringify(staff) });
      setStaffMembers(prev => saved?.id ? prev.map(m => (m.id === saved.id ? saved : m)) : prev);
    } catch (error) {
      console.error('Failed to edit staff member', error);
    }
    fetchStaff();
  };

  const deleteStaffMember = async (staffId) => {
    try {
      await api(`/staff-members/${staffId}`, { method: 'DELETE' });
      setStaffMembers(prev => prev.filter(m => m.id !== staffId));
    } catch (error) {
      console.error('Failed to delete staff member', error);
    }
    fetchStaff();
  };

  // Dedicated Rider CRUD Functions
  const addRider = async (riderPayload) => {
    try {
      const saved = await api('/riders', { method: 'POST', body: JSON.stringify(riderPayload) });
      if (saved?.id) setRiders(prev => [saved, ...prev]);
    } catch (error) {
      console.error('Failed to add rider', error);
      throw error;
    }
    fetchRiders();
  };

  const editRider = async (riderId, riderPayload) => {
    try {
      const saved = await api(`/riders/${riderId}`, { method: 'PUT', body: JSON.stringify(riderPayload) });
      if (saved?.id) setRiders(prev => prev.map(r => (r.id === saved.id ? saved : r)));
    } catch (error) {
      console.error('Failed to edit rider', error);
      throw error;
    }
    fetchRiders();
  };

  const deleteRider = async (riderId) => {
    try {
      await api(`/riders/${riderId}`, { method: 'DELETE' });
      setRiders(prev => prev.filter(r => r.id !== riderId));
    } catch (error) {
      console.error('Failed to delete rider', error);
    }
    fetchRiders();
  };

  const toggleRiderStatus = async (riderId) => {
    try {
      const saved = await api(`/riders/${riderId}/toggle-status`, { method: 'POST' });
      if (saved?.id) setRiders(prev => prev.map(r => (r.id === saved.id ? saved : r)));
    } catch (error) {
      console.error('Failed to toggle rider status', error);
    }
    fetchRiders();
  };

  const resetRiderPassword = async (riderId, newPassword) => {
    try {
      await api(`/riders/${riderId}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword }) });
      return true;
    } catch (error) {
      console.error('Failed to reset rider password', error);
      return false;
    }
  };

  const updateRiderProfile = async (profileData) => {
    try {
      const updated = await api('/rider/profile', { method: 'PUT', body: JSON.stringify(profileData) });
      if (updated?.id) setRiderProfile(prev => ({ ...prev, ...updated }));
      return updated;
    } catch (error) {
      console.error('Failed to update rider profile', error);
      throw error;
    }
  };

  const addInventoryItem = async (item) => {
    try {
      const saved = await api('/inventory-items', { method: 'POST', body: JSON.stringify(item) });
      setInventoryItems(prev => saved?.id ? [saved, ...prev] : prev);
    } catch (error) {
      console.error('Failed to add inventory item', error);
    }
    fetchInventory();
  };

  const editInventoryItem = async (item) => {
    try {
      const saved = await api(`/inventory-items/${item.id}`, { method: 'PUT', body: JSON.stringify(item) });
      setInventoryItems(prev => saved?.id ? prev.map(inv => (inv.id === saved.id ? saved : inv)) : prev);
    } catch (error) {
      console.error('Failed to edit inventory item', error);
    }
    fetchInventory();
  };

  const deleteInventoryItem = async (itemId) => {
    try {
      await api(`/inventory-items/${itemId}`, { method: 'DELETE' });
      setInventoryItems(prev => prev.filter(inv => inv.id !== itemId));
    } catch (error) {
      console.error('Failed to delete inventory item', error);
    }
    fetchInventory();
  };

  const recordStockTransaction = (itemId, itemName, type, quantity, note = '') => {
    const transaction = {
      id: Date.now(),
      itemId,
      itemName,
      type,
      quantity,
      note,
      timestamp: new Date().toISOString(),
    };
    setStockTransactions(prev => [transaction, ...prev]);
  };

  const exportInventoryCSV = () => {
    const headers = ['Name,Category,SKU,Barcode,Stock,Unit,Threshold,Cost,Active'];
    const rows = inventoryItems.map(item =>
      `"${item.name}","${item.category}","${item.sku || ''}","${item.barcode || ''}",${item.stockCount},"${item.unit}",${item.restockThreshold},${item.cost},${item.isActive !== false}`
    );
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!checkoutToast) return;
    const timer = setTimeout(() => setCheckoutToast(null), 4500);
    return () => clearTimeout(timer);
  }, [checkoutToast]);

  // Guest History Cross-Device Recovery
  const checkGuestHistory = async (phone) => {
    if (!phone || user || isAdminLoggedIn || isRiderLoggedIn) return { hasHistory: false };
    const guestId = getOrCreateGuestId();
    try {
      const res = await api(`/guest/history/check?phone=${encodeURIComponent(phone)}&guest_id=${encodeURIComponent(guestId)}`);
      return res || { hasHistory: false };
    } catch (e) {
      console.error('Failed to check guest history', e);
      return { hasHistory: false };
    }
  };

  const restoreGuestHistory = async (phone) => {
    if (!phone) return false;
    const guestId = getOrCreateGuestId();
    try {
      const res = await api('/guest/history/restore', {
        method: 'POST',
        body: JSON.stringify({ phone, guest_id: guestId })
      });
      if (res?.orders && Array.isArray(res.orders)) {
        setAllOrders(res.orders);
        return true;
      }
    } catch (e) {
      console.error('Failed to restore guest history', e);
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        deliveryFee,
        discountAmount,
        total,
        totalCartCount,
        appliedPromo,
        applyPromo,
        promoError,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        activeView,
        setActiveView,
        isCartOpen,
        setIsCartOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        selectedItemForModal,
        setSelectedItemForModal,
        user,
        setUser,
        activeOrder,
        setActiveOrder,
        placeOrder,
        fetchOrder,
        fetchOrders,
        checkoutToast,
        staffMembers,
        inventoryItems,
        stockTransactions,
        recordStockTransaction,
        exportInventoryCSV,
        addStaffMember,
        editStaffMember,
        deleteStaffMember,
        addInventoryItem,
        editInventoryItem,
        deleteInventoryItem,
        // Address Exports
        savedAddresses,
        setSavedAddresses,
        currentLocation,
        setCurrentLocation,
        // Chat Exports
        chatConversations,
        chatNotifications,
        activeChatOrderId,
        setActiveChatOrderId,
        sendMessage,
        fetchMessages,
        markChannelMessagesAsRead,
        // Notification Exports
        notifications,
        newOrderAlert,
        addNotification,
        markNotificationsRead,
        // Rider Exports
        riders,
        fetchRiders,
        addRider,
        editRider,
        deleteRider,
        toggleRiderStatus,
        resetRiderPassword,
        updateRiderProfile,
        assignRiderToOrder,
        // Guest History Exports
        checkGuestHistory,
        restoreGuestHistory,
        // Auth & Address Exports
        loginUser,
        userLogout,
        changeAddress,
        isRiderLoggedIn,
        riderProfile,
        riderLogin,
        riderLogout,
        staffLogin,
        staffLogout,
        // Admin Exports
        isAdminLoggedIn,
        adminLogin,
        adminLogout,
        refreshData,
        menuItems,
        allOrders,
        updateOrderStatus,
        updatePaymentStatus,
        addMenuItem,
        editMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        promos,
        addOrUpdatePromo,
        togglePromoActive,
        // Categories & Deals
        categories,
        deals,
        fetchCategories,
        fetchDeals,
        addCategory,
        editCategory,
        deleteCategory,
        addDeal,
        editDeal,
        deleteDeal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
