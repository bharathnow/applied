'use client';

import React from 'react';
import { AnalysisResponse } from '../lib/api';
import PoleZeroPlot from './PoleZeroPlot';
import { ShieldCheck, AlertTriangle, XCircle, Grid, Cpu, CheckCircle2 } from 'lucide-react';

interface Module2Props {
  data: AnalysisResponse;
}

export const Module2Stability: React.FC<Module2Props> = ({ data }) => {
  const { poles_zeros, routh, parameters } = data;
  const { matrix, sign_changes, verdict } = routh;

  const n = matrix.length - 1;

  const getVerdictStyle = () => {
    switch (verdict) {
      case 'Stable':
        return {
          cardBg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
          badgeBg: 'bg-emerald-600 text-white',
          icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
          desc: 'All system poles strictly lie in the Open Left-Half of the Complex S-Plane (Re(p) < 0). System is BIBO Stable.',
        };
      case 'Marginally Stable':
        return {
          cardBg: 'bg-amber-50 border-amber-200 text-amber-950',
          badgeBg: 'bg-amber-600 text-white',
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          desc: 'System possesses non-repeated purely imaginary poles (Re(p) = 0). Output exhibits sustained non-decaying oscillations.',
        };
      case 'Unstable':
        return {
          cardBg: 'bg-rose-50 border-rose-200 text-rose-950',
          badgeBg: 'bg-rose-600 text-white',
          icon: <XCircle className="w-6 h-6 text-rose-600" />,
          desc: 'System possesses one or more poles in the Right-Half of the S-Plane (Re(p) > 0) or repeated imaginary poles. Output grows unbounded.',
        };
    }
  };

  const verdictStyle = getVerdictStyle();

  return (
    <div className="space-y-6">
      {/* Verdict Announcement Card */}
      <div className={`p-5 rounded-xl border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${verdictStyle.cardBg}`}>
        <div className="flex items-center gap-3">
          {verdictStyle.icon}
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${verdictStyle.badgeBg}`}>
                {verdict}
              </span>
              <span className="text-xs text-slate-600 font-medium">
                ({sign_changes} sign change{sign_changes === 1 ? '' : 's'} in 1st column)
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-1.5 max-w-2xl">
              {verdictStyle.desc}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Pole-Zero Plot & Routh Array */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: S-Plane Pole-Zero Map */}
        <div className="space-y-3">
          <PoleZeroPlot poles={poles_zeros.poles} zeros={poles_zeros.zeros} />

          {/* Pole-Zero Values Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Calculated Root Locations
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-semibold text-rose-700 block mb-1">
                  Poles (✖): {poles_zeros.poles.length}
                </span>
                <ul className="bg-rose-50/60 p-2.5 rounded-lg border border-rose-100 font-mono text-[11px] space-y-1 max-h-[100px] overflow-y-auto">
                  {poles_zeros.poles.map((p, idx) => (
                    <li key={idx}>
                      p{idx + 1} = {p.real.toFixed(3)} {p.imag >= 0 ? '+' : ''}{p.imag.toFixed(3)}j
                    </li>
                  ))}
                  {poles_zeros.poles.length === 0 && <li className="text-slate-400">None</li>}
                </ul>
              </div>

              <div>
                <span className="font-semibold text-blue-700 block mb-1">
                  Zeros (⭕): {poles_zeros.zeros.length}
                </span>
                <ul className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-100 font-mono text-[11px] space-y-1 max-h-[100px] overflow-y-auto">
                  {poles_zeros.zeros.map((z, idx) => (
                    <li key={idx}>
                      z{idx + 1} = {z.real.toFixed(3)} {z.imag >= 0 ? '+' : ''}{z.imag.toFixed(3)}j
                    </li>
                  ))}
                  {poles_zeros.zeros.length === 0 && <li className="text-slate-400">None (All at ∞)</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Routh-Hurwitz Matrix */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Routh-Hurwitz Stability Array
                </h3>
              </div>
              <span className="text-[11px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                Order n = {n}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              The 1st column elements must all share the same sign for stability. Sign changes indicate right-half plane poles.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2 border-r border-slate-200">s-Power</th>
                    {matrix[0].map((_, colIdx) => (
                      <th key={colIdx} className="p-2">
                        Col {colIdx + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row, rIdx) => {
                    const rowLabel = `s^${n - rIdx}`;
                    const firstVal = row[0];
                    return (
                      <tr
                        key={rIdx}
                        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                          rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                        }`}
                      >
                        <td className="p-2 font-mono font-bold text-slate-800 bg-slate-100 border-r border-slate-200">
                          {rowLabel}
                        </td>
                        {row.map((val, cIdx) => (
                          <td
                            key={cIdx}
                            className={`p-2 font-mono ${
                              cIdx === 0
                                ? 'font-extrabold text-amber-900 bg-amber-50/80 border-r border-amber-200'
                                : 'text-slate-700'
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-lg text-xs text-amber-900 flex justify-between items-center">
              <span><b>1st Column Sign Changes:</b></span>
              <span className="font-mono font-bold text-sm bg-amber-200/80 px-2 py-0.5 rounded text-amber-950">
                {sign_changes}
              </span>
            </div>
          </div>

          {/* Derived Parameters Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Derived System Parameters
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">DC Gain (K):</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {parameters.dc_gain}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Natural Freq (ωn):</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {parameters.wn !== null ? `${parameters.wn} rad/s` : 'N/A'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Damping Ratio (ζ):</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {parameters.zeta !== null ? parameters.zeta : 'N/A'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Time Constant (τ):</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {parameters.tau !== null ? `${parameters.tau} s` : 'N/A'}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs text-blue-900">
              <span className="font-semibold block">Damping Classification:</span>
              <span className="font-bold text-blue-800 text-sm">{parameters.damping_type}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Module2Stability;
