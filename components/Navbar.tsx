
import React, { useState, useRef, useEffect } from 'react';
import { ViewState, User } from '../types';
import { ShieldCheck, Menu, X, LogIn, UserCircle, LogOut, ChevronDown, UserPlus, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, user, onLogout }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [
    { label: 'Home', value: ViewState.HOME },
    // Conditional Navigation Items
    ...(user ? [
      { label: 'My Dashboard', value: ViewState.DASHBOARD },
      { label: 'Verify Credentials', value: ViewState.CANDIDATE },
    ] : [
      { label: 'For Candidates', value: ViewState.CANDIDATE },
    ]),
    { label: 'For Employers', value: ViewState.EMPLOYER },
  ];

  const handleNavClick = (value: ViewState) => {
    onNavigate(value);
    setIsMobileOpen(false);
  };

  const handleAuthAction = (view: ViewState) => {
    onNavigate(view);
    setIsProfileOpen(false);
    setIsMobileOpen(false);
  };

  return (
    <nav className="border-b border-white/10 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={() => onNavigate(ViewState.HOME)}>
            <div className="bg-gradient-to-br from-cardano to-cardano-accent p-2 rounded-lg mr-3 shadow-lg group-hover:shadow-cardano-accent/20 transition-all">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">
              Skill<span className="text-transparent bg-clip-text bg-gradient-to-r from-cardano-accent to-emerald-400">Chain</span>
            </span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-baseline space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => onNavigate(item.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    currentView === item.value
                      ? 'text-white bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Profile Dropdown */}
            <div className="pl-6 border-l border-white/10 relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors focus:outline-none group"
              >
                <div className={`p-2 rounded-full transition-all ${user ? 'bg-cardano-accent/20 text-cardano-accent ring-2 ring-cardano-accent/50' : 'bg-white/10 group-hover:bg-white/20'}`}>
                  <UserCircle className="h-6 w-6" />
                </div>
                {user && (
                   <div className="hidden lg:block text-left">
                      <p className="text-xs font-medium text-white leading-none">{user.name}</p>
                      <p className="text-[10px] text-cardano-accent leading-none mt-1 capitalize">{user.role}</p>
                   </div>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl py-2 z-50 transform origin-top-right animate-in fade-in slide-in-from-top-2 duration-200">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-slate-700/50 mb-2">
                        <p className="text-sm text-white font-semibold">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        <p className="text-[10px] text-emerald-400 mt-1">Identity Verified</p>
                      </div>
                      <button 
                        onClick={() => {
                          onLogout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3 border-b border-slate-700/50 mb-2">
                         <p className="text-sm text-slate-400">Welcome to SkillChain</p>
                         <p className="text-xs text-slate-500">Log in to verify skills</p>
                      </div>
                      <button 
                        onClick={() => handleAuthAction(ViewState.LOGIN)}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-800 flex items-center gap-2"
                      >
                        <LogIn className="h-4 w-4 text-cardano-accent" /> Log In
                      </button>
                      <button 
                        onClick={() => handleAuthAction(ViewState.SIGNUP)}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-800 flex items-center gap-2"
                      >
                        <UserPlus className="h-4 w-4 text-blue-400" /> Sign Up
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="bg-white/5 inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/10 focus:outline-none"
            >
              {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.value)}
                className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                  currentView === item.value
                    ? 'text-cardano-accent bg-slate-800'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <div className="border-t border-slate-700 mt-4 pt-4 pb-2">
              {user ? (
                <div className="px-3 space-y-3">
                   <div className="flex items-center gap-3">
                     <div className="bg-cardano-accent/20 p-2 rounded-full">
                        <UserCircle className="h-6 w-6 text-cardano-accent" />
                     </div>
                     <div>
                        <div className="text-white font-medium">{user.name}</div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                     </div>
                   </div>
                   <button 
                      onClick={() => { onLogout(); setIsMobileOpen(false); }} 
                      className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 py-2 rounded-lg text-sm font-medium border border-red-500/20"
                   >
                     <LogOut className="h-4 w-4" /> Logout
                   </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-3">
                  <button 
                    onClick={() => handleAuthAction(ViewState.LOGIN)}
                    className="w-full text-center py-2 text-slate-300 border border-slate-600 rounded-lg flex items-center justify-center gap-2"
                  >
                    <LogIn className="h-4 w-4" /> Log In
                  </button>
                  <button 
                    onClick={() => handleAuthAction(ViewState.SIGNUP)}
                    className="w-full text-center py-2 bg-cardano-accent text-slate-900 font-bold rounded-lg flex items-center justify-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" /> Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
