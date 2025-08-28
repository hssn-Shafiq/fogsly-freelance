import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Shield,
  PlayCircle,
  DollarSign,
  CreditCard,
  Building,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  User,
  Home,
  ChevronDown
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
    permission: null,
    color: 'text-blue-500'
  },
  { 
    id: 'theme-management' as AdminRoute, 
    label: 'Theme Management', 
    icon: Palette,
    permission: 'theme-management',
    color: 'text-purple-500'
  },
  { 
    id: 'ads-management' as AdminRoute, 
    label: 'Ads Management', 
    icon: PlayCircle,
    permission: 'ads-management',
    color: 'text-green-500'
  },
  { 
    id: 'fogcoin-management' as AdminRoute, 
    label: 'FOG Coin Management', 
    icon: DollarSign,
    permission: null,
    color: 'text-yellow-500'
  },
  { 
    id: 'payment-management' as AdminRoute, 
    label: 'Payment Requests', 
    icon: CreditCard,
    permission: 'payment-management',
    color: 'text-emerald-500'
  },
  { 
    id: 'payment-methods' as AdminRoute, 
    label: 'Payment Methods', 
    icon: Building,
    permission: 'payment-management',
    color: 'text-indigo-500'
  },
  { 
    id: 'user-management' as AdminRoute, 
    label: 'User Management', 
    icon: Users,
    permission: 'user-management',
    color: 'text-cyan-500'
  },
  { 
    id: 'content-management' as AdminRoute, 
    label: 'Content Management', 
    icon: FileText,
    permission: 'content-management',
    color: 'text-orange-500'
  },
  { 
    id: 'analytics' as AdminRoute, 
    label: 'Analytics', 
    icon: BarChart3,
    permission: 'analytics-view',
    color: 'text-pink-500'
  },
  { 
    id: 'settings' as AdminRoute, 
    label: 'Settings', 
    icon: Settings,
    permission: 'system-settings',
    color: 'text-gray-500'
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Handle route change with loading state
  const handleRouteChange = async (route: AdminRoute) => {
    setLoading(true);
    onRouteChange(route);
    setSidebarOpen(false);
    
    // Simulate loading time for better UX
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await adminSignOut();
      toast.success('Logged out successfully');
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    } finally {
      setLoading(false);
    }
  };

  // Get route breadcrumbs
  const getBreadcrumbs = () => {
    const currentItem = sidebarItems.find(item => item.id === activeRoute);
    return [
      { label: 'Admin', icon: Shield },
      { label: currentItem?.label || 'Dashboard', icon: currentItem?.icon || LayoutDashboard }
    ];
  };

  // Sidebar animations
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: -280 }
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <motion.div 
      className={`flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 ${
        isMobile ? 'w-80' : sidebarCollapsed ? 'w-20' : 'w-80'
      } transition-all duration-300 border-r border-slate-700/50 shadow-2xl`}
      initial={false}
      animate={{ width: !isMobile && sidebarCollapsed ? 80 : 320 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shield className="w-7 h-7 text-white" />
            </motion.div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="font-bold text-xl text-white">FOGSLY</h2>
                  <p className="text-sm text-slate-400">Admin Panel</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-slate-400 hover:text-white p-2"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Admin Info */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div 
            className="p-4 border-b border-slate-700/50 bg-slate-800/30"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {currentAdmin.displayName?.charAt(0) || currentAdmin.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {currentAdmin.displayName || 'Admin User'}
                </p>
                <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  {currentAdmin.role || 'Administrator'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3"
            >
              Navigation
            </motion.div>
          )}
        </AnimatePresence>
        
        {sidebarItems.map((item, index) => {
          const isActive = activeRoute === item.id;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <motion.button
                onClick={() => handleRouteChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
                whileHover={{ x: isActive ? 0 : 4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <div className="relative z-10 flex items-center gap-3 w-full">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : item.color} transition-colors`} />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span 
                        className="text-sm font-medium truncate"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  {isActive && !sidebarCollapsed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-white rounded-full ml-auto"
                    />
                  )}
                </div>
              </motion.button>
              
              {/* Tooltip for collapsed sidebar */}
              {sidebarCollapsed && (
                <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-slate-800 text-white px-2 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </motion.div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
        <Button
          variant="outline"
          className={`w-full justify-start bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 ${
            sidebarCollapsed ? 'px-3' : ''
          }`}
          onClick={handleLogout}
          disabled={loading}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {!sidebarCollapsed && 'Logout'}
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 z-30">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div
              className="absolute left-0 top-0 h-full"
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              onClick={e => e.stopPropagation()}
            >
              <SidebarContent isMobile />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-80'
      }`}>
        {/* Top Bar */}
        <motion.header 
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-4 py-4 lg:px-8 sticky top-0 z-20 shadow-sm"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", bounce: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              {/* Breadcrumbs */}
              <nav className="flex items-center space-x-2 text-sm">
                {getBreadcrumbs().map((crumb, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && <ChevronRight className="w-4 h-4 text-slate-400 mx-2" />}
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <crumb.icon className="w-4 h-4" />
                      <span className="font-medium">{crumb.label}</span>
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative p-2">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  3
                </span>
              </Button>

              {/* User Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 p-2"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {currentAdmin.displayName?.charAt(0) || currentAdmin.email.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {currentAdmin.displayName || 'Admin User'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {currentAdmin.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="p-4 lg:p-8 relative">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-20"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-600 dark:text-slate-400">Loading...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
