import { Calendar, Clock, MapPin, Users, Bookmark, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function EventCard({ event, onSelect, onRegister, isRegistered }) {
  const { savedEvents, toggleSaveEvent } = useAuth();
  const isSaved = savedEvents.includes(event.id);

  const occupancy = Math.round((event.registeredCount / event.capacity) * 100);
  const spotsLeft = Math.max(0, event.capacity - event.registeredCount);

  // Category Color Badges
  const getCategoryBadge = (category) => {
    switch (category?.toLowerCase()) {
      case 'technical':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'cultural':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'workshop':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'sports':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 transition-all duration-300 hover:-translate-y-1.5 flex flex-col group">
      
      {/* Event Banner Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-black/40"></div>

        {/* Category & Price Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md ${getCategoryBadge(event.category)}`}>
            {event.category}
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white border border-slate-700/60 backdrop-blur-md">
            {event.price === 0 ? 'FREE ENTRY' : `₹${event.price}`}
          </span>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveEvent(event.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
            isSaved
              ? 'bg-rose-500/30 text-rose-400 border border-rose-500/50'
              : 'bg-black/50 text-slate-300 hover:text-white border border-white/10 hover:bg-black/70'
          }`}
          title={isSaved ? 'Remove from saved' : 'Save event'}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-400' : ''}`} />
        </button>

        {/* Date Sticker */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-white/90 font-medium bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>{event.date}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 
            onClick={() => onSelect(event)}
            className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1 cursor-pointer font-['Outfit']"
            title={event.title}
          >
            {event.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
            {event.tagline || event.description}
          </p>
        </div>

        {/* Metadata Details */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{event.time}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3 text-indigo-400" />
              <span>{event.registeredCount} / {event.capacity} Registered</span>
            </span>
            <span className={spotsLeft <= 20 ? 'text-rose-400 font-semibold' : 'text-slate-400 font-medium'}>
              {spotsLeft === 0 ? 'Housefull' : `${spotsLeft} seats left`}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                occupancy >= 90
                  ? 'bg-rose-500'
                  : occupancy >= 70
                  ? 'bg-amber-500'
                  : 'bg-indigo-500'
              }`}
              style={{ width: `${Math.min(100, occupancy)}%` }}
            ></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 pt-2">
          <button
            onClick={() => onSelect(event)}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 transition-all text-center flex items-center justify-center gap-1"
          >
            Details
          </button>

          {isRegistered ? (
            <div className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Registered
            </div>
          ) : (
            <button
              onClick={() => onRegister(event)}
              disabled={spotsLeft === 0}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                spotsLeft === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-600/30 hover:shadow-indigo-600/50'
              }`}
            >
              <span>{spotsLeft === 0 ? 'Waitlist' : (event.price === 0 ? 'Claim Ticket' : 'Register Now')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
