'use client';

import React from 'react';
import { Sliders, RotateCcw, Zap, Sparkles, Activity } from 'lucide-react';
import { AnalyzePayload } from '../lib/api';

interface InputPanelProps {
  payload: AnalyzePayload;
  onChange: (updated: AnalyzePayload) => void;
  onPreloadDefault: () => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  payload,
  onChange,
  onPreloadDefault,
}) => {
  const handleModeChange = (mode: 'canonical' | 'coefficients') => {
    onChange({ ...payload, mode });
  };

  const handleCanonicalChange = (field: 'K' | 'wn' | 'zeta', val: number) => {
    onChange({ ...payload, [field]: val });
  };

  const handleCoeffsChange = (field: 'num' | 'den', strVal: string) => {
    const arr = strVal
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
    onChange({ ...payload, [field]: arr.length > 0 ? arr : [1] });
  };

  const handleSignalChange = (signal: 'step' | 'impulse' | 'ramp') => {
    onChange({ ...payload, input_signal: signal });
  };

  const applyPreset = (presetType: string) => {
    switch (presetType) {
      case 'default':
        onChange({
          mode: 'canonical',
          K: 1.0,
          wn: 2.0,
          zeta: 0.5,
          num: [1.0],
          den: [1.0, 2.0, 4.0],
          input_signal: payload.input_signal,
        });
        break;
      case 'critical':
        onChange({
          mode: 'canonical',
          K: 1.0,
          wn: 2.0,
          zeta: 1.0,
          num: [1.0],
          den: [1.0, 4.0, 4.0],
          input_signal: payload.input_signal,
        });
        break;
      case 'overdamped':
        onChange({
          mode: 'canonical',
          K: 1.0,
          wn: 2.0,
          zeta: 1.5,
          num: [1.0],
          den: [1.0, 6.0, 4.0],
          input_signal: payload.input_signal,
        });
        break;
      case 'undamped':
        onChange({
          mode: 'canonical',
          K: 1.0,
          wn: 2.0,
          zeta: 0.0,
          num: [1.0],
          den: [1.0, 0.0, 4.0],
          input_signal: payload.input_signal,
        });
        break;
      case 'unstable_2nd':
        onChange({
          mode: 'canonical',
          K: 1.0,
          wn: 2.0,
          zeta: -0.3,
          num: [1.0],
          den: [1.0, -1.2, 4.0],
          input_signal: payload.input_signal,
        });
        break;
      case 'unstable_3rd':
        onChange({
          mode: 'coefficients',
          num: [1.0],
          den: [1.0, 1.0, -2.0, 1.0],
          input_signal: payload.input_signal,
        });
        break;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Transfer Function G(s)
          </h2>
        </div>
        <button
          onClick={onPreloadDefault}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          title="Reset to default canonical 2nd order G(s)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Quick Presets Dropdown */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick System Presets
          </span>
        </label>
        <select
          onChange={(e) => applyPreset(e.target.value)}
          defaultValue="default"
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="default">⚡ Underdamped 2nd-Order (K=1, ωn=2, ζ=0.5)</option>
          <option value="critical">🎯 Critically Damped (ζ = 1.0)</option>
          <option value="overdamped">🌊 Overdamped (ζ = 1.5)</option>
          <option value="undamped">〰️ Undamped / Oscillatory (ζ = 0.0)</option>
          <option value="unstable_2nd">⚠️ Unstable 2nd-Order (ζ = -0.3)</option>
          <option value="unstable_3rd">🔥 3rd-Order Unstable (s³ + s² - 2s + 1)</option>
        </select>
      </div>

      {/* Input Mode Switcher */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-2">
          Input Method
        </label>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => handleModeChange('canonical')}
            className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${
              payload.mode === 'canonical'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Canonical (K, ωn, ζ)
          </button>
          <button
            onClick={() => handleModeChange('coefficients')}
            className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${
              payload.mode === 'coefficients'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Coefficients Array
          </button>
        </div>
      </div>

      {/* Mode 1: Canonical Inputs */}
      {payload.mode === 'canonical' ? (
        <div className="space-y-4">
          <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-xs text-blue-950">
            <span className="font-bold block mb-1">Standard 2nd-Order Form:</span>
            <code className="text-blue-900 font-mono text-[11px] bg-blue-100/60 px-1.5 py-0.5 rounded">
              G(s) = K / (s² + 2ζωn·s + ωn²)
            </code>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="font-semibold text-slate-700">Gain (K)</label>
              <span className="font-mono text-slate-600 font-bold">{payload.K ?? 1.0}</span>
            </div>
            <input
              type="number"
              step="0.1"
              value={payload.K ?? 1.0}
              onChange={(e) => handleCanonicalChange('K', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="font-semibold text-slate-700">Natural Freq ωn (rad/s)</label>
              <span className="font-mono text-slate-600 font-bold">{payload.wn ?? 2.0}</span>
            </div>
            <input
              type="number"
              step="0.1"
              min="0.01"
              value={payload.wn ?? 2.0}
              onChange={(e) => handleCanonicalChange('wn', parseFloat(e.target.value) || 0.1)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="font-semibold text-slate-700">Damping Ratio (ζ)</label>
              <span className="font-mono text-slate-600 font-bold">{payload.zeta ?? 0.5}</span>
            </div>
            <input
              type="number"
              step="0.05"
              value={payload.zeta ?? 0.5}
              onChange={(e) => handleCanonicalChange('zeta', parseFloat(e.target.value) ?? 0.5)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
              <span>ζ=0 (Undamped)</span>
              <span>ζ=0.5 (Underdamped)</span>
              <span>ζ=1 (Critical)</span>
            </div>
          </div>
        </div>
      ) : (
        /* Mode 2: Polynomial Coefficients Inputs */
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Numerator Coeffs [b_m, ..., b_0]
            </label>
            <input
              type="text"
              value={(payload.num || [1]).join(', ')}
              onChange={(e) => handleCoeffsChange('num', e.target.value)}
              placeholder="e.g. 1"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Comma-separated high to low degree
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Denominator Coeffs [a_n, ..., a_0]
            </label>
            <input
              type="text"
              value={(payload.den || [1, 2, 4]).join(', ')}
              onChange={(e) => handleCoeffsChange('den', e.target.value)}
              placeholder="e.g. 1, 2, 4"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Characteristic Eq: a_n·sⁿ + ... + a_0 = 0
            </span>
          </div>
        </div>
      )}

      <hr className="border-slate-100" />

      {/* Input Test Signal Selector */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-2 flex items-center justify-between">
          <span>Input Test Signal X(t)</span>
          <Zap className="w-3.5 h-3.5 text-amber-500" />
        </label>

        <div className="grid grid-cols-3 gap-2">
          {(['step', 'impulse', 'ramp'] as const).map((sig) => (
            <button
              key={sig}
              onClick={() => handleSignalChange(sig)}
              className={`py-2 px-2 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                payload.input_signal === sig
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {sig.charAt(0).toUpperCase() + sig.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InputPanel;
