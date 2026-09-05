'use client';

import React from 'react';
import { FileText, Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw, Compass } from 'lucide-react';

interface HeaderProps {
  verdict?: 'Stable' | 'Marginally Stable' | 'Unstable';
  onGenerateReport: () => void;
  isGeneratingPdf: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  verdict = 'Stable',
  onGenerateReport,
  isGeneratingPdf,
}) => {
  const getBadgeStyle = () => {
    switch (verdict) {
      case 'Stable':
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
          dot: 'bg-emerald-500 animate-pulse',
          icon: <CheckCircle className="w-4 h-4 text-emerald-600 mr-1.5" />,
        };
      case 'Marginally Stable':
        return {
          bg: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
          dot: 'bg-amber-500 animate-pulse',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 mr-1.5" />,
        };
      case 'Unstable':
        return {
          bg: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
          dot: 'bg-rose-500 animate-pulse',
          icon: <XCircle className="w-4 h-4 text-rose-600 mr-1.5" />,
        };
    }
  };

  const badge = getBadgeStyle();

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-xl shadow-md">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white">
                Control System Stability Analysis
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Laplace Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Laplace Transform Techniques, S-Plane Pole-Zero Mapping &amp; Time-Frequency Simulation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div className={`flex items-center px-3 py-1.5 rounded-full border text-xs font-bold shadow-xs ${badge.bg}`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${badge.dot}`} />
            {verdict.toUpperCase()}
          </div>

          {/* Download PDF Button */}
          <button
            onClick={onGenerateReport}
            disabled={isGeneratingPdf}
            className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-blue-500/20 transition-all duration-200 disabled:opacity-60 cursor-pointer"
          >
            {isGeneratingPdf ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Compiling Report...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report PDF
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
