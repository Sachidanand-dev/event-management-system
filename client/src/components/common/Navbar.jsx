import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Ticket,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Compass,
  QrCode
} from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, isVolunteer, isStudent, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-blue-950/90 border-b border-indigo-500/20 text-xs py-1.5 px-4 text-center text-indigo-200 flex items-center justify-center gap-2 backdrop-blur-md">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span className="font-semibold text-white">NexEvent 2026:</span>
        <span>National Hackathon & Euphoria Cultural Festival registrations are now live!</span>
        <Link to="/events" className="underline hover:text-white font-medium ml-1">Explore Events &rarr;</Link>
      </div>

      {/* Main Navigation Bar */}
      <nav className="glass-panel border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all duration-300">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1 font-['Outfit']">
                Nex<span className="text-indigo-400">Event</span>
                
              </span>
             
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/events"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/events') 
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore Events
            </Link>

            {user && (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                      isActive('/admin') 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                        : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Admin Dashboard
                  </Link>
                )}

                {isVolunteer && (
                  <Link
                    to="/volunteer"
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                      isActive('/volunteer') 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                        : 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-cyan-400" />
                    Volunteer Desk
                  </Link>
                )}

                {isStudent && !isAdmin && !isVolunteer && (
                  <Link
                    to="/dashboard"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/dashboard') 
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Ticket className="w-4 h-4 text-cyan-400" />
                    Student Dashboard
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-indigo-500/40"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-white max-w-[130px] truncate">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {user.role} {user.rollNo ? `(${user.rollNo})` : ''}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}

                {isVolunteer && (
                  <Link
                    to="/volunteer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Volunteer
                  </Link>
                )}

                {!isAdmin && !isVolunteer && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all"
                  >
                    <Ticket className="w-3.5 h-3.5 text-cyan-400" />
                    Dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800/80"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Home
            </Link>
            <Link
              to="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-indigo-400" />
              Explore Events
            </Link>

            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-semibold text-amber-300 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                )}
                {isVolunteer && (
                  <Link
                    to="/volunteer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-semibold text-cyan-300 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    Volunteer Desk
                  </Link>
                )}
                {!isAdmin && !isVolunteer && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-cyan-300 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Ticket className="w-4 h-4" />
                    Student Dashboard
                  </Link>
                )}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">{user.name}</span>
                    <span className="text-[10px] text-slate-400">{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-rose-400 flex items-center gap-1 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-center text-slate-200 bg-slate-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-center text-white bg-indigo-600"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
