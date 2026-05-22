import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, User as UserIcon, Settings, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Avatar, Button } from '../Common';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100 hidden sm:block">
              WorkNoon
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-input transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-input transition-colors"
              >
                <Avatar src={user.avatar} size="sm" isOnline={user.isOnline} showStatus />
                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.username}
                </span>
              </button>

              {showDropdown && (
                <>
                  <div className="fixed inset-0" onClick={() => setShowDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border py-1 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-dark-border">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-input"
                      onClick={() => setShowDropdown(false)}
                    >
                      <UserIcon className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-input"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-error hover:bg-gray-100 dark:hover:bg-dark-input"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;