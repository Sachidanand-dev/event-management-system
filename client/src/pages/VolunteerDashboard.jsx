import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Calendar,
  Bell,
  RefreshCw,
  Search,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function VolunteerDashboard() {
  const { user, token } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [dutyData, setDutyData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scanner state
  const [scanCode, setScanCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Live filter on recent check-ins
  const [searchFilter, setSearchFilter] = useState('');

  // Protect volunteer route
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'volunteer' && user.role !== 'admin') {
      toast.error('Access restricted to Event Volunteers & Staff.');
      navigate('/dashboard');
    }
  }, [user, token, navigate, toast]);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setLoading(true);
      const [duty, anns] = await Promise.all([
        api.getVolunteerDuty(token),
        api.getAnnouncements()
      ]);
      setDutyData(duty);
      setAnnouncements(anns || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load volunteer portal data');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (token) {
      loadData(false);
    }
  }, [token, loadData]);

  // Handle Gate Check-In
  const handleValidateTicket = async (e) => {
    if (e) e.preventDefault();
    if (!scanCode.trim()) {
      toast.warning('Please enter a ticket code');
      return;
    }

    setScanning(true);
    setScanResult(null);

    try {
      const res = await api.checkInTicket(scanCode.trim(), token);
      setScanResult(res);

      if (res.valid && !res.alreadyCheckedIn) {
        toast.success(`Entry Approved for ${res.registration?.userName}!`);
        const updatedDuty = await api.getVolunteerDuty(token);
        setDutyData(updatedDuty);
        setScanCode('');
      } else if (res.alreadyCheckedIn) {
        toast.warning(res.message);
      }
    } catch (err) {
      setScanResult({
        valid: false,
        message: err.message || 'Pass invalid or not found'
      });
      toast.error(err.message || 'Invalid entry pass');
    } finally {
      setScanning(false);
    }
  };

  const recentCheckIns = dutyData?.recentCheckIns || [];
  const filteredCheckIns = recentCheckIns.filter(r =>
    !searchFilter ||
    r.userName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (r.userRollNo && r.userRollNo.toLowerCase().includes(searchFilter.toLowerCase())) ||
    r.ticketId.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100 min-h-[85vh]">
      
      {/* Volunteer Profile & Shift Assignment Header */}
      <div className="p-6 sm:p-7 rounded-2xl glass-card border border-slate-800 shadow-xl mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/30 shrink-0">
            <QrCode className="w-6 h-6 text-cyan-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit']">
                Volunteer Field Operations Desk
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                Active Duty
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Volunteer: <strong className="text-white">{user?.name || dutyData?.volunteer?.name}</strong> • Station: {dutyData?.volunteer?.venue || 'Main Gate'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Refresh shift data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Live Campus Announcements Alert for Volunteers */}
      {announcements.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
          <Bell className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-indigo-300 uppercase tracking-wider block">
              Campus Notice: {announcements[0].title}
            </span>
            <p className="text-slate-300">{announcements[0].message}</p>
          </div>
        </div>
      )}

      {/* Duty Assignment Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl glass-card border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-indigo-400 font-bold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" /> Assigned Event
          </div>
          <h3 className="text-sm font-bold text-white line-clamp-1">
            {dutyData?.assignedEvent ? dutyData.assignedEvent.title : 'No event available'}
          </h3>
          <p className="text-xs text-slate-400">
            {dutyData?.assignedEvent ? `${dutyData.assignedEvent.date} • ${dutyData.assignedEvent.time}` : 'No active duty assigned'}
          </p>
        </div>

        <div className="p-4 rounded-xl glass-card border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" /> Duty Station
          </div>
          <h3 className="text-sm font-bold text-white line-clamp-1">
            {dutyData?.volunteer?.duty || 'Gate QR Scanner & Attendee Check-in'}
          </h3>
          <p className="text-xs text-slate-400">
            {dutyData?.volunteer?.venue || 'Campus Gate 1'}
          </p>
        </div>

        <div className="p-4 rounded-xl glass-card border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" /> Shift Time
          </div>
          <h3 className="text-sm font-bold text-white font-mono">
            {dutyData?.volunteer?.shift || '09:00 AM - 02:00 PM'}
          </h3>
          <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Shift In Progress
          </p>
        </div>
      </div>

      {/* Live Check-In Statistics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl glass-card border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Registered</span>
          <span className="text-2xl font-extrabold text-white font-mono mt-0.5 block">
            {dutyData?.stats?.totalEventRegistrations || 0}
          </span>
        </div>

        <div className="p-4 rounded-xl glass-card border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Admitted Today</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5 block">
            {dutyData?.stats?.totalCheckedIn || 0}
          </span>
        </div>

        <div className="p-4 rounded-xl glass-card border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Awaiting Entry</span>
          <span className="text-2xl font-extrabold text-cyan-400 font-mono mt-0.5 block">
            {dutyData?.stats?.remaining || 0}
          </span>
        </div>

        <div className="p-4 rounded-xl glass-card border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Admitted Rate</span>
          <span className="text-2xl font-extrabold text-amber-400 font-mono mt-0.5 block">
            {dutyData?.stats?.occupancyPercentage || 0}%
          </span>
        </div>
      </div>

      {/* Scanner & Live Roster Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Left Column: Live Gate QR Scanner */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5">
              <QrCode className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white font-['Outfit']">
                Gate Entry Scanner
              </h2>
            </div>

            <form onSubmit={handleValidateTicket} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Ticket ID or Scanned Pass Code
                </label>
                <input
                  type="text"
                  required
                  value={scanCode}
                  onChange={(e) => setScanCode(e.target.value)}
                  placeholder="Enter Ticket Code..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={scanning}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:opacity-95 text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{scanning ? 'Verifying...' : 'Validate Entry Pass'}</span>
              </button>
            </form>

            {scanResult && (
              <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                scanResult.valid && !scanResult.alreadyCheckedIn
                  ? 'bg-emerald-950/60 border-emerald-500/50'
                  : scanResult.alreadyCheckedIn
                  ? 'bg-amber-950/60 border-amber-500/50'
                  : 'bg-rose-950/60 border-rose-500/50'
              }`}>
                <div className="flex items-center gap-2 font-bold text-white">
                  {scanResult.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                  <span>{scanResult.message}</span>
                </div>

                {scanResult.registration && (
                  <div className="text-slate-300 space-y-0.5 pt-1 border-t border-white/10 text-[11px]">
                    <div>Attendee: <strong className="text-white">{scanResult.registration.userName}</strong></div>
                    <div>Event: <strong className="text-white">{scanResult.registration.eventTitle}</strong></div>
                    <div>Seat: <strong className="text-amber-300 font-mono">{scanResult.registration.seatNumber}</strong></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Attendee Check-In Roster */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white font-['Outfit']">
                Live Gate Admission Roster
              </h3>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter name or roll..."
                  className="w-full pl-7 pr-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="p-2.5">Ticket ID</th>
                    <th className="p-2.5">Attendee</th>
                    <th className="p-2.5">Roll No</th>
                    <th className="p-2.5">Seat</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredCheckIns.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-slate-500">
                        {dutyData?.assignedEvent ? 'No checked-in attendees yet' : 'No event available'}
                      </td>
                    </tr>
                  ) : (
                    filteredCheckIns.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-800/40">
                        <td className="p-2.5 font-mono font-bold text-indigo-400">{att.ticketId}</td>
                        <td className="p-2.5 font-bold text-white">{att.userName}</td>
                        <td className="p-2.5 font-mono text-cyan-400">{att.userRollNo}</td>
                        <td className="p-2.5 font-mono text-amber-300">{att.seatNumber}</td>
                        <td className="p-2.5 text-emerald-400 font-medium">Checked-In</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
