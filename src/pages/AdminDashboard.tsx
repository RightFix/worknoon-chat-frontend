import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Users, UserCheck, UserX, BarChart3, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { Avatar, Badge, Button, Input } from '../components/Common';
import type { User as UserType } from '../types';

interface Stats {
  totalUsers: number;
  usersByRole: Record<string, number>;
  onlineUsers: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [roleFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        userAPI.getStats(),
        userAPI.getUsers({ role: roleFilter || undefined, search: searchQuery || undefined }),
      ]);
      if (statsRes.success) {
        setStats(statsRes.data as Stats);
      }
      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  if (!user || (user.role !== 'admin' && user.role !== 'agent')) {
    return <Navigate to="/" replace />;
  }

  const roles = ['admin', 'agent', 'customer', 'designer', 'merchant'];
  const roleColors: Record<string, string> = {
    admin: 'error',
    agent: 'primary',
    customer: 'default',
    designer: 'warning',
    merchant: 'success',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <BarChart3 className="w-7 h-7" />
          Admin Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage users and monitor system activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-dark-card rounded-xl p-5 shadow-sm border border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.totalUsers || 0}</p>
            </div>
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <Users className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl p-5 shadow-sm border border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Online Now</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.onlineUsers || 0}</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl p-5 shadow-sm border border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Merchants</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.usersByRole?.merchant || 0}</p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Shield className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl p-5 shadow-sm border border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Designers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.usersByRole?.designer || 0}</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Shield className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-200 dark:border-dark-border">
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-input text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role} value={role} className="capitalize">
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-input">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-dark-input">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.avatar} alt={u.username} size="sm" isOnline={u.isOnline} showStatus />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{u.username}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={roleColors[u.role] as any} size="sm" className="capitalize">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${u.isOnline ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {u.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;