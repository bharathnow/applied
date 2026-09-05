'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { BodeData } from '../lib/api';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface BodePlotProps {
  data: BodeData;
}

export const BodePlot: React.FC<BodePlotProps> = ({ data }) => {
  const { frequency, magnitude_db, phase_deg, gain_margin_db, phase_margin_deg } = data;

  const magPlotData: any[] = [
    {
      x: frequency,
      y: magnitude_db,
      mode: 'lines',
      type: 'scatter',
      name: 'Magnitude (dB)',
      line: { color: '#2563EB', width: 2 },
    },
    {
      x: [frequency[0], frequency[frequency.length - 1]],
      y: [0, 0],
      mode: 'lines',
      line: { color: '#DC2626', width: 1, dash: 'dash' },
      name: '0 dB Line',
      hoverinfo: 'none',
    },
  ];

  const phasePlotData: any[] = [
    {
      x: frequency,
      y: phase_deg,
      mode: 'lines',
      type: 'scatter',
      name: 'Phase (deg)',
      line: { color: '#7C3AED', width: 2 },
    },
    {
      x: [frequency[0], frequency[frequency.length - 1]],
      y: [-180, -180],
      mode: 'lines',
      line: { color: '#DC2626', width: 1, dash: 'dash' },
      name: '-180° Line',
      hoverinfo: 'none',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Margins Banner */}
      <div className="flex flex-wrap items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
        <div className="flex items-center gap-4 font-mono">
          <div>
            <span className="text-slate-500 mr-1.5 font-sans">Gain Margin (GM):</span>
            <span className="font-bold text-slate-800">{gain_margin_db} dB</span>
          </div>
          <div>
            <span className="text-slate-500 mr-1.5 font-sans">Phase Margin (PM):</span>
            <span className="font-bold text-slate-800">{phase_margin_deg}°</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-500 italic">
          Stability criterion: GM &gt; 0 dB and PM &gt; 0° for closed-loop stability
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Magnitude Plot */}
        <div className="w-full h-[320px] bg-white rounded-xl border border-slate-200 p-2 shadow-2xs">
          <Plot
            data={magPlotData}
            layout={{
              autosize: true,
              title: {
                text: '<b>Bode Magnitude Response</b>',
                font: { size: 13, color: '#1E293B' },
              },
              xaxis: {
                title: 'Frequency ω (rad/s)',
                type: 'log',
                gridcolor: '#F1F5F9',
              },
              yaxis: {
                title: 'Magnitude (dB)',
                gridcolor: '#F1F5F9',
              },
              margin: { l: 50, r: 20, t: 40, b: 40 },
              showlegend: false,
              hovermode: 'x unified',
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
            config={{ responsive: true, displayModeBar: true, displaylogo: false }}
          />
        </div>

        {/* Phase Plot */}
        <div className="w-full h-[320px] bg-white rounded-xl border border-slate-200 p-2 shadow-2xs">
          <Plot
            data={phasePlotData}
            layout={{
              autosize: true,
              title: {
                text: '<b>Bode Phase Response</b>',
                font: { size: 13, color: '#1E293B' },
              },
              xaxis: {
                title: 'Frequency ω (rad/s)',
                type: 'log',
                gridcolor: '#F1F5F9',
              },
              yaxis: {
                title: 'Phase (degrees)',
                gridcolor: '#F1F5F9',
              },
              margin: { l: 50, r: 20, t: 40, b: 40 },
              showlegend: false,
              hovermode: 'x unified',
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
            config={{ responsive: true, displayModeBar: true, displaylogo: false }}
          />
        </div>
      </div>
    </div>
  );
};

export default BodePlot;
