'use client';

import React from 'react';
import { AnalysisResponse } from '../lib/api';
import MathBlock from './MathBlock';
import { BookOpen, FunctionSquare, Cpu, ArrowRight } from 'lucide-react';

interface Module1Props {
  data: AnalysisResponse;
}

export const Module1Fundamentals: React.FC<Module1Props> = ({ data }) => {
  const { latex, input_signal } = data;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-blue-300" />
          <h2 className="text-lg font-bold">Module 1: System Fundamentals &amp; Laplace Domain</h2>
        </div>
        <p className="text-xs text-blue-150 leading-relaxed max-w-3xl">
          The Laplace transform converts time-domain differential equations describing physical control systems 
          into algebraic algebraic equations in the complex frequency s-plane: 
          <span className="font-mono bg-blue-800/60 px-2 py-0.5 rounded text-blue-200 ml-1">
            L&#123;f(t)&#125; = F(s) = ∫₀^∞ f(t) e^(-st) dt
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Input Signal Laplace Transform */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm border-b border-slate-100 pb-2">
            <FunctionSquare className="w-4 h-4" />
            <h3>1. Input Test Signal X(s)</h3>
          </div>
          <p className="text-xs text-slate-600">
            Selected test signal: <b className="capitalize text-slate-900">{input_signal}</b>
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex justify-center items-center min-h-[60px]">
            <MathBlock math={latex.input_str} block className="text-base text-slate-900" />
          </div>
          <div className="text-[11px] text-slate-500 bg-blue-50/50 p-2.5 rounded border border-blue-100">
            {input_signal === 'step' && 'Unit Step Input u(t) = 1 (t ≥ 0) → X(s) = 1/s'}
            {input_signal === 'impulse' && 'Dirac Impulse δ(t) → X(s) = 1'}
            {input_signal === 'ramp' && 'Unit Ramp Input r(t) = t (t ≥ 0) → X(s) = 1/s²'}
          </div>
        </div>

        {/* Characteristic Equation */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm border-b border-slate-100 pb-2">
            <Cpu className="w-4 h-4" />
            <h3>2. System Characteristic Equation</h3>
          </div>
          <p className="text-xs text-slate-600">
            Set Denominator polynomial Den(s) = 0:
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex justify-center items-center min-h-[60px]">
            <MathBlock math={latex.char_eq_str} block className="text-base text-slate-900 font-semibold" />
          </div>
          <div className="text-[11px] text-slate-500 bg-indigo-50/50 p-2.5 rounded border border-indigo-100">
            The roots of the Characteristic Equation determine all system poles and govern absolute stability.
          </div>
        </div>
      </div>

      {/* Symbolic Transfer Function H(s) and Output Y(s) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>3. Symbolic Transfer Function H(s) &amp; Output Response Y(s)</span>
          </h3>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            H(s) = Output(s) / Input(s)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700">Open/Closed-Loop Transfer Function H(s):</span>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex justify-center items-center min-h-[80px]">
              <MathBlock math={latex.tf_str} block className="text-lg text-blue-900 font-bold" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700">Overall System Laplace Output Y(s) = H(s)·X(s):</span>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex justify-center items-center min-h-[80px]">
              <MathBlock math={latex.output_str} block className="text-lg text-indigo-900 font-bold" />
            </div>
          </div>
        </div>
      </div>

      {/* Viva Defense Explanation Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <ArrowRight className="w-4 h-4 text-blue-600" />
          Viva Defense Quick Reference (Theory)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <b className="text-blue-900 block mb-1">Transfer Function Definition</b>
            Linear Time-Invariant (LTI) ratio of Laplace output Y(s) to input X(s) assuming zero initial conditions.
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <b className="text-blue-900 block mb-1">Role of Laplace Transform</b>
            Converts time-domain convolution <code className="font-mono">y(t) = h(t) * x(t)</code> into algebraic multiplication <code className="font-mono">Y(s) = H(s)X(s)</code>.
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <b className="text-blue-900 block mb-1">Characteristic Equation</b>
            The denominator roots dictate the exponential dynamic modes <code className="font-mono">e^(p_i · t)</code> of the system response.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Module1Fundamentals;
