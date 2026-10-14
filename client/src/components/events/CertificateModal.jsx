import { X, Award, Printer, ShieldCheck } from 'lucide-react';

export default function CertificateModal({ certificate, onClose }) {
  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl my-6 bg-[#0f172a] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden animate-fade-in text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Certificate Frame Bar */}
        <div className="bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-800 p-3 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Award className="w-5 h-5 text-yellow-200" />
            <span className="font-bold text-sm tracking-wider font-['Outfit'] uppercase">
              Verified Certificate of Participation
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Body (Printable) */}
        <div className="p-8 sm:p-12 m-4 sm:m-6 rounded-2xl bg-gradient-to-b from-[#090d16] via-[#0d1322] to-[#090d16] border-2 border-amber-500/30 text-center relative overflow-hidden shadow-inner">
          
          {/* Subtle Background Seal */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Award className="w-96 h-96 text-amber-300" />
          </div>

          <div className="relative z-10 space-y-6">
            
            {/* College Crest */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-widest uppercase">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              APEX UNIVERSITY • CAMPUS STUDENT COUNCIL
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-300 font-['Outfit'] uppercase tracking-wider">
                Certificate of Completion
              </h1>
              <p className="text-xs text-slate-400 uppercase tracking-widest">
                This credential certifies that
              </p>
            </div>

            {/* Student Name */}
            <div className="py-2 border-b-2 border-amber-500/30 max-w-md mx-auto">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                {certificate.userName}
              </span>
              <p className="text-xs text-cyan-400 font-mono mt-1">
                Roll No: {certificate.userRollNo || 'CS-2024-042'} • {certificate.department || 'Computer Science'}
              </p>
            </div>

            {/* Event Name */}
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              has successfully participated and completed all official requirements in the campus event:
            </p>
            <div className="text-xl sm:text-2xl font-bold text-indigo-300 font-['Outfit'] max-w-xl mx-auto">
              "{certificate.eventTitle}"
            </div>

            {/* Metadata and Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-8 max-w-lg mx-auto border-t border-slate-800 text-left">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Credential ID</span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {certificate.ticketId ? `CERT-${certificate.ticketId.replace('TK-', '')}` : 'CERT-APEX-9481'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Date: {certificate.eventDate || 'October 2026'}</span>
              </div>
              <div className="text-right">
                <div className="font-serif italic text-lg text-amber-200">Dr. Sarah Mitchell</div>
                <div className="w-28 h-0.5 bg-amber-500/40 ml-auto my-1"></div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Dean of Student Affairs</span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 px-6 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print / Save as PDF</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
