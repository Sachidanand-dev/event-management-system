import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  TrendingUp,
  Calendar,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Download,
  QrCode,
  Bell,
  RefreshCw,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminPanel() {
  const { user, token, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'events', 'attendees', 'scanner', 'announcements'
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Event modal state (Create / Edit)
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    tagline: '',
    category: 'Technical',
    date: '',
    time: '10:00 AM - 04:00 PM',
    venue: '',
    capacity: 100,
    price: 0,
    image: '',
    organizer: 'Campus Administration',
    description: '',
    tags: 'Campus',
    featured: false
  });

  // Attendee filters
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [attendeeEventFilter, setAttendeeEventFilter] = useState('all');
  const [attendeeStatusFilter, setAttendeeStatusFilter] = useState('all');

  // Scanner Simulator state
  const [scanCode, setScanCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  // Announcement modal state
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [annForm, setAnnForm] = useState({
    title: '',
    message: '',
    category: 'Urgent',
    pinned: true
  });

  // Protect Admin Route
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'admin') {
      toast.error('Unauthorized: Admin access required.');
      navigate('/');
    }
  }, [user, token, navigate, toast]);

  // Load Admin Data
  const loadAdminData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setLoading(true);
      const [statsData, eventsData, attendeesData, annData] = await Promise.all([
        api.getAdminStats(token),
        api.getEvents(),
        api.getAttendees({}, token),
        api.getAnnouncements()
      ]);
      setStats(statsData);
      setEvents(eventsData);
      setAttendees(attendeesData);
      setAnnouncements(annData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load admin panel data');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (token && isAdmin) {
      loadAdminData(false);
    }
  }, [token, isAdmin, loadAdminData]);

  // Handle Event Create / Update
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.venue.trim() || !eventForm.date) {
      toast.warning('Please fill in the required event details');
      return;
    }

    try {
      const payload = {
        ...eventForm,
        image: eventForm.image.trim() || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'
      };

      if (editingEvent) {
        await api.updateEvent(editingEvent.id, payload, token);
        toast.success(`Event "${payload.title}" updated successfully`);
      } else {
        await api.createEvent(payload, token);
        toast.success(`Event "${payload.title}" created successfully`);
      }
      setEventModalOpen(false);
      setEditingEvent(null);
      loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      tagline: '',
      category: 'Technical',
      date: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
      time: '10:00 AM - 04:00 PM',
      venue: '',
      capacity: 150,
      price: 0,
      image: '',
      organizer: 'Campus Administration',
      description: '',
      tags: 'Campus, Academic',
      featured: false
    });
    setEventModalOpen(true);
  };

  const handleEditEvent = (evt) => {
    setEditingEvent(evt);
    setEventForm({
      title: evt.title,
      tagline: evt.tagline || '',
      category: evt.category,
      date: evt.date,
      time: evt.time,
      venue: evt.venue,
      capacity: evt.capacity,
      price: evt.price || 0,
      image: evt.image || '',
      organizer: evt.organizer || '',
      description: evt.description || '',
      tags: Array.isArray(evt.tags) ? evt.tags.join(', ') : (evt.tags || ''),
      featured: Boolean(evt.featured)
    });
    setEventModalOpen(true);
  };

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      await api.deleteEvent(id, token);
      toast.info(`Deleted event "${title}"`);
      loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete event');
    }
  };

  // Toggle Attendee Status
  const handleToggleAttendeeStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'attended' ? 'confirmed' : 'attended';
    try {
      await api.updateAttendeeStatus(id, nextStatus, token);
      toast.success(`Status updated to ${nextStatus}`);
      setAttendees(prev => prev.map(a => a.id === id ? { ...a, status: nextStatus } : a));
      const updatedStats = await api.getAdminStats(token);
      setStats(updatedStats);
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  // Export Attendees to CSV
  const handleExportCSV = () => {
    if (filteredAttendees.length === 0) {
      toast.warning('No attendee records available to export');
      return;
    }

    const headers = ['Ticket ID', 'Student Name', 'Roll Number', 'Email', 'Department', 'Event Title', 'Seat Number', 'Status', 'Registered At'];
    const rows = filteredAttendees.map(a => [
      `"${a.ticketId}"`,
      `"${a.userName}"`,
      `"${a.userRollNo || ''}"`,
      `"${a.userEmail}"`,
      `"${a.department || ''}"`,
      `"${a.eventTitle}"`,
      `"${a.seatNumber || ''}"`,
      `"${a.status}"`,
      `"${a.registeredAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Apex_Event_Attendees_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Attendee report downloaded');
  };

  // Check-In Ticket Code Scanner
  const handleCheckInScan = async (e) => {
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
        toast.success(res.message);
        loadAdminData();
      } else if (res.alreadyCheckedIn) {
        toast.warning(res.message);
      }
    } catch (err) {
      setScanResult({
        valid: false,
        message: err.message || 'Ticket code not found'
      });
      toast.error(err.message || 'Invalid ticket pass');
    } finally {
      setScanning(false);
    }
  };

  // Announcements
  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!annForm.title.trim() || !annForm.message.trim()) {
      toast.warning('Please enter a title and message');
      return;
    }
    try {
      await api.createAnnouncement(annForm, token);
      toast.success('Broadcast alert posted');
      setAnnouncementModalOpen(false);
      setAnnForm({ title: '', message: '', category: 'Urgent', pinned: true });
      loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to post announcement');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await api.deleteAnnouncement(id, token);
      toast.info('Announcement deleted');
      loadAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  // Filtered Attendees
  const filteredAttendees = attendees.filter(a => {
    const matchesEvent = attendeeEventFilter === 'all' || a.eventId === attendeeEventFilter;
    const matchesStatus = attendeeStatusFilter === 'all' || a.status.toLowerCase() === attendeeStatusFilter.toLowerCase();
    const matchesSearch = !attendeeSearch ||
      a.userName.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      a.userEmail.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      (a.userRollNo && a.userRollNo.toLowerCase().includes(attendeeSearch.toLowerCase())) ||
      a.ticketId.toLowerCase().includes(attendeeSearch.toLowerCase());
    return matchesEvent && matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100 min-h-[85vh]">
      
      {/* Redesigned Admin Header */}
      <div className="p-6 sm:p-7 rounded-2xl glass-card border border-slate-800 shadow-xl mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit']">
                Admin Management Console
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Signed in as <span className="text-slate-200 font-medium">{user?.email || 'admin@email.com'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={loadAdminData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Segmented Navigation Tab Bar */}
      <div className="flex flex-wrap items-center gap-1.5 mb-6 p-1 bg-slate-900/90 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'events'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Events ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendees')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'attendees'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Attendees ({attendees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'scanner'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Gate Scanner</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'announcements'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Broadcasts ({announcements.length})</span>
        </button>
      </div>

      {/* 1. TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl glass-card border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Events</span>
              <span className="text-3xl font-extrabold text-white font-mono mt-1 block">
                {stats?.totalEvents ?? events.length}
              </span>
              <span className="text-[11px] text-indigo-400 mt-1 block font-medium">
                {events.length === 0 ? 'No events created' : `${events.length} active events`}
              </span>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Registrations</span>
              <span className="text-3xl font-extrabold text-cyan-400 font-mono mt-1 block">
                {stats?.totalRegistrations ?? attendees.length}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block font-medium">Student RSVPs</span>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Admitted / Checked-In</span>
              <span className="text-3xl font-extrabold text-emerald-400 font-mono mt-1 block">
                {stats?.totalAttended ?? attendees.filter(a => a.status === 'attended').length}
              </span>
              <span className="text-[11px] text-emerald-400/80 mt-1 block font-medium">Verified at gate</span>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Seat Capacity</span>
              <span className="text-3xl font-extrabold text-amber-400 font-mono mt-1 block">
                {stats?.totalCapacity ?? events.reduce((sum, e) => sum + (e.capacity || 0), 0)}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block font-medium">Available campus seats</span>
            </div>
          </div>

          {/* Conditional: If no events available */}
          {events.length === 0 ? (
            <div className="p-12 rounded-2xl glass-card border border-slate-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 mx-auto">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white font-['Outfit']">No event available</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                  There are currently no events created in the system. Get started by creating your first campus event.
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create First Event
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Category Breakdown */}
              <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white font-['Outfit']">Events by Category</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {Object.entries(stats?.categoryCounts || {}).map(([cat, count]) => (
                    <div key={cat} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-semibold">{cat}</span>
                      <span className="font-mono font-bold text-indigo-400">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Attendee Feed */}
              <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white font-['Outfit']">Recent Registrations</h3>
                {attendees.length === 0 ? (
                  <div className="text-xs text-slate-500 py-6 text-center">No registrations recorded yet.</div>
                ) : (
                  <div className="space-y-2">
                    {attendees.slice(0, 5).map(att => (
                      <div key={att.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-white block">{att.userName}</strong>
                          <span className="text-[11px] text-slate-400">{att.eventTitle}</span>
                        </div>
                        <span className="font-mono text-indigo-400 text-[11px]">{att.ticketId}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* 2. TAB: EVENTS */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">
              {events.length === 0 ? 'No event available' : `Total: ${events.length} events`}
            </span>
            <button
              onClick={handleOpenCreateModal}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Event
            </button>
          </div>

          {events.length === 0 ? (
            <div className="p-14 rounded-2xl glass-card border border-slate-800 text-center space-y-3">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No event available</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No events currently scheduled. Click below to add an event to the campus calendar.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white"
              >
                + Create Event
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((evt) => (
                <div key={evt.id} className="rounded-2xl glass-card border border-slate-800 p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="relative h-36 rounded-xl overflow-hidden bg-slate-900 mb-3">
                      <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 text-white">
                        {evt.category}
                      </span>
                      <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-300">
                        {evt.price === 0 ? 'FREE' : `₹${evt.price}`}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white line-clamp-1">{evt.title}</h3>
                    <div className="space-y-1 mt-2 text-xs text-slate-400">
                      <div>📅 {evt.date} • {evt.time}</div>
                      <div className="truncate">📍 {evt.venue}</div>
                      <div>👥 {evt.registeredCount || 0} / {evt.capacity} registered</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                      {evt.organizer || 'Campus Org'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditEvent(evt)}
                        className="p-1.5 text-indigo-400 hover:bg-indigo-500/15 rounded-lg"
                        title="Edit event"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(evt.id, evt.title)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/15 rounded-lg"
                        title="Delete event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. TAB: ATTENDEES */}
      {activeTab === 'attendees' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl glass-card border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={attendeeSearch}
                  onChange={(e) => setAttendeeSearch(e.target.value)}
                  placeholder="Search student, roll no, ticket..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500"
                />
              </div>

              <select
                value={attendeeEventFilter}
                onChange={(e) => setAttendeeEventFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
              >
                <option value="all">All Events</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>

              <select
                value={attendeeStatusFilter}
                onChange={(e) => setAttendeeStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="attended">Attended</option>
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={filteredAttendees.length === 0}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-bold text-white flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>

          <div className="rounded-xl glass-card border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="p-3">Ticket ID</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Roll No</th>
                    <th className="p-3">Event</th>
                    <th className="p-3">Seat</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredAttendees.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500">
                        {events.length === 0 ? 'No event available' : 'No attendees registered yet'}
                      </td>
                    </tr>
                  ) : (
                    filteredAttendees.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-indigo-400">{att.ticketId}</td>
                        <td className="p-3 font-bold text-white">{att.userName}</td>
                        <td className="p-3 font-mono text-cyan-400">{att.userRollNo || 'N/A'}</td>
                        <td className="p-3 text-slate-300 truncate max-w-[200px]">{att.eventTitle}</td>
                        <td className="p-3 font-mono text-slate-400">{att.seatNumber}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            att.status === 'attended'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-indigo-500/20 text-indigo-300'
                          }`}>
                            {att.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleToggleAttendeeStatus(att.id, att.status)}
                            className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            {att.status === 'attended' ? 'Mark Confirmed' : 'Mark Attended'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: GATE QR SCANNER */}
      {activeTab === 'scanner' && (
        <div className="max-w-xl mx-auto p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">Gate Entry Verification</h3>
              <p className="text-xs text-slate-400">Validate student ticket code or scan string</p>
            </div>
          </div>

          <form onSubmit={handleCheckInScan} className="flex gap-2">
            <input
              type="text"
              required
              value={scanCode}
              onChange={(e) => setScanCode(e.target.value)}
              placeholder="Enter Ticket ID (e.g. TK-TECH-1002)..."
              className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={scanning}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white"
            >
              {scanning ? 'Checking...' : 'Validate'}
            </button>
          </form>

          {scanResult && (
            <div className={`p-4 rounded-xl border text-xs space-y-2 ${
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
                <div className="text-slate-300 space-y-1 pt-1 border-t border-white/10">
                  <div>Attendee: <strong className="text-white">{scanResult.registration.userName}</strong></div>
                  <div>Event: <strong className="text-white">{scanResult.registration.eventTitle}</strong></div>
                  <div>Seat: <strong className="text-cyan-400 font-mono">{scanResult.registration.seatNumber}</strong></div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">Campus Alerts</span>
            <button
              onClick={() => setAnnouncementModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Post Alert
            </button>
          </div>

          {announcements.length === 0 ? (
            <div className="p-10 rounded-2xl glass-card border border-slate-800 text-center space-y-2">
              <Bell className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No announcements available</h3>
              <p className="text-xs text-slate-500">Post an alert for campus students and attendees.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-4 rounded-xl glass-card border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-indigo-400">{ann.category}</span>
                    <button onClick={() => handleDeleteAnnouncement(ann.id)} className="text-slate-500 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white">{ann.title}</h4>
                  <p className="text-xs text-slate-400">{ann.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT EVENT MODAL */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl my-6 bg-[#0f172a] border border-slate-700 rounded-2xl p-6 space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                {editingEvent ? 'Edit Event Details' : 'Create New Event'}
              </h3>
              <button onClick={() => setEventModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Event Title *</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="e.g. Annual Technical Symposium 2026"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Category *</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Time Schedule</label>
                  <input
                    type="text"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    placeholder="10:00 AM - 04:00 PM"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Venue *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                    placeholder="Campus Auditorium"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Max Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={eventForm.capacity}
                    onChange={(e) => setEventForm({ ...eventForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Entry Fee (0 for Free)</label>
                  <input
                    type="number"
                    min="0"
                    value={eventForm.price}
                    onChange={(e) => setEventForm({ ...eventForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Banner Image URL (Optional)</label>
                <input
                  type="url"
                  value={eventForm.image}
                  onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Description</label>
                <textarea
                  rows="3"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Event schedule, rules, guidelines..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-md shadow-indigo-600/30"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ANNOUNCEMENT MODAL */}
      {announcementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-700 rounded-2xl p-6 space-y-3.5 text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-['Outfit']">Post Campus Alert</h3>
              <button onClick={() => setAnnouncementModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Title</label>
                <input
                  type="text"
                  required
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  placeholder="Alert title..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Category</label>
                <select
                  value={annForm.category}
                  onChange={(e) => setAnnForm({ ...annForm, category: e.target.value })}
                  className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Urgent">Urgent</option>
                  <option value="Info">Info</option>
                  <option value="Academic">Academic</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Message</label>
                <textarea
                  rows="3"
                  required
                  value={annForm.message}
                  onChange={(e) => setAnnForm({ ...annForm, message: e.target.value })}
                  placeholder="Message text..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAnnouncementModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold text-white"
                >
                  Post Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
