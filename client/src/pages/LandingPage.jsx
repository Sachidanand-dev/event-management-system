import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Sparkles,
  Search,
  ArrowRight,
  Compass,
  MapPin,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EventCard from '../components/events/EventCard';
import EventDetailsModal from '../components/events/EventDetailsModal';
import TicketModal from '../components/events/TicketModal';

export default function LandingPage() {
  const { user, token, isStudent, isAdmin, isVolunteer } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);
  const [userRegistrations, setUserRegistrations] = useState([]);

  // Fetch events
  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await api.getEvents();
        setEvents(data || []);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  // Fetch student's registered event IDs
  useEffect(() => {
    async function loadRegistrations() {
      if (token && isStudent) {
        try {
          const regs = await api.getMyRegistrations(token);
          setUserRegistrations(regs || []);
        } catch (err) {
          console.warn('Could not load user registrations:', err);
        }
      } else {
        setUserRegistrations([]);
      }
    }
    loadRegistrations();
  }, [token, isStudent]);

  const handleRegister = async (event) => {
    if (!user) {
      toast.info('Please sign in to register for events.');
      navigate('/login');
      return;
    }

    if (user.role === 'admin') {
      toast.warning('Admins manage events from the Admin Panel.');
      return;
    }

    try {
      const res = await api.registerForEvent(event.id, token);
      toast.success(`Success! Registered for ${event.title}`);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setActiveTicket(res.registration);
      setUserRegistrations(prev => [res.registration, ...prev]);
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, registeredCount: (e.registeredCount || 0) + 1 } : e));
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
  };

  const categories = ['All', 'Technical', 'Cultural', 'Workshop', 'Sports'];

  const filteredEvents = events.filter(e => {
    const matchesCat = selectedCategory === 'All' || e.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery || 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.tags && e.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCat && matchesSearch;
  });

  const featuredEvent = events.find(e => e.featured) || (events.length > 0 ? events[0] : null);

  return (
    <div className="min-h-screen text-slate-100 pb-12">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 radial-glow pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Apex University Official Campus Events Hub</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] font-['Outfit']">
              Where Campus Culture <br />
              <span className="gradient-text">Meets Innovation</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
              Discover and experience hackathons, cultural festivals, tech symposiums, and sports championships across Apex University.
            </p>

            {/* Action Buttons: Clean Login or Sign Up */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/events"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 flex items-center gap-2 transition-all"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Events</span>
              </Link>

              {user ? (
                <Link
                  to={isAdmin ? '/admin' : isVolunteer ? '/volunteer' : '/dashboard'}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-all flex items-center gap-2"
                  >
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-semibold text-sm transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="pt-3 max-w-lg mx-auto">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events by title or venue..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURED SPOTLIGHT (Only if real event exists) */}
      {featuredEvent && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit']">
              Featured Event
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Featured
            </span>
          </div>

          <div className="rounded-2xl overflow-hidden glass-card border border-indigo-500/30 grid grid-cols-1 lg:grid-cols-12 shadow-xl">
            <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-auto overflow-hidden bg-slate-900">
              <img
                src={featuredEvent.image}
                alt={featuredEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white">
                  {featuredEvent.category}
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{featuredEvent.date}</span>
                  <span>•</span>
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{featuredEvent.time}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
                  {featuredEvent.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {featuredEvent.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{featuredEvent.venue}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setSelectedEvent(featuredEvent)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-all text-center"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleRegister(featuredEvent)}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{featuredEvent.price === 0 ? 'Claim Ticket' : 'Register Now'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* UPCOMING CAMPUS EVENTS */}
      <section id="events-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              Campus Events
            </h2>
            <p className="text-xs text-slate-400 mt-1">Upcoming collegiate activities and symposiums</p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Event Cards Grid or "No event available" */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-72 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800"></div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 rounded-2xl glass-card border border-slate-800 space-y-3">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No event available</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are currently no events listed in this category.
            </p>
            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white inline-block mt-2"
              >
                + Create Event in Admin Panel
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => {
              const isRegistered = userRegistrations.some(r => r.eventId === evt.id && r.status !== 'cancelled');
              return (
                <EventCard
                  key={evt.id}
                  event={evt}
                  onSelect={setSelectedEvent}
                  onRegister={handleRegister}
                  isRegistered={isRegistered}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* CAMPUS CLUBS & SOCIETIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit']">
            Campus Organizing Societies
          </h2>
          <p className="text-xs text-slate-400">
            Student-led clubs powering collegiate events and technical workshops
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: 'Coding Society', desc: 'Hackathons & AI', icon: '💻', tag: 'Technical' },
            { name: 'Cultural Council', desc: 'Music & Arts', icon: '🎭', tag: 'Cultural' },
            { name: 'MechaClub', desc: 'Robotics', icon: '🤖', tag: 'Robotics' },
            { name: 'Sports Board', desc: 'Athletics & Cups', icon: '🏏', tag: 'Athletics' },
            { name: 'Design Collective', desc: 'UI/UX & Creative', icon: '🎨', tag: 'Design' },
            { name: 'Music Society', desc: 'Acoustic & Band', icon: '🎸', tag: 'Music' }
          ].map((club, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl glass-card border border-slate-800 text-center space-y-1.5 hover:border-indigo-500/30 transition-all"
            >
              <div className="text-2xl">{club.icon}</div>
              <h4 className="text-xs font-bold text-white font-['Outfit']">{club.name}</h4>
              <p className="text-[10px] text-slate-400">{club.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MODALS */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegister={handleRegister}
          isRegistered={userRegistrations.some(r => r.eventId === selectedEvent.id && r.status !== 'cancelled')}
          onViewTicket={(evt) => {
            const ticket = userRegistrations.find(r => r.eventId === evt.id);
            if (ticket) setActiveTicket(ticket);
          }}
        />
      )}

      {activeTicket && (
        <TicketModal
          ticket={activeTicket}
          onClose={() => setActiveTicket(null)}
        />
      )}

    </div>
  );
}
