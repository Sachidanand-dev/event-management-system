import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Share2,
  Tag,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function EventDetailsModal({ event, onClose, onRegister, isRegistered, onViewTicket }) {
  const { savedEvents, toggleSaveEvent } = useAuth();
  const toast = useToast();

  if (!event) return null;

  const spotsLeft = Math.max(0, event.capacity - event.registeredCount);
  const isSaved = savedEvents.includes(event.id);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}`);
      toast.info('Event link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl my-8 bg-[#0d1322] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden animate-fade-in text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Image */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1322] via-[#0d1322]/40 to-transparent"></div>

          {/* Top Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-colors"
              title="Share event"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Badges on Banner */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
                {event.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/80 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                {event.price === 0 ? 'FREE ADMISSION' : `ENTRY: ₹${event.price}`}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                Organized by {event.organizer}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] leading-tight">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[calc(85vh-260px)] overflow-y-auto">
          
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Date</span>
                <span className="text-xs sm:text-sm font-semibold text-white">{event.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Time</span>
                <span className="text-xs sm:text-sm font-semibold text-white truncate">{event.time}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Venue</span>
                <span className="text-xs sm:text-sm font-semibold text-white truncate">{event.venue}</span>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div>
            <h3 className="text-base font-bold text-white mb-2 font-['Outfit'] flex items-center gap-2">
              <span>About the Event</span>
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Focus Topics & Tags</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Agenda Timeline */}
          {event.agenda && event.agenda.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-white mb-4 font-['Outfit']">Event Schedule & Itinerary</h3>
              <div className="relative pl-6 border-l-2 border-indigo-500/30 space-y-4">
                {event.agenda.map((item, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-[#0d1322]"></div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-xs font-bold text-indigo-400">{item.time}</span>
                      <p className="text-xs sm:text-sm text-slate-200 mt-0.5 font-medium">{item.activity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Speakers & Guests */}
          {event.speakers && event.speakers.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-white mb-3 font-['Outfit']">Featured Guests & Mentors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.speakers.map((sp, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                    <img
                      src={sp.avatar}
                      alt={sp.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/30"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{sp.name}</span>
                      <span className="text-xs text-indigo-300">{sp.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Capacity Alert */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="text-xs font-bold text-white block">Seat Occupancy: {event.registeredCount} / {event.capacity}</span>
                <span className="text-[11px] text-slate-400">
                  {spotsLeft > 0 ? `${spotsLeft} seats remaining for campus attendees.` : 'Registration limit reached.'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
                {Math.round((event.registeredCount / event.capacity) * 100)}% Capacity Registered
              </span>
            </div>
          </div>

        </div>

        {/* Modal Footer / Registration Action */}
        <div className="p-5 sm:p-6 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleSaveEvent(event.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                isSaved
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {isSaved ? '★ Saved to Wishlist' : '☆ Save Event'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {isRegistered ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> You're Registered
                </span>
                <button
                  onClick={() => {
                    onClose();
                    if (onViewTicket) onViewTicket(event);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
                >
                  View Digital Pass
                </button>
              </div>
            ) : (
              <button
                onClick={() => onRegister(event)}
                disabled={spotsLeft === 0}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-xl transition-all flex items-center gap-2 ${
                  spotsLeft === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 shadow-indigo-600/30'
                }`}
              >
                <span>{spotsLeft === 0 ? 'Waitlist Full' : (event.price === 0 ? 'Claim Ticket' : 'Register Now')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
