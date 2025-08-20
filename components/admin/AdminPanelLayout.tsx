import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Palette, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { Button } from '../ui/Button';
import { AdminUser, AdminRoute } from '../../firebase/types/admin';
import { adminSignOut } from '../../firebase/services/adminAuthService';
import { toast } from 'react-toastify';

interface AdminPanelLayoutProps {
  currentAdmin: AdminUser;
  activeRoute: AdminRoute;
  onRouteChange: (route: AdminRoute) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const sidebarItems = [
  { 
    id: 'dashboard' as AdminRoute, 
    label: 'Dashboard', 
    icon: LayoutDashboard,
    permission: null 
  },
  { 
    id: 'theme-management' as AdminRoute, 
    label: 'Theme Management', 
    icon: Palette,
    permission: 'theme-management' 
  },
  { 
    id: 'user-management' as AdminRoute, 
    label: 'User Management', 
    icon: Users,
    permission: 'user-management' 
  },
  { 
    id: 'content-management' as AdminRoute, 
    label: 'Content Management', 
    icon: FileText,
    permission: 'content-management' 
  },
  { 
    id: 'analytics' as AdminRoute, 
    label: 'Analytics', 
    icon: BarChart3,
    permission: 'analytics-view' 
  },
  { 
    id: 'settings' as AdminRoute, 
    label: 'Settings', 
    icon: Settings,
    permission: 'system-settings' 
  },
];

export default function AdminPanelLayout({
  currentAdmin,
  activeRoute,
  onRouteChange,
  onLogout,
  children
}: AdminPanelLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hasPermission = (permission: string | null): boolean => {
    if (!permission) return true; // No permission required
    if (currentAdmin.role === 'super-admin') return true; // Super admin has all permissions
    return currentAdmin.permissions.includes(permission as any);
  };

  const handleLogout = async () => {
    try {
      await adminSignOut();
      toast.success('Logged out successfully');
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-[--color-border]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[--color-primary] rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-[--color-text-primary]">FOGSLY</h2>
            <p className="text-xs text-[--color-text-secondary]">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Admin Info */}
      <div className="p-4 border-b border-[--color-border]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[--color-primary]/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-[--color-primary]">
              {currentAdmin.displayName?.charAt(0) || currentAdmin.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[--color-text-primary] truncate">
              {currentAdmin.displayName || 'Admin'}
            </p>
            <p className="text-xs text-[--color-text-secondary] truncate">
              {currentAdmin.role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const hasAccess = hasPermission(item.permission);
          const isActive = activeRoute === item.id;
          
          if (!hasAccess) return null;

          return (
            <motion.button
              key={item.id}
              onClick={() => {
                onRouteChange(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-[--color-primary] text-white'
                  : 'text-[--color-text-secondary] hover:bg-[--color-bg-secondary] hover:text-[--color-text-primary]'
              }`}
              whileHover={{ x: isActive ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[--color-border]">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[--color-bg-primary] flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[--color-card] border-r border-[--color-border]">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <div
            className="absolute left-0 top-0 h-full w-64 bg-[--color-card] border-r border-[--color-border]"
            onClick={e => e.stopPropagation()}
          >
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Top Bar */}
        <header className="bg-[--color-card] border-b border-[--color-border] px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-[--color-bg-secondary]"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-[--color-text-primary] capitalize">
                {activeRoute.replace('-', ' ')}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm text-[--color-text-secondary]">
                Welcome, {currentAdmin.displayName || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
