export interface PoleZero {
  real: number;
  imag: number;
}

export interface SystemParameters {
  order: number;
  dc_gain: number | string;
  wn: number | null;
  zeta: number | null;
  tau: number | null;
  damping_type: string;
}

export interface TimeResponseMetrics {
  final_value: number;
  peak_value: number;
  peak_time: number;
  overshoot_percent: number;
  rise_time: number | string;
  settling_time: number | string;
  steady_state_error: number;
}

export interface TimeResponseData {
  time: number[];
  response: number[];
  input: number[];
  input_signal: string;
  metrics: TimeResponseMetrics;
}

export interface BodeData {
  frequency: number[];
  magnitude_db: number[];
  phase_deg: number[];
  gain_margin_db: number | string;
  phase_margin_deg: number | string;
}

export interface RouthData {
  matrix: number[][];
  sign_changes: number;
  verdict: 'Stable' | 'Marginally Stable' | 'Unstable';
}

export interface AnalysisResponse {
  num: number[];
  den: number[];
  input_signal: string;
  latex: {
    num_str: string;
    den_str: string;
    tf_str: string;
    char_eq_str: string;
    input_str: string;
    output_str: string;
  };
  poles_zeros: {
    zeros: PoleZero[];
    poles: PoleZero[];
  };
  routh: RouthData;
  parameters: SystemParameters;
  time_response: TimeResponseData;
  bode: BodeData;
}

export interface AnalyzePayload {
  mode: 'canonical' | 'coefficients';
  num?: number[];
  den?: number[];
  K?: number;
  wn?: number;
  zeta?: number;
  input_signal: 'step' | 'impulse' | 'ramp';
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090/api';

export async function fetchAnalysis(payload: AnalyzePayload): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch analysis' }));
    throw new Error(err.detail || 'Analysis request failed');
  }

  return response.json();
}

export async function downloadPdfReport(payload: AnalyzePayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Report generation failed');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Control_System_Stability_Report.pdf';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
