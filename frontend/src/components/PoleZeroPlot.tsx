'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { PoleZero } from '../lib/api';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface PoleZeroPlotProps {
  poles: PoleZero[];
  zeros: PoleZero[];
}

export const PoleZeroPlot: React.FC<PoleZeroPlotProps> = ({ poles, zeros }) => {
  const pReal = poles.map((p) => p.real);
  const pImag = poles.map((p) => p.imag);

  const zReal = zeros.map((z) => z.real);
  const zImag = zeros.map((z) => z.imag);

  // Compute limits
  const maxReal = Math.max(2.0, ...poles.map((p) => Math.abs(p.real)), ...zeros.map((z) => Math.abs(z.real)));
  const maxImag = Math.max(2.0, ...poles.map((p) => Math.abs(p.imag)), ...zeros.map((z) => Math.abs(z.imag)));

  const limitX = maxReal * 1.3;
  const limitY = maxImag * 1.3;

  const plotData: any[] = [
    // Stable LHP region
    {
      x: [-limitX, 0, 0, -limitX],
      y: [-limitY, -limitY, limitY, limitY],
      fill: 'toself',
      fillcolor: 'rgba(16, 185, 129, 0.06)',
      line: { color: 'transparent' },
      name: 'Stable Region (LHP)',
      hoverinfo: 'name',
      type: 'scatter',
    },
    // Unstable RHP region
    {
      x: [0, limitX, limitX, 0],
      y: [-limitY, -limitY, limitY, limitY],
      fill: 'toself',
      fillcolor: 'rgba(239, 68, 68, 0.08)',
      line: { color: 'transparent' },
      name: 'Unstable Region (RHP)',
      hoverinfo: 'name',
      type: 'scatter',
    },
    // Real and Imaginary axes
    {
      x: [-limitX, limitX],
      y: [0, 0],
      mode: 'lines',
      line: { color: '#64748B', width: 1.5, dash: 'dash' },
      showlegend: false,
      hoverinfo: 'none',
      type: 'scatter',
    },
    {
      x: [0, 0],
      y: [-limitY, limitY],
      mode: 'lines',
      line: { color: '#64748B', width: 1.5, dash: 'dash' },
      showlegend: false,
      hoverinfo: 'none',
      type: 'scatter',
    },
  ];

  // Add Poles (×)
  if (poles.length > 0) {
    plotData.push({
      x: pReal,
      y: pImag,
      mode: 'markers',
      type: 'scatter',
      name: 'Poles (×)',
      marker: {
        symbol: 'x',
        size: 14,
        color: '#DC2626',
        line: { width: 3 },
      },
      text: poles.map((p) => `Pole: ${p.real.toFixed(3)} + ${p.imag.toFixed(3)}j`),
      hoverinfo: 'text',
    });
  }

  // Add Zeros (○)
  if (zeros.length > 0) {
    plotData.push({
      x: zReal,
      y: zImag,
      mode: 'markers',
      type: 'scatter',
      name: 'Zeros (○)',
      marker: {
        symbol: 'circle-open',
        size: 14,
        color: '#2563EB',
        line: { width: 3 },
      },
      text: zeros.map((z) => `Zero: ${z.real.toFixed(3)} + ${z.imag.toFixed(3)}j`),
      hoverinfo: 'text',
    });
  }

  return (
    <div className="w-full h-[360px] bg-white rounded-xl border border-slate-200 p-2 shadow-2xs">
      <Plot
        data={plotData}
        layout={{
          autosize: true,
          title: {
            text: '<b>S-Plane Pole-Zero Map</b>',
            font: { size: 14, color: '#1E293B' },
          },
          xaxis: {
            title: 'Real Axis σ (sec⁻¹)',
            range: [-limitX, limitX],
            gridcolor: '#F1F5F9',
            zeroline: false,
          },
          yaxis: {
            title: 'Imaginary Axis jω (rad/s)',
            range: [-limitY, limitY],
            gridcolor: '#F1F5F9',
            zeroline: false,
          },
          margin: { l: 50, r: 20, t: 40, b: 40 },
          legend: { orientation: 'h', x: 0, y: 1.15 },
          hovermode: 'closest',
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        config={{ responsive: true, displayModeBar: true, displaylogo: false }}
      />
    </div>
  );
};

export default PoleZeroPlot;
