import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Calendar, Clock, MapPin, ShieldCheck, Printer } from 'lucide-react';

export default function TicketModal({ ticket, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (ticket && canvasRef.current) {
      const qrContent = ticket.qrData || `NEXEVENT:${ticket.ticketId}:${ticket.eventId}:${ticket.userId}`;
      QRCode.toCanvas(
        canvasRef.current,
        qrContent,
        {
          width: 170,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [ticket]);

  if (!ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-xl my-6 bg-[#090d16] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden animate-fade-in text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-cyan-600 p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck className="w-5 h-5 text-cyan-300" />
            <span className="font-bold tracking-wide font-['Outfit'] text-sm sm:text-base">
              OFFICIAL CAMPUS ADMISSION PASS
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/20 text-white/90 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Boarding Pass Body */}
        <div id="printable-ticket" className="p-6 sm:p-8 space-y-6">
          
          {/* Top Event Title */}
          <div className="border-b border-slate-800 pb-5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-mono tracking-wider text-indigo-400 uppercase font-bold">
                Ticket ID: {ticket.ticketId}
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                ticket.status === 'attended'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
              }`}>
                {ticket.status === 'attended' ? 'VERIFIED ATTENDED' : 'CONFIRMED PASS'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit']">
              {ticket.eventTitle}
            </h2>
          </div>

          {/* Ticket Information & QR Split */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            
            {/* Student & Event Details */}
            <div className="sm:col-span-2 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Attendee</span>
                  <span className="font-bold text-white block">{ticket.userName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Roll Number</span>
                  <span className="font-mono text-cyan-400 font-bold block">{ticket.userRollNo || 'N/A'}</span>
                </div>
                <div className="col-span-2 border-t border-slate-800/80 pt-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Department</span>
                  <span className="text-slate-300 font-medium block truncate">{ticket.department || 'Apex University'}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{ticket.eventDate || 'See event schedule'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{ticket.eventTime || 'Starts on time'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="truncate">{ticket.eventVenue || 'Campus Venue'}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-between text-xs">
                <span className="text-indigo-300 font-semibold">Allocated Seat / Desk</span>
                <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-indigo-600/50">
                  {ticket.seatNumber || 'GEN-ENTRY'}
                </span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-slate-900 shadow-xl border border-slate-200">
              <canvas ref={canvasRef} className="rounded-lg shadow-sm" />
              <span className="text-[10px] font-mono tracking-wider font-bold text-slate-700 mt-2">
                SCAN AT ENTRY
              </span>
            </div>

          </div>

          {/* Dotted Tear Line */}
          <div className="relative flex items-center py-2">
            <div className="absolute -left-10 w-6 h-6 rounded-full bg-[#000000]"></div>
            <div className="flex-1 border-b-2 border-dashed border-slate-800"></div>
            <div className="absolute -right-10 w-6 h-6 rounded-full bg-[#000000]"></div>
          </div>

          {/* Notice & Security */}
          <div className="text-[11px] text-slate-400 leading-relaxed text-center">
            Present this digital QR pass at the security desk upon entry. Pass is non-transferable and mapped to student roll number.
          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-4 px-6 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Pass</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
