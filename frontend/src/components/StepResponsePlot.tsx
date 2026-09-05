'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { TimeResponseData } from '../lib/api';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface StepResponsePlotProps {
  data: TimeResponseData;
}

export const StepResponsePlot: React.FC<StepResponsePlotProps> = ({ data }) => {
  const { time, response, input, input_signal, metrics } = data;

  const plotData: any[] = [
    // Output response curve
    {
      x: time,
      y: response,
      mode: 'lines',
      type: 'scatter',
      name: `Output y(t)`,
      line: { color: '#2563EB', width: 2.5 },
    },
  ];

  // Add input signal if step or ramp
  if (input_signal === 'step' || input_signal === 'ramp') {
    plotData.push({
      x: time,
      y: input,
      mode: 'lines',
      type: 'scatter',
      name: `Input u(t) (${input_signal})`,
      line: { color: '#94A3B8', width: 1.5, dash: 'dash' },
    });
  }

  // Add ±2% settling time band for step response
  if (input_signal === 'step' && Math.abs(metrics.final_value) > 1e-4) {
    const yFinal = metrics.final_value;
    const bandUpper = yFinal * 1.02;
    const bandLower = yFinal * 0.98;

    plotData.push(
      {
        x: [time[0], time[time.length - 1]],
        y: [bandUpper, bandUpper],
        mode: 'lines',
        line: { color: '#10B981', width: 1, dash: 'dot' },
        name: '+2% Settling Band',
        hoverinfo: 'none',
      },
      {
        x: [time[0], time[time.length - 1]],
        y: [bandLower, bandLower],
        mode: 'lines',
        line: { color: '#10B981', width: 1, dash: 'dot' },
        name: '-2% Settling Band',
        hoverinfo: 'none',
      }
    );

    // Annotate Peak Point if overshoot exists
    if (metrics.overshoot_percent > 0) {
      plotData.push({
        x: [metrics.peak_time],
        y: [metrics.peak_value],
        mode: 'markers+text',
        type: 'scatter',
        name: `Peak Overshoot (${metrics.overshoot_percent}%)`,
        marker: { color: '#DC2626', size: 10, symbol: 'diamond' },
        text: [`Mp: ${metrics.overshoot_percent}% at ${metrics.peak_time}s`],
        textposition: 'top center',
        textfont: { color: '#991B1B', size: 11 },
      });
    }

    // Annotate Settling Time point
    if (typeof metrics.settling_time === 'number' && metrics.settling_time > 0) {
      plotData.push({
        x: [metrics.settling_time],
        y: [yFinal],
        mode: 'markers+text',
        type: 'scatter',
        name: `Settling Time ts (${metrics.settling_time}s)`,
        marker: { color: '#059669', size: 9, symbol: 'square' },
        text: [`ts: ${metrics.settling_time}s`],
        textposition: 'bottom right',
        textfont: { color: '#047857', size: 11 },
      });
    }
  }

  const titleStr = `${input_signal.charAt(0).toUpperCase() + input_signal.slice(1)} Response y(t)`;

  return (
    <div className="w-full h-[380px] bg-white rounded-xl border border-slate-200 p-2 shadow-2xs">
      <Plot
        data={plotData}
        layout={{
          autosize: true,
          title: {
            text: `<b>${titleStr}</b>`,
            font: { size: 14, color: '#1E293B' },
          },
          xaxis: {
            title: 'Time t (seconds)',
            gridcolor: '#F1F5F9',
            zeroline: true,
          },
          yaxis: {
            title: 'Amplitude',
            gridcolor: '#F1F5F9',
            zeroline: true,
          },
          margin: { l: 50, r: 20, t: 40, b: 40 },
          legend: { orientation: 'h', x: 0, y: 1.15 },
          hovermode: 'x unified',
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        config={{ responsive: true, displayModeBar: true, displaylogo: false }}
      />
    </div>
  );
};

export default StepResponsePlot;
