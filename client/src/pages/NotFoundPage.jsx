import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 text-center text-slate-100">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto text-2xl font-bold font-mono">
          404
        </div>
        <h1 className="text-3xl font-extrabold text-white font-['Outfit']">Page Not Found</h1>
        <p className="text-sm text-slate-400">
          The campus event or page you requested does not exist or has been relocated.
        </p>
        <div className="pt-3 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Campus Home
          </Link>
          <Link
            to="/events"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-2"
          >
            <Compass className="w-4 h-4" /> Browse Events
          </Link>
        </div>
      </div>
    </div>
  );
}
