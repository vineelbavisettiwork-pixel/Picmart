import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import CategoriesPage from "./pages/CategoriesPage";
import OrdersPage from "./pages/OrdersPage";
import AccountPage from "./pages/AccountPage";
import AccountEditPage from "./pages/AccountEditPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import ChatPage from "./pages/ChatPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import NotificationsPage from "./pages/NotificationsPage";
import AddressesPage from "./pages/AddressesPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminDiscounts from "./pages/admin/AdminDiscounts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminChat from "./pages/admin/AdminChat";
import AdminEarnings from "./pages/admin/AdminEarnings";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            {/* User Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/account/edit" element={<AccountEditPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/addresses" element={<AddressesPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminProducts />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/banners" element={<AdminBanners />} />
            <Route path="/admin/discounts" element={<AdminDiscounts />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/chat" element={<AdminChat />} />
            <Route path="/admin/earnings" element={<AdminEarnings />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/settings" element={<AdminSettings />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
