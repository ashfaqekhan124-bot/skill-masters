import { useState, useEffect } from 'react';
import { GraduationCap, Home, PlayCircle, Gift, LayoutDashboard, LogIn, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, getPathOnly } from '@/context/RouterContext';

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const { path, navigate } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const currentPath = getPathOnly(path);

  useEffect(() => {
    setMobileOpen(false);
    setProfileDropdown(false);
  }, [path]);

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Courses', path: '/courses', icon: PlayCircle },
    { label: 'Refer & Earn', path: '/refer', icon: Gift },
  ];

  const isActive = (p: string) => {
    if (p === '/') return currentPath === '/';
    return currentPath.startsWith(p);
  };

  function handleSignOut() {
    signOut();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-700 font-bold text-xl shrink-0"
          >
            <GraduationCap className="w-7 h-7" />
            <span className="hidden sm:inline">SkillMaster</span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}

            {profile?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/admin')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Admin Panel
              </button>
            )}
          </nav>

          {/* Auth section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>

                <div className="relative">
                  <button
                    onClick={() => setProfileDropdown(!profileDropdown)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center text-sm font-semibold">
                      {profile?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                      {profile?.name || 'User'}
                    </span>
                  </button>

                  {profileDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{profile?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4" /> My Dashboard
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}

            {profile?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                  isActive('/admin')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Admin Panel
              </button>
            )}

            <div className="pt-3 border-t border-gray-100">
              {user ? (
                <>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-4 py-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
