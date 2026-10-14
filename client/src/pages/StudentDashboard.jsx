import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Award,
  Bookmark,
  User,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Compass
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TicketModal from '../components/events/TicketModal';
import CertificateModal from '../components/events/CertificateModal';

export default function StudentDashboard() {
  const { user, token, savedEvents } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets', 'certificates', 'saved', 'profile'
  const [registrations, setRegistrations] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    async function loadData() {
      try {
        const [regs, evts] = await Promise.all([
          api.getMyRegistrations(token),
          api.getEvents()
        ]);
        setRegistrations(regs);
        setAllEvents(evts);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch student registrations');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token, navigate, toast]);

  const handleCancelRegistration = async (id, eventTitle) => {
    if (!window.confirm(`Are you sure you want to cancel your pass for "${eventTitle}"?`)) {
      return;
    }

    try {
      await api.cancelRegistration(id, token);
      toast.info(`Registration for ${eventTitle} was cancelled.`);
      setRegistrations(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to cancel registration');
    }
  };

  const activePasses = registrations.filter(r => r.status === 'confirmed');
  const attendedPasses = registrations.filter(r => r.status === 'attended');
  const bookmarkedEventObjects = allEvents.filter(e => savedEvents.includes(e.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-100 min-h-[80vh]">
      
      {/* Student Profile Header Bar */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-indigo-500/30 shadow-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/50 shadow-lg"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
              {user?.name?.charAt(0) || 'S'}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                {user?.name || 'Student Portal'}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Verified Student
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {user?.rollNo || 'CS-2024-042'} • {user?.department || 'Computer Science & Engineering'} • {user?.year || '3rd Year'}
            </p>
          </div>
        </div>

        {/* Quick Stats Pill Counters */}
        <div className="flex items-center gap-3">
          <div className="p-3 px-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="text-xl font-extrabold text-cyan-400 font-mono block">{activePasses.length}</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Passes</span>
          </div>

          <div className="p-3 px-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="text-xl font-extrabold text-emerald-400 font-mono block">{attendedPasses.length}</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Attended</span>
          </div>

          <div className="p-3 px-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="text-xl font-extrabold text-amber-400 font-mono block">{bookmarkedEventObjects.length}</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Saved</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'tickets'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Ticket className="w-4 h-4 text-cyan-400" />
          <span>My Passes ({activePasses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'certificates'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Award className="w-4 h-4 text-amber-300" />
          <span>Certificates of Completion ({attendedPasses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'saved'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Bookmark className="w-4 h-4 text-rose-300" />
          <span>Saved Events ({bookmarkedEventObjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Student ID & Details</span>
        </button>
      </div>

      {/* TAB CONTENT: MY PASSES */}
      {activeTab === 'tickets' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(n => (
                <div key={n} className="h-48 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800"></div>
              ))}
            </div>
          ) : activePasses.length === 0 ? (
            <div className="text-center py-16 rounded-2xl glass-card border border-slate-800 space-y-2">
              <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">No event available</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You have not registered for any events yet.
              </p>
              <Link
                to="/events"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md inline-flex items-center gap-1.5 mt-2"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore Events</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activePasses.map((pass) => (
                <div
                  key={pass.id}
                  className="rounded-2xl glass-card border border-slate-800 p-6 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
                        {pass.ticketId}
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Confirmed Entry
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white font-['Outfit'] line-clamp-1">
                      {pass.eventTitle}
                    </h3>

                    <div className="space-y-1.5 mt-3 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{pass.eventDate || 'Scheduled date'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{pass.eventTime || 'Start time'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span className="truncate">{pass.eventVenue || 'Campus Venue'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-400">
                      Seat: <strong className="text-white font-mono">{pass.seatNumber || 'A-12'}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCancelRegistration(pass.id, pass.eventTitle)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Cancel registration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setSelectedTicket(pass)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-xs font-bold text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>View QR Pass</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CERTIFICATES OF ATTENDANCE */}
      {activeTab === 'certificates' && (
        <div>
          {attendedPasses.length === 0 ? (
            <div className="text-center py-16 rounded-2xl glass-card border border-slate-800 space-y-2">
              <Award className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">No event available</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No completed event certificates found. Attend events to earn certificates of participation.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {attendedPasses.map((pass) => (
                <div
                  key={pass.id}
                  className="rounded-2xl glass-card border border-amber-500/30 p-6 flex flex-col justify-between space-y-4 hover:border-amber-500/60 transition-all bg-gradient-to-br from-slate-900/80 to-amber-950/20"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                        OFFICIAL CREDENTIAL
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified Attended
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white font-['Outfit']">
                      {pass.eventTitle}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Conferred to {pass.userName} ({pass.userRollNo})
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-amber-400 font-medium">Signed by Dean of Student Affairs</span>
                    <button
                      onClick={() => setSelectedCertificate(pass)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow-lg shadow-amber-600/30 flex items-center gap-1.5 transition-all"
                    >
                      <Award className="w-4 h-4 text-yellow-200" />
                      <span>View & Download Certificate</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SAVED EVENTS */}
      {activeTab === 'saved' && (
        <div>
          {bookmarkedEventObjects.length === 0 ? (
            <div className="text-center py-16 rounded-2xl glass-card border border-slate-800 space-y-2">
              <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">No event available</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No saved events in your list. Click the bookmark icon on any event to save it.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedEventObjects.map((evt) => (
                <div key={evt.id} className="glass-card rounded-2xl overflow-hidden border border-slate-800 p-5 space-y-3">
                  <img src={evt.image} alt={evt.title} className="w-full h-36 object-cover rounded-xl" />
                  <span className="text-[10px] uppercase font-bold text-indigo-400">{evt.category}</span>
                  <h4 className="text-base font-bold text-white line-clamp-1">{evt.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{evt.description}</p>
                  <Link
                    to={`/events`}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold block text-center mt-2"
                  >
                    View in Catalog
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PROFILE DETAILS */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto rounded-3xl glass-card border border-slate-800 p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white font-['Outfit']">Verified Student Identity Card</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Full Name</span>
              <span className="font-bold text-white block mt-0.5">{user?.name}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">University Roll No</span>
              <span className="font-mono font-bold text-cyan-400 block mt-0.5">{user?.rollNo || 'CS-2024-042'}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Registered Email</span>
              <span className="font-mono text-slate-300 block mt-0.5 truncate">{user?.email}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Department</span>
              <span className="text-slate-300 block mt-0.5 truncate">{user?.department || 'Computer Science'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed">
            🎓 Student identity is verified against Apex University Student Council records. Your event QR pass will be matched with your roll number at gate check-in.
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}

    </div>
  );
}
