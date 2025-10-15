import React, { useState } from 'react';
import { 
  LogOut, 
  Menu, 
  X, 
  Home,
  Users,
  FileText,
  BarChart3,
  Settings,
  Phone,
  Building2,
  Shield,
  UserCheck
} from 'lucide-react';

interface LayoutProps {
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
  menuItems: Array<{
    name: string;
    icon: any;
    active?: boolean;
    onClick?: () => void;
  }>;
  title: string;
  roleColor: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  user, 
  onLogout, 
  children, 
  menuItems,
  title,
  roleColor 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin': return Shield;
      case 'companyadmin': return Building2;
      case 'teamincharge': return UserCheck;
      case 'telecaller': return Phone;
      default: return Users;
    }
  };

  const RoleIcon = getRoleIcon(user.role);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className={`${roleColor} rounded-lg p-2 mr-3`}>
              <RoleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-5 px-2">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                onClick={item.onClick}
                className={`${
                  item.active
                    ? `${roleColor} text-white`
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full mb-1 transition-colors duration-200`}
              >
                <IconComponent className="mr-3 flex-shrink-0 h-5 w-5" />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="flex items-center mb-3">
            <div className={`${roleColor} rounded-full p-2 mr-3`}>
              <RoleIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role.replace(/([a-z])([A-Z])/g, '$1 $2')}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center w-full px-2 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors duration-200"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            </div>

            <div className="flex items-center">
              <span className="text-sm text-gray-500">Welcome back, {user.name}</span>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;