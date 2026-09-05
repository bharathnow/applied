'use client';

import React, { useState } from 'react';
import { AnalysisResponse } from '../lib/api';
import StepResponsePlot from './StepResponsePlot';
import BodePlot from './BodePlot';
import { Activity, Clock, Percent, Target, TrendingUp, Sliders, ToggleLeft, ToggleRight } from 'lucide-react';

interface Module3Props {
  data: AnalysisResponse;
}

export const Module3Applications: React.FC<Module3Props> = ({ data }) => {
  const [showBode, setShowBode] = useState<boolean>(false);
  const { time_response, bode } = data;
  const metrics = time_response.metrics;

  return (
    <div className="space-y-6">
      {/* Header Banner with Bode Toggle */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>Module 3: Time &amp; Frequency Domain Response</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulates dynamic transient response and evaluates time-domain performance specifications.
          </p>
        </div>

        <button
          onClick={() => setShowBode(!showBode)}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            showBode
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
          }`}
        >
          {showBode ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          {showBode ? 'Hide Bode Frequency Plot' : 'Show Bode Plot (Magnitude & Phase)'}
        </button>
      </div>

      {/* Primary Plot: Time Response */}
      <StepResponsePlot data={time_response} />

      {/* Time-Domain Performance Metrics Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          Time-Domain Performance Specifications ({time_response.input_signal.toUpperCase()} Input)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-teal-600" /> Rise Time (tr)
            </span>
            <span className="font-mono font-bold text-slate-900 text-base block">
              {metrics.rise_time !== 'N/A' ? `${metrics.rise_time} s` : 'N/A'}
            </span>
            <span className="text-[10px] text-slate-400 block">10% to 90% rise</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600" /> Settling Time (ts)
            </span>
            <span className="font-mono font-bold text-slate-900 text-base block">
              {metrics.settling_time !== 'N/A' ? `${metrics.settling_time} s` : 'N/A'}
            </span>
            <span className="text-[10px] text-slate-400 block">2% tolerance band</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-rose-600" /> Peak Overshoot (Mp)
            </span>
            <span className="font-mono font-bold text-slate-900 text-base block">
              {metrics.overshoot_percent}%
            </span>
            <span className="text-[10px] text-slate-400 block">Peak: {metrics.peak_value}</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> Peak Time (tp)
            </span>
            <span className="font-mono font-bold text-slate-900 text-base block">
              {metrics.peak_time} s
            </span>
            <span className="text-[10px] text-slate-400 block">Time to reach max</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-blue-600" /> Steady-State Error (ess)
            </span>
            <span className="font-mono font-bold text-slate-900 text-base block">
              {metrics.steady_state_error}
            </span>
            <span className="text-[10px] text-slate-400 block">Target vs Final val</span>
          </div>
        </div>
      </div>

      {/* Bode Plot Toggle Section */}
      {showBode && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-purple-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600" />
            Frequency Domain Analysis (Bode Diagrams)
          </h3>
          <BodePlot data={bode} />
        </div>
      )}
    </div>
  );
};

export default Module3Applications;
