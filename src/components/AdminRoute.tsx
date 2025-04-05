import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "@/components/AdminSidebar";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, user, loading } = useAuth();
  const [showAdminInterface, setShowAdminInterface] = useState(false);

  useEffect(() => {
    // Debug information
    console.log("Admin route check:", { 
      isAuthenticated, 
      isAdmin, 
      userRole: user?.role,
      loading
    });
    
    // Only set this once when authentication is complete
    if (!loading) {
      if (user && user.role === 'admin') {
        setShowAdminInterface(true);
      } else if (isAuthenticated && !isAdmin) {
        toast.error("You do not have administrator privileges");
      }
    }
  }, [isAuthenticated, isAdmin, user, loading]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00573c] border-t-[#00573c]" />
      </div>
    );
  }

  // For mock users, we may have isAdmin=true but isAuthenticated=false
  // This handles the fallback case for development
  if (showAdminInterface || (user && user.role === 'admin')) {
    return (
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to dashboard if authenticated but not admin
  return <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
