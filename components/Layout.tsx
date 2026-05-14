import React from 'react';
import { useApp } from '../store';
import { LogOut, Car, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Liquid Background Component
  const LiquidBackground = () => (
    <div className="liquid-bg-container">
      <div className="liquid-orb w-[600px] h-[600px] bg-indigo-600/30 top-[-10%] left-[-10%] animate-liquid-blob"></div>
      <div className="liquid-orb w-[500px] h-[500px] bg-purple-600/30 bottom-[-10%] right-[-10%] animate-liquid-blob" style={{ animationDelay: '-5s' }}></div>
      <div className="liquid-orb w-[400px] h-[400px] bg-cyan-600/20 top-[40%] left-[40%] animate-liquid-blob" style={{ animationDelay: '-10s' }}></div>
      <div className="liquid-orb w-[300px] h-[300px] bg-pink-600/20 top-[10%] right-[20%] animate-liquid-blob" style={{ animationDelay: '-15s' }}></div>
    </div>
  );

  if (!user) return (
    <>
      <LiquidBackground />
      {children}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col text-white selection:bg-primary selection:text-white relative">
      <LiquidBackground />
      
      <nav className="sticky top-0 z-50 glass-panel border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center cursor-pointer group" onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}>
              <div className="bg-gradient-to-tr from-primary to-indigo-600 p-2 rounded-xl mr-3 shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300 group-hover:rotate-12">
                <Car className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-slate-400 tracking-tight">Parkaro</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {user.role === 'user' && (
                <>
                   <Link 
                    to="/bookings" 
                    className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      location.pathname === '/bookings' 
                        ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.2)] backdrop-blur-md' 
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    My Bookings
                  </Link>
                </>
              )}
              
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                   <p className="text-sm font-bold text-white drop-shadow-md">{user.name}</p>
                   <p className="text-xs text-primary-glow font-medium capitalize tracking-wide shadow-black">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-sm font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow p-4 md:p-8 relative z-10">
        {children}
      </main>
    </div>
  );
};