import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome,
  FiSettings,
  FiBox,
  FiUsers,
  FiFileText,
  FiBarChart2,
  FiLogOut,
  FiMenu,
  FiX,
} from 'react-icons/fi';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: FiHome },
    { path: '/maintenance', label: 'Maintenance', icon: FiSettings },
    { path: '/assets', label: 'Assets', icon: FiBox },
    { path: '/reports', label: 'Reports', icon: FiBarChart2 },
  ];

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="fixed top-4 left-4 right-4 z-40">
        <div className="glass rounded-2xl px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden nav-link"
              aria-label="Toggle navigation"
            >
              {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-xl bg-blue-600" />
              <span className="font-semibold text-gray-900">GearGuard</span>
            </Link>
          </div>
          <div className="hidden lg:flex items-center space-x-2">
            <a href="#" className="nav-link">How it works</a>
            <a href="#" className="nav-link">Pricing</a>
            <button onClick={handleLogout} className="btn-ghost">Logout</button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-28 lg:top-24 left-4 z-30 h-[calc(100vh-7rem)] transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'
        } w-[72px] lg:w-64`}
      >
        <div className="card h-full p-3 lg:p-4 flex flex-col">
        
        <nav className="mt-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center rounded-xl px-3 py-2 transition-all ${
                  isActive ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-white/70'
                }`}
              >
                <Icon className="shrink-0" size={20} />
                <span className="ml-3 hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-3">
          <div className="hidden lg:block px-2 py-2 rounded-xl bg-white/60 mb-2">
            <p className="font-medium text-gray-900 text-sm">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center rounded-xl px-3 py-2 text-red-600 hover:bg-red-50 transition-colors"
          >
            <FiLogOut className="mr-2" size={18} />
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="pt-28 lg:pt-24 lg:ml-72">
        <div className="px-4 lg:px-8 max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default Layout;

