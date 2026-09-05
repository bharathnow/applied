'use client';

import React, { useState, useEffect } from 'react';
import { fetchAnalysis, downloadPdfReport, AnalyzePayload, AnalysisResponse } from '../lib/api';
import Header from '../components/Header';
import InputPanel from '../components/InputPanel';
import SummaryCards from '../components/SummaryCards';
import MathBlock from '../components/MathBlock';
import PoleZeroPlot from '../components/PoleZeroPlot';
import StepResponsePlot from '../components/StepResponsePlot';
import BodePlot from '../components/BodePlot';
import {
  BookOpen,
  ShieldCheck,
  Activity,
  AlertCircle,
  RefreshCw,
  FunctionSquare,
  Cpu,
  Grid,
  CheckCircle2,
  Clock,
  Percent,
  Target,
  TrendingUp,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

const DEFAULT_PAYLOAD: AnalyzePayload = {
  mode: 'canonical',
  K: 1.0,
  wn: 2.0,
  zeta: 0.5,
  num: [1.0],
  den: [1.0, 2.0, 4.0],
  input_signal: 'step',
};

export default function Home() {
  const [payload, setPayload] = useState<AnalyzePayload>(DEFAULT_PAYLOAD);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [showBode, setShowBode] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchAnalysis(payload)
      .then((data) => {
        if (isMounted) {
          setAnalysis(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to connect to Python backend API');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [payload]);

  const handlePreloadDefault = () => {
    setPayload(DEFAULT_PAYLOAD);
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingPdf(true);
      await downloadPdfReport(payload);
    } catch (err: any) {
      alert('Report generation failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <Header
        verdict={analysis?.routh.verdict}
        onGenerateReport={handleGenerateReport}
        isGeneratingPdf={isGeneratingPdf}
      />

      {/* Main Unified Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Control Input Panel */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
          <InputPanel
            payload={payload}
            onChange={setPayload}
            onPreloadDefault={handlePreloadDefault}
          />
        </aside>

        {/* Right Area - Unified Complete Analysis View */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Top KPI Cards Summary */}
          <SummaryCards data={analysis} />

          {/* Loading Indicator */}
          {loading && !analysis && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3 shadow-xs">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm font-semibold">Computing Control System Parameters...</p>
            </div>
          )}

          {/* Backend Error Alert */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-4 flex items-center gap-3 text-xs font-medium shadow-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <b className="block">Backend Connection Error:</b>
                {error}. Make sure FastAPI is running on <code className="font-mono bg-rose-100 px-1 py-0.5 rounded">http://localhost:8000</code>.
              </div>
            </div>
          )}

          {/* Complete Unified Analysis View */}
          {analysis && (
            <div className="space-y-6">
              {/* SECTION 1: SYMBOLIC MATHEMATICAL FOUNDATION */}
              <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900">
                      1. Symbolic Laplace Domain Representations
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full font-semibold border border-blue-100">
                    Input: {analysis.input_signal.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Transfer Function H(s) */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <FunctionSquare className="w-4 h-4 text-blue-600" />
                      Transfer Function H(s)
                    </span>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 flex justify-center items-center min-h-[70px]">
                      <MathBlock math={analysis.latex.tf_str} block className="text-lg text-blue-900 font-bold" />
                    </div>
                  </div>

                  {/* Characteristic Equation */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-indigo-600" />
                      Characteristic Equation D(s) = 0
                    </span>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 flex justify-center items-center min-h-[70px]">
                      <MathBlock math={analysis.latex.char_eq_str} block className="text-lg text-indigo-900 font-bold" />
                    </div>
                  </div>

                  {/* Input Signal X(s) */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Input Transform X(s)
                    </span>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 flex justify-center items-center min-h-[60px]">
                      <MathBlock math={analysis.latex.input_str} block className="text-base text-slate-900" />
                    </div>
                  </div>

                  {/* Output Response Y(s) */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Output Response Y(s) = H(s)·X(s)
                    </span>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 flex justify-center items-center min-h-[60px]">
                      <MathBlock math={analysis.latex.output_str} block className="text-base text-slate-900" />
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 2: STABILITY & S-PLANE POLE-ZERO ANALYSIS */}
              <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900">
                      2. S-Plane Pole-Zero Mapping &amp; Routh-Hurwitz Stability
                    </h2>
                  </div>
                  <span className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
                    analysis.routh.verdict === 'Stable'
                      ? 'bg-emerald-100 text-emerald-800'
                      : analysis.routh.verdict === 'Marginally Stable'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {analysis.routh.verdict}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Pole Zero Plot */}
                  <div className="lg:col-span-7 space-y-3">
                    <PoleZeroPlot poles={analysis.poles_zeros.poles} zeros={analysis.poles_zeros.zeros} />
                  </div>

                  {/* Routh Array & Parameters */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Routh Array Matrix */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Grid className="w-4 h-4 text-amber-600" />
                          Routh Array Table
                        </span>
                        <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                          Order n = {analysis.routh.matrix.length - 1}
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-center border-collapse">
                          <thead>
                            <tr className="bg-slate-200/70 text-slate-700 font-bold border-b border-slate-300">
                              <th className="p-1.5 border-r border-slate-300">s-Power</th>
                              {analysis.routh.matrix[0].map((_, cIdx) => (
                                <th key={cIdx} className="p-1.5">Col {cIdx + 1}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {analysis.routh.matrix.map((row, rIdx) => (
                              <tr key={rIdx} className="border-b border-slate-200">
                                <td className="p-1.5 font-mono font-bold text-slate-800 bg-slate-200/50 border-r border-slate-300">
                                  s^{analysis.routh.matrix.length - 1 - rIdx}
                                </td>
                                {row.map((val, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`p-1.5 font-mono ${
                                      cIdx === 0
                                        ? 'font-extrabold text-amber-950 bg-amber-100/80 border-r border-amber-300'
                                        : 'text-slate-700'
                                    }`}
                                  >
                                    {val}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="bg-amber-100/50 border border-amber-200 p-2.5 rounded-lg text-xs text-amber-950 flex justify-between items-center font-medium">
                        <span>Sign Changes in 1st Col:</span>
                        <span className="font-mono font-extrabold text-sm bg-amber-200 px-2 py-0.5 rounded">
                          {analysis.routh.sign_changes}
                        </span>
                      </div>
                    </div>

                    {/* Derived Parameters Grid */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                      <span className="text-xs font-bold text-slate-800 block border-b border-slate-200 pb-2">
                        Derived Parameters &amp; Classification
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-500 block text-[10px]">Natural Freq (ωn):</span>
                          <span className="font-mono font-bold text-slate-900">
                            {analysis.parameters.wn !== null ? `${analysis.parameters.wn} rad/s` : 'N/A'}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-500 block text-[10px]">Damping Ratio (ζ):</span>
                          <span className="font-mono font-bold text-slate-900">
                            {analysis.parameters.zeta !== null ? analysis.parameters.zeta : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-lg text-xs text-blue-900">
                        <span className="text-[10px] font-semibold text-blue-700 block">Damping Classification:</span>
                        <span className="font-extrabold text-blue-900">{analysis.parameters.damping_type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 3: TIME RESPONSE & FREQUENCY DOMAIN (BODE) ANALYSIS */}
              <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                      <Activity className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900">
                      3. Dynamic Time Response &amp; Frequency Domain (Bode) Simulation
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowBode(!showBode)}
                    className="text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    {showBode ? 'Hide Bode Diagrams' : 'Show Bode Diagrams'}
                  </button>
                </div>

                {/* Time Response Plot */}
                <StepResponsePlot data={analysis.time_response} />

                {/* Detailed Performance Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-teal-600" /> Rise Time (tr)
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm block">
                      {analysis.time_response.metrics.rise_time !== 'N/A'
                        ? `${analysis.time_response.metrics.rise_time} s`
                        : 'N/A'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-600" /> Settling Time (ts)
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm block">
                      {analysis.time_response.metrics.settling_time !== 'N/A'
                        ? `${analysis.time_response.metrics.settling_time} s`
                        : 'N/A'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <Percent className="w-3 h-3 text-rose-600" /> Peak Overshoot (Mp)
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm block">
                      {analysis.time_response.metrics.overshoot_percent}%
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" /> Peak Time (tp)
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm block">
                      {analysis.time_response.metrics.peak_time} s
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <Target className="w-3 h-3 text-blue-600" /> Steady-State Error
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm block">
                      {analysis.time_response.metrics.steady_state_error}
                    </span>
                  </div>
                </div>

                {/* Bode Diagrams Section */}
                {showBode && (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-purple-600" />
                      Frequency Domain Analysis (Bode Plots)
                    </h3>
                    <BodePlot data={analysis.bode} />
                  </div>
                )}
              </section>

              {/* SECTION 4: VIVA DEFENSE & METHODOLOGY SUMMARY */}
              <section className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md space-y-4">
                <div className="flex items-center gap-2 text-blue-300">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold tracking-tight">
                    Academic Viva Defense &amp; Theoretical Principles
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 space-y-1.5">
                    <b className="text-blue-300 block font-semibold">1. BIBO Stability Criterion</b>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      A system is Bounded-Input Bounded-Output (BIBO) stable if and only if all roots of the denominator polynomial <MathBlock math="D(s)=0" /> reside strictly in the left-half complex s-plane (<MathBlock math="\Re(p) < 0" />).
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 space-y-1.5">
                    <b className="text-blue-300 block font-semibold">2. Routh-Hurwitz Theorem</b>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Algebraic criterion establishing stability without polynomial factorization. The number of sign changes in column 1 of the Routh array exactly equals the number of unstable RHP poles.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 space-y-1.5">
                    <b className="text-blue-300 block font-semibold">3. Transient Response Specs</b>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      For standard 2nd-order underdamped systems (<MathBlock math="0 < \zeta < 1" />), peak overshoot is <MathBlock math="M_p = e^{-\pi \zeta/\sqrt{1-\zeta^2}} \times 100\%" /> and 2% settling time is <MathBlock math="t_s \approx \frac{4}{\zeta \omega_n}" />.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-4 px-6 text-center text-xs mt-auto font-medium">
        Control System Stability Analysis using Laplace Transform Techniques &copy; 2026 | Next.js &amp; FastAPI Full-Stack Engine
      </footer>
    </div>
  );
}
