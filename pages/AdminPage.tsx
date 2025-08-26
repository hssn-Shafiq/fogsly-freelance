import React, { useState, useEffect, useMemo } from 'react';
import { ToastContainer } from 'react-toastify';
import AdminAuthPage from './AdminAuthPage';
import AdminPanelLayout from '../components/admin/AdminPanelLayout';
import AdminDashboard from '../components/admin/AdminDashboard';
import ThemeManagement from '../components/admin/ThemeManagement';
import AdsManagement from '../components/admin/ads/AdsManagement';
import CreateEditAdModal from '../components/admin/ads/CreateEditAdModal';
import FogCoinManagement from '../components/admin/fogcoin/FogCoinManagement';
import PaymentManagementPage from './admin/PaymentManagementPage';
import PaymentMethodsPage from './admin/PaymentMethodsPage';
import { AdminUser, AdminRoute } from '../firebase/types/admin';
import { Ad } from '../firebase/types/ads';
import { onAdminAuthStateChange } from '../firebase/services/adminAuthService';
import 'react-toastify/dist/ReactToastify.css';

interface AdminPageProps {
  navigate: (route: string) => void;
}

export default function AdminPage({ navigate }: AdminPageProps) {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRoute, setActiveRoute] = useState<AdminRoute>('dashboard');
  // Ads modal state
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  useEffect(() => {
    // Listen for admin authentication state changes
    const unsubscribe = onAdminAuthStateChange((admin) => {
      setCurrentAdmin(admin);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAdminLogin = (admin: AdminUser) => {
    setCurrentAdmin(admin);
  };

  const handleAdminLogout = () => {
    setCurrentAdmin(null);
    setActiveRoute('dashboard');
  };

  const goBackToWebsite = () => {
    navigate('home');
  };

  // Memoize the page content to prevent unnecessary re-renders
  const pageContent = useMemo(() => {
    if (!currentAdmin) return null;

    switch (activeRoute) {
      case 'dashboard':
        return <AdminDashboard currentAdmin={currentAdmin} />;
      case 'theme-management':
        return <ThemeManagement currentAdminId={currentAdmin.uid} />;
      case 'ads-management':
        return (
          <AdsManagement
            onCreateNew={() => { 
              console.log('Creating new ad'); 
              setEditingAd(null); 
              setAdModalOpen(true); 
            }}
            onEditAd={(ad) => { 
              console.log('Editing ad:', ad); 
              setEditingAd(ad); 
              setAdModalOpen(true); 
            }}
            onViewAd={() => {}}
            navigate={navigate}
          />
        );
      case 'fogcoin-management':
        return <FogCoinManagement currentAdminId={currentAdmin.uid} />;
      case 'payment-management':
        return <PaymentManagementPage navigate={(route) => navigate(route as string)} />;
      case 'payment-methods':
        return <PaymentMethodsPage navigate={(route) => navigate(route as string)} />;
      case 'user-management':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">User Management</h2>
            <p className="text-[--color-text-secondary]">Coming soon...</p>
          </div>
        );
      case 'content-management':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Content Management</h2>
            <p className="text-[--color-text-secondary]">Coming soon...</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Analytics</h2>
            <p className="text-[--color-text-secondary]">Coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">System Settings</h2>
            <p className="text-[--color-text-secondary]">Coming soon...</p>
          </div>
        );
      default:
        return <AdminDashboard currentAdmin={currentAdmin} />;
    }
  }, [activeRoute, currentAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[--color-bg-primary]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--color-primary]"></div>
      </div>
    );
  }

  if (!currentAdmin) {
    return (
      <>
        <AdminAuthPage 
          onAdminLogin={handleAdminLogin} 
          goBack={goBackToWebsite}
        />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick
          draggable
          pauseOnHover
          theme="colored"
          aria-label="Notifications"
        />
      </>
    );
  }

  return (
    <>
      <AdminPanelLayout
        currentAdmin={currentAdmin}
        activeRoute={activeRoute}
        onRouteChange={setActiveRoute}
        onLogout={handleAdminLogout}
      >
        {pageContent}
        {/* Ad Create/Edit Modal */}
        {activeRoute === 'ads-management' && (
          <CreateEditAdModal
            isOpen={adModalOpen}
            onClose={() => {
              console.log('Closing modal');
              setAdModalOpen(false);
              setEditingAd(null); // Clear editing ad when closing
            }}
            editingAd={editingAd}
            currentAdminId={currentAdmin.uid}
            onSuccess={() => { 
              console.log('Ad save successful');
              setAdModalOpen(false); 
              setEditingAd(null);
            }}
          />
        )}
      </AdminPanelLayout>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        draggable
        pauseOnHover
        theme="colored"
        aria-label="Notifications"
      />
    </>
  );
}
