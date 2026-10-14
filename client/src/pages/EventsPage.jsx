import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Compass,
  Search,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EventCard from '../components/events/EventCard';
import EventDetailsModal from '../components/events/EventDetailsModal';
import TicketModal from '../components/events/TicketModal';

export default function EventsPage() {
  const [searchParams] = useSearchParams();
  const { user, token, isStudent } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [priceFilter, setPriceFilter] = useState('all'); // all, free, paid
  const [sortBy, setSortBy] = useState('date'); // date, popularity, title

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);
  const [userRegistrations, setUserRegistrations] = useState([]);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await api.getEvents();
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  useEffect(() => {
    async function loadRegistrations() {
      if (token && isStudent) {
        try {
          const regs = await api.getMyRegistrations(token);
          setUserRegistrations(regs);
        } catch (err) {
          console.warn(err);
        }
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
      toast.success(`Registered for ${event.title}!`);
      confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
      setActiveTicket(res.registration);
      setUserRegistrations(prev => [res.registration, ...prev]);
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, registeredCount: e.registeredCount + 1 } : e));
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
  };

  const categories = ['All', 'Technical', 'Cultural', 'Workshop', 'Sports'];

  // Filtering and Sorting
  const filteredEvents = events.filter(e => {
    const matchesCat = category === 'All' || e.category.toLowerCase() === category.toLowerCase();
    const matchesPrice = priceFilter === 'all' || 
      (priceFilter === 'free' && e.price === 0) || 
      (priceFilter === 'paid' && e.price > 0);
    const matchesSearch = !searchQuery || 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.tags && e.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCat && matchesPrice && matchesSearch;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'date') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'popularity') return (b.registeredCount / b.capacity) - (a.registeredCount / a.capacity);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-100">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-indigo-400 text-xs uppercase font-bold tracking-wider mb-2">
          <Compass className="w-4 h-4" />
          <span>Full Campus Directory</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-['Outfit']">
          Explore Campus Events
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-xl">
          Browse upcoming technical hackathons, cultural festivals, workshops, guest lectures, and inter-department sports cups.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-6 rounded-2xl glass-panel border border-slate-800 space-y-4 mb-8">
        
        {/* Top Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by keywords, club name, or venue..."
            className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  category === c
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Pricing & Sort Dropdowns */}
          <div className="flex items-center gap-3">
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Prices</option>
              <option value="free">Free Entry Only</option>
              <option value="paid">Paid Events Only</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="date">Sort: Soonest First</option>
              <option value="popularity">Sort: Most Popular</option>
              <option value="title">Sort: Title (A-Z)</option>
            </select>
          </div>

        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6 text-xs text-slate-400">
        <span>Showing <strong className="text-white">{sortedEvents.length}</strong> events</span>
        {(searchQuery || category !== 'All' || priceFilter !== 'all') && (
          <button
            onClick={() => { setSearchQuery(''); setCategory('All'); setPriceFilter('all'); }}
            className="text-indigo-400 hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Grid of Events */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-96 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800"></div>
          ))}
        </div>
      ) : sortedEvents.length === 0 ? (
        <div className="text-center py-20 rounded-2xl glass-card border border-slate-800 space-y-2">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-white">No event available</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are currently no campus events scheduled.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map((evt) => {
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

      {/* Modals */}
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
