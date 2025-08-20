import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Palette, 
  Activity, 
  TrendingUp,
  Eye,
  Settings as SettingsIcon
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
    todayLogins: 0
  });

  useEffect(() => {
    // Load dashboard stats
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    // This would typically fetch real data from Firestore
    // For now, we'll use mock data
    setStats({
      totalUsers: 1250,
      totalThemes: 8,
      activeThemes: 5,
      todayLogins: 89
    });
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: 'Registered users',
      color: 'text-blue-600'
    },
    {
      title: 'Custom Themes',
      value: stats.totalThemes,
      icon: Palette,
      description: 'Created themes',
      color: 'text-purple-600'
    },
    {
      title: 'Active Themes',
      value: stats.activeThemes,
      icon: Eye,
      description: 'Currently active',
      color: 'text-green-600'
    },
    {
      title: "Today's Logins",
      value: stats.todayLogins,
      icon: Activity,
      description: 'Users logged in today',
      color: 'text-orange-600'
    }
  ];

  const recentActivities = [
    { action: 'Theme "Ocean Blue" created', time: '2 hours ago', user: 'Admin' },
    { action: 'User "john@example.com" registered', time: '3 hours ago', user: 'System' },
    { action: 'Theme "Dark Pro" activated', time: '5 hours ago', user: 'Super Admin' },
    { action: 'Theme "Sunset" updated', time: '1 day ago', user: 'Admin' },
  ];

  const quickActions = [
    {
      title: 'Create New Theme',
      description: 'Design a custom theme',
      icon: Palette,
      action: () => console.log('Navigate to theme creation')
    },
    {
      title: 'View Users',
      description: 'Manage user accounts',
      icon: Users,
      action: () => console.log('Navigate to user management')
    },
    {
      title: 'System Settings',
      description: 'Configure system settings',
      icon: SettingsIcon,
      action: () => console.log('Navigate to settings')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {currentAdmin.displayName || 'Admin'}! 👋
        </h1>
        <p className="opacity-90">
          Here's an overview of your FOGSLY admin panel activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-[--color-text-secondary]">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-[--color-primary] rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.action}
                    </p>
                    <p className="text-xs text-[--color-text-secondary]">
                      {activity.time} by {activity.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full flex items-center space-x-4 p-3 rounded-lg hover:bg-[--color-bg-secondary] transition-colors text-left"
                >
                  <action.icon className="h-5 w-5 text-[--color-primary]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="text-xs text-[--color-text-secondary]">
                      {action.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Info */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Information</CardTitle>
          <CardDescription>Your admin account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-[--color-text-secondary]">Email</label>
              <p className="text-sm">{currentAdmin.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[--color-text-secondary]">Role</label>
              <p className="text-sm capitalize">{currentAdmin.role}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[--color-text-secondary]">Last Login</label>
              <p className="text-sm">
                {currentAdmin.lastLoginAt.toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="text-sm font-medium text-[--color-text-secondary]">Permissions</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {currentAdmin.permissions.map((permission) => (
                <span
                  key={permission}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[--color-primary]/10 text-[--color-primary]"
                >
                  {permission.replace('-', ' ').toUpperCase()}
                </span>
              ))}
              {currentAdmin.role === 'super-admin' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  ALL PERMISSIONS
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
