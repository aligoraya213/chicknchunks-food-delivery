import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryBar } from './components/CategoryBar';
import { MenuSection } from './components/MenuSection';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutView } from './components/CheckoutView';
import { OrderTracker } from './components/OrderTracker';
import { MyOrders } from './components/MyOrders';
import { ItemModal } from './components/ItemModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { MessageSquare } from 'lucide-react';
import { StaffLogin } from './components/StaffLogin';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { RiderDashboard } from './components/Rider/RiderDashboard';
import { ChatWindow } from './components/Chat/ChatWindow';

// Protected Route Guard for Role-based Access Control
const ProtectedRoute = ({ allowedRole, children }) => {
  const { isAdminLoggedIn, isRiderLoggedIn } = useApp();

  if (allowedRole === 'admin') {
    if (!isAdminLoggedIn) {
      return <Navigate to="/login" replace />;
    }
  }

  if (allowedRole === 'rider') {
    if (!isRiderLoggedIn) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

// Route wrapper for direct item modal opening via /product/:id or /deal/:id
const ItemModalRouteWrapper = ({ isDeal }) => {
  const { id } = useParams();
  const { menuItems, deals, setSelectedItem } = useApp();

  useEffect(() => {
    if (id) {
      if (isDeal) {
        const foundDeal = deals.find(d => String(d.id) === String(id));
        if (foundDeal) setSelectedItem(foundDeal);
      } else {
        const foundItem = menuItems.find(i => String(i.id) === String(id));
        if (foundItem) setSelectedItem(foundItem);
      }
    }
  }, [id, deals, menuItems]);

  return <HomeView />;
};

// Route wrapper for order tracking direct links (/tracking/:orderId or /order/:orderId)
const OrderTrackerRouteWrapper = () => {
  const { orderId } = useParams();
  const { setActiveOrder, allOrders } = useApp();

  useEffect(() => {
    if (orderId && allOrders.length > 0) {
      const match = allOrders.find(o => String(o.orderId) === String(orderId));
      if (match) setActiveOrder(match);
    }
  }, [orderId, allOrders]);

  return <OrderTracker />;
};

// Route wrapper for /cart and /login URL modals
const ModalRouteWrapper = ({ modalType }) => {
  const { setIsCartOpen, setIsAuthModalOpen } = useApp();

  useEffect(() => {
    if (modalType === 'cart') setIsCartOpen(true);
    if (modalType === 'login' || modalType === 'signup') setIsAuthModalOpen(true);
  }, [modalType]);

  return <HomeView />;
};

// Home View (Hero + Categories + Menu)
const HomeView = () => (
  <>
    <HeroBanner />
    <CategoryBar />
    <MenuSection />
  </>
);

const AppContent = () => {
  const { checkoutToast, activeChatOrderId, setActiveChatOrderId, activeOrder } = useApp();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-900 selection:bg-red-500 selection:text-white">
      <Navbar />

      {checkoutToast && (
        <div className="fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-900 shadow-xl shadow-emerald-200/50">
          {checkoutToast}
        </div>
      )}

      <main className="flex-1 overflow-x-hidden">
        <Routes>
          {/* Customer Public Routes */}
          <Route path="/" element={<HomeView />} />
          <Route path="/menu" element={<HomeView />} />
          <Route path="/product/:id" element={<ItemModalRouteWrapper isDeal={false} />} />
          <Route path="/deal/:id" element={<ItemModalRouteWrapper isDeal={true} />} />
          <Route path="/cart" element={<ModalRouteWrapper modalType="cart" />} />
          <Route path="/checkout" element={<CheckoutView />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/tracking" element={<OrderTracker />} />
          <Route path="/order/:orderId" element={<OrderTrackerRouteWrapper />} />
          <Route path="/tracking/:orderId" element={<OrderTrackerRouteWrapper />} />
          <Route path="/login" element={<ModalRouteWrapper modalType="login" />} />
          <Route path="/signup" element={<ModalRouteWrapper modalType="signup" />} />
          <Route path="/profile" element={<HomeView />} />

          {/* Rider Protected Routes */}
          <Route
            path="/rider"
            element={
              <ProtectedRoute allowedRole="rider">
                <RiderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rider/orders"
            element={
              <ProtectedRoute allowedRole="rider">
                <RiderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rider/profile"
            element={
              <ProtectedRoute allowedRole="rider">
                <RiderDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard initialTab="dashboard" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard initialTab="dashboard" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard initialTab="orders" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/menu"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard initialTab="menu" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/deals"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard initialTab="deals" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard initialTab="inventory" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard initialTab="staff" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/riders"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard initialTab="riders" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard initialTab="promos" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/promos"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard initialTab="promos" />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <CartDrawer />
      <ItemModal />
      <AuthModal />

      {activeChatOrderId && (
        <ChatWindow
          orderId={typeof activeChatOrderId === 'object' ? activeChatOrderId.orderId : activeChatOrderId}
          initialChannel={typeof activeChatOrderId === 'object' ? activeChatOrderId.channel : null}
          onClose={() => setActiveChatOrderId(null)}
        />
      )}

      {activeOrder?.orderId && !location.pathname.startsWith('/admin') && !activeChatOrderId && (
        <button
          onClick={() => setActiveChatOrderId(activeOrder.orderId)}
          className="fixed bottom-6 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E31E24] to-[#FF6B35] text-white shadow-xl shadow-red-500/30 transition hover:scale-105 active:scale-95"
          title="Chat with support"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
      )}

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
