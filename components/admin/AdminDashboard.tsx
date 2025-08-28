import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  User,
  Palette, 
  Activity, 
  TrendingUp,
  Eye,
  Settings as SettingsIcon,
  DollarSign,
  PlayCircle,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Calendar,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { AdminUser } from '../../firebase/types/admin';

interface AdminDashboardProps {
  currentAdmin: AdminUser;
}

export default function AdminDashboard({ currentAdmin }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalThemes: 0,
    activeThemes: 0,
    todayLogins: 0,
    totalAds: 0,
    activeAds: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    fogCoinsDistributed: 0,
    systemHealth: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setLoading(true);
    // Simulate API call delay for realistic loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // This would typically fetch real data from Firestore
    setStats({
      totalUsers: 1250,
      totalThemes: 8,
      activeThemes: 5,
      todayLogins: 89,
      totalAds: 24,
      activeAds: 18,
      totalRevenue: 15670,
      pendingPayments: 12,
      fogCoinsDistributed: 45230,
      systemHealth: 98.7
    });
    setLastUpdated(new Date());
    setLoading(false);
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: 'Registered users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      change: '+12.5%',
      positive: true
    },
    {
      title: 'Active Themes',
      value: `${stats.activeThemes}/${stats.totalThemes}`,
      icon: Palette,
      description: 'Theme configurations',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      change: '+2',
      positive: true
    },
    {
      title: 'Today\'s Logins',
      value: stats.todayLogins.toLocaleString(),
      icon: Activity,
      description: 'Active sessions',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      change: '+8.3%',
      positive: true
    },
    {
      title: 'Active Ads',
      value: `${stats.activeAds}/${stats.totalAds}`,
      icon: PlayCircle,
      description: 'Advertisement campaigns',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      change: '+3',
      positive: true
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: 'This month',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      change: '+24.1%',
      positive: true
    },
    {
      title: 'Pending Payments',
      value: stats.pendingPayments.toLocaleString(),
      icon: CreditCard,
      description: 'Awaiting approval',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      change: '-5',
      positive: false
    },
    {
      title: 'FOG Coins Distributed',
      value: stats.fogCoinsDistributed.toLocaleString(),
      icon: Zap,
      description: 'Total circulation',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      change: '+18.7%',
      positive: true
    },
    {
      title: 'System Health',
      value: `${stats.systemHealth}%`,
      icon: TrendingUp,
      description: 'Overall performance',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      change: '+0.3%',
      positive: true
    }
  ];

  const recentActivities = [
    { action: 'New payment request submitted', time: '2 minutes ago', user: 'user@example.com' },
    { action: 'Theme "Ocean Blue" activated', time: '15 minutes ago', user: 'Admin' },
    { action: 'FOG Coins distributed to 5 users', time: '1 hour ago', user: 'System' },
    { action: 'Ad campaign "Summer Sale" launched', time: '2 hours ago', user: 'Marketing Admin' },
    { action: 'User verification completed', time: '3 hours ago', user: 'Auto-verify' },
  ];

  const quickActions = [
    {
      title: 'Create New Theme',
      description: 'Design a custom theme',
      icon: Palette,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      action: () => console.log('Navigate to theme creation')
    },
    {
      title: 'View Users',
      description: 'Manage user accounts',
      icon: Users,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      action: () => console.log('Navigate to user management')
    },
    {
      title: 'System Settings',
      description: 'Configure system settings',
      icon: SettingsIcon,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      action: () => console.log('Navigate to settings')
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {currentAdmin.displayName || 'Admin'}!
            </h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening with FOGSLY today.
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-blue-100 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
            <motion.button
              onClick={loadDashboardStats}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="relative overflow-hidden"
          >
            <Card className="h-full border-0 shadow-lg bg-white dark:bg-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {stat.description}
                      </p>
                      <div className={`flex items-center text-xs font-medium ${
                        stat.positive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.positive ? (
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 mr-1" />
                        )}
                        {stat.change}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest system activities and changes</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {activity.action}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {activity.time} by {activity.user}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-4 rounded-xl text-left transition-all ${action.color} hover:shadow-lg`}
                  >
                    <div className="flex items-center gap-3">
                      <action.icon className="w-6 h-6 text-white" />
                      <div>
                        <h3 className="font-semibold text-white text-sm">{action.title}</h3>
                        <p className="text-xs text-white/80">{action.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Admin Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Admin Information
            </CardTitle>
            <CardDescription>Your admin account details and permissions</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</label>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{currentAdmin.email}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Role</label>
                <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{currentAdmin.role}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Last Login</label>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {currentAdmin.lastLoginAt.toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 block">Permissions</label>
              <div className="flex flex-wrap gap-2">
                {currentAdmin.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                  >
                    {permission.replace('-', ' ').toUpperCase()}
                  </span>
                ))}
                {currentAdmin.role === 'super-admin' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                    ALL PERMISSIONS
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
