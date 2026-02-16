'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Pipeline Integrity', href: '/dashboard/pipeline-integrity', icon: '🔍' },
  { name: 'Financials', href: '/dashboard/financials', icon: '💰' },
  { name: 'Executive Insights', href: '/dashboard/executive-summary', icon: '📈' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-2xl font-light text-gray-900 hover:text-blue-600 transition-colors">
                Double V
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-light border-b-2 transition-colors ${
                      isActive
                        ? 'border-blue-600 text-gray-900'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2 text-base">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-light text-gray-600">
                  {user.email || user.username}
                </span>
                <button
                  onClick={logout}
                  className="text-sm font-light text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden border-t border-gray-200">
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`block pl-4 pr-4 py-2 text-sm font-light ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

