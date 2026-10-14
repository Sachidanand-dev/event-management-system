import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TicketModal from '../components/events/TicketModal';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, isStudent, savedEvents, toggleSaveEvent } = useAuth();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    async function fetchEventAndUserStatus() {
      try {
        const evt = await api.getEventById(id);
        setEvent(evt);

        if (token && isStudent) {
          const myRegs = await api.getMyRegistrations(token);
          const current = myRegs.find(r => r.eventId === id && r.status !== 'cancelled');
          if (current) {
            setIsRegistered(true);
            setActiveTicket(current);
          }
        }
      } catch {
        toast.error('Event not found');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    }
    fetchEventAndUserStatus();
  }, [id, token, isStudent, navigate, toast]);

  const handleRegister = async () => {
    if (!user) {
      toast.info('Please sign in to register.');
      navigate('/login');
      return;
    }

    if (user.role === 'admin') {
      toast.warning('Admins manage events in the Admin Panel.');
      return;
    }

    try {
      const res = await api.registerForEvent(event.id, token);
      toast.success(`Successfully registered for ${event.title}!`);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setIsRegistered(true);
      setActiveTicket(res.registration);
      setEvent(prev => ({ ...prev, registeredCount: prev.registeredCount + 1 }));
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Event link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4"></div>
        <p className="text-sm">Loading event details...</p>
      </div>
    );
  }

  if (!event) return null;

  const isSaved = savedEvents.includes(event.id);
  const spotsLeft = Math.max(0, event.capacity - event.registeredCount);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-100">
      
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Events
        </Link>
      </div>

      {/* Main Container */}
      <div className="rounded-3xl glass-card border border-slate-800 overflow-hidden shadow-2xl">
        
        {/* Banner */}
        <div className="relative h-72 sm:h-96 w-full bg-slate-900">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent"></div>

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => toggleSaveEvent(event.id)}
              className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
                isSaved
                  ? 'bg-rose-500/30 text-rose-300 border-rose-500/50'
                  : 'bg-black/60 text-white border-white/10 hover:bg-black/80'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-400' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
                {event.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                {event.price === 0 ? 'FREE ADMISSION' : `ENTRY: ₹${event.price}`}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                By {event.organizer}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-['Outfit']">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Details Content */}
        <div className="p-6 sm:p-10 space-y-8">
          
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date</span>
                <span className="text-sm font-bold text-white">{event.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Time</span>
                <span className="text-sm font-bold text-white truncate">{event.time}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Venue</span>
                <span className="text-sm font-bold text-white truncate">{event.venue}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-white mb-2 font-['Outfit']">Overview</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Agenda */}
          {event.agenda && event.agenda.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4 font-['Outfit']">Event Schedule & Itinerary</h3>
              <div className="relative pl-6 border-l-2 border-indigo-500/30 space-y-4">
                {event.agenda.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-[#0f172a]"></div>
                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-xs font-bold text-indigo-400">{item.time}</span>
                      <p className="text-sm text-slate-200 mt-0.5 font-medium">{item.activity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Speakers */}
          {event.speakers && event.speakers.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-3 font-['Outfit']">Featured Speakers & Guests</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.speakers.map((sp, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                    <img src={sp.avatar} alt={sp.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/30" />
                    <div>
                      <span className="text-sm font-bold text-white block">{sp.name}</span>
                      <span className="text-xs text-indigo-300">{sp.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registration Action Bar */}
          <div className="p-6 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-sm font-bold text-white block">
                Occupancy: {event.registeredCount} / {event.capacity} Registered
              </span>
              <span className="text-xs text-slate-400">
                {spotsLeft > 0 ? `${spotsLeft} seats remaining before registration closes.` : 'Event is currently at maximum capacity.'}
              </span>
            </div>

            <div>
              {isRegistered ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> You're Registered
                  </span>
                  <button
                    onClick={() => setActiveTicket(activeTicket)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30"
                  >
                    View QR Pass
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={spotsLeft === 0}
                  className={`px-6 py-3 rounded-xl text-sm font-bold text-white shadow-xl transition-all ${
                    spotsLeft === 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-600/30'
                  }`}
                >
                  {spotsLeft === 0 ? 'Waitlist Only' : (event.price === 0 ? 'Claim Ticket' : 'Register Now')}
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Ticket Modal */}
      {activeTicket && (
        <TicketModal
          ticket={activeTicket}
          onClose={() => setActiveTicket(null)}
        />
      )}

    </div>
  );
}
