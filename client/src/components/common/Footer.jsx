import { Link } from 'react-router-dom';
import { Calendar, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#070b12] border-t border-slate-800/80 text-slate-400 text-sm mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white font-['Outfit']">
                Nex<span className="text-indigo-400">Event</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              The premier unified events portal for Apex University. Empowering students, faculty, and campus organizers to host, register, and experience world-class hackathons, cultural festivals, tech symposiums, and sports championships.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Campus Event Portal Active
              </span>
            </div>
          </div>

          {/* Event Categories */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 font-['Outfit']">Event Categories</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/events?category=Technical" className="hover:text-indigo-400 transition-colors">
                  Technical & Coding
                </Link>
              </li>
              <li>
                <Link to="/events?category=Cultural" className="hover:text-indigo-400 transition-colors">
                  Cultural & Music Fests
                </Link>
              </li>
              <li>
                <Link to="/events?category=Workshop" className="hover:text-indigo-400 transition-colors">
                  Workshops & AI Seminars
                </Link>
              </li>
              <li>
                <Link to="/events?category=Sports" className="hover:text-indigo-400 transition-colors">
                  Sports & Esports Leagues
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 font-['Outfit']">Portals & Quick Links</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/events" className="hover:text-indigo-400 transition-colors">
                  All Upcoming Events
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-indigo-400 transition-colors">
                  Student Dashboard & QR Passes
                </Link>
              </li>
              <li>
                <Link to="/volunteer" className="hover:text-cyan-400 transition-colors">
                  Volunteer Operations Desk
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-400 transition-colors">
                  Account Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 font-['Outfit']">Campus Support</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li className="flex items-start gap-2 text-slate-400">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Student Affairs Center, Block-B, University Campus</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>events@apexuniversity.edu</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+91 (080) 4123-9900</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} NexEvent Platform. Apex University Student Council. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-slate-400">
              Designed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for campus students & staff
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
