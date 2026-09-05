'use client';

import React from 'react';
import { ShieldCheck, Target, Clock, TrendingUp, AlertCircle, Percent } from 'lucide-react';
import { AnalysisResponse } from '../lib/api';

interface SummaryCardsProps {
  data: AnalysisResponse | null;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ data }) => {
  if (!data) return null;

  const verdict = data.routh.verdict;
  const metrics = data.time_response.metrics;
  const poles = data.poles_zeros.poles;

  const getVerdictCardStyle = () => {
    switch (verdict) {
      case 'Stable':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
          badge: 'text-emerald-700 font-bold',
        };
      case 'Marginally Stable':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
          icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
          badge: 'text-amber-700 font-bold',
        };
      case 'Unstable':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-900',
          icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
          badge: 'text-rose-700 font-bold',
        };
    }
  };

  const verdictStyle = getVerdictCardStyle();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Card 1: Stability Verdict */}
      <div className={`p-4 rounded-xl border shadow-2xs flex flex-col justify-between ${verdictStyle.bg}`}>
        <div className="flex items-center justify-between text-xs font-semibold opacity-80">
          <span>Stability Verdict</span>
          {verdictStyle.icon}
        </div>
        <div className="mt-2">
          <span className={`text-base font-extrabold tracking-tight ${verdictStyle.badge}`}>
            {verdict}
          </span>
          <p className="text-[10px] opacity-75 mt-0.5">
            {data.routh.sign_changes} sign change(s)
          </p>
        </div>
      </div>

      {/* Card 2: Poles Count */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Poles &amp; Zeros</span>
          <Target className="w-4 h-4 text-blue-500" />
        </div>
        <div className="mt-2">
          <span className="text-lg font-bold text-slate-900 font-mono">
            {poles.length} Pole(s)
          </span>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate font-mono">
            {poles.length > 0
              ? `Dom: ${poles[0].real.toFixed(2)} ${poles[0].imag >= 0 ? '+' : ''}${poles[0].imag.toFixed(2)}j`
              : 'None'}
          </p>
        </div>
      </div>

      {/* Card 3: Settling Time */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Settling Time (ts 2%)</span>
          <Clock className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="mt-2">
          <span className="text-lg font-bold text-slate-900 font-mono">
            {typeof metrics.settling_time === 'number'
              ? `${metrics.settling_time} s`
              : metrics.settling_time}
          </span>
          <p className="text-[10px] text-slate-500 mt-0.5">2% tolerance band</p>
        </div>
      </div>

      {/* Card 4: Rise Time */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Rise Time (tr)</span>
          <TrendingUp className="w-4 h-4 text-teal-500" />
        </div>
        <div className="mt-2">
          <span className="text-lg font-bold text-slate-900 font-mono">
            {typeof metrics.rise_time === 'number'
              ? `${metrics.rise_time} s`
              : metrics.rise_time}
          </span>
          <p className="text-[10px] text-slate-500 mt-0.5">10% to 90% rise</p>
        </div>
      </div>

      {/* Card 5: Peak Overshoot */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Peak Overshoot (Mp)</span>
          <Percent className="w-4 h-4 text-rose-500" />
        </div>
        <div className="mt-2">
          <span className="text-lg font-bold text-slate-900 font-mono">
            {metrics.overshoot_percent}%
          </span>
          <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
            Peak: {metrics.peak_value}
          </p>
        </div>
      </div>

      {/* Card 6: Steady-State Error */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Steady-State Error (ess)</span>
          <Target className="w-4 h-4 text-amber-500" />
        </div>
        <div className="mt-2">
          <span className="text-lg font-bold text-slate-900 font-mono">
            {metrics.steady_state_error}
          </span>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Final val: {metrics.final_value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
