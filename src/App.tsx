import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { DesktopWrapper } from "@/components/DesktopWrapper";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Splash from "./pages/Splash";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import StudentLayout from "./pages/student/StudentLayout";
import VendorLayout from "./pages/vendor/VendorLayout";
import RiderLayout from "./pages/rider/RiderLayout";
import AdminLayout from "./pages/admin/AdminLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, role, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <DesktopWrapper>
        <Splash onDone={() => setShowSplash(false)} />
      </DesktopWrapper>
    );
  }

  return (
    <DesktopWrapper>
      <Routes>
        <Route path="/" element={user && role ? <Navigate to={`/${role}`} replace /> : <Navigate to="/auth" replace />} />
        <Route path="/auth" element={user && role ? <Navigate to={`/${role}`} replace /> : <Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/student/*" element={<ProtectedRoute allowedRoles={["student"]}><StudentLayout /></ProtectedRoute>} />
        <Route path="/vendor/*" element={<ProtectedRoute allowedRoles={["vendor"]}><VendorLayout /></ProtectedRoute>} />
        <Route path="/rider/*" element={<ProtectedRoute allowedRoles={["rider"]}><RiderLayout /></ProtectedRoute>} />
        <Route path="/admin/*" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DesktopWrapper>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
