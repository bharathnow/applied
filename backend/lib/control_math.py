import numpy as np
import scipy.signal as signal
import control
from typing import List, Dict, Any, Tuple

def poly_to_latex(coeffs: List[float], var_str: str = "s") -> str:
    """Convert polynomial coefficients [a_n, a_{n-1}, ..., a_0] to LaTeX string."""
    coeffs = list(coeffs)
    while len(coeffs) > 1 and abs(coeffs[0]) < 1e-12:
        coeffs.pop(0)
    
    deg = len(coeffs) - 1
    if deg < 0:
        return "0"
    
    terms = []
    for i, c in enumerate(coeffs):
        power = deg - i
        if abs(c) < 1e-9:
            continue
        
        abs_c = abs(c)
        c_str = f"{abs_c:.4g}".rstrip('0').rstrip('.') if isinstance(abs_c, float) else str(abs_c)
        
        if power == 0:
            term = c_str
        elif power == 1:
            term = var_str if c_str == "1" else f"{c_str}{var_str}"
        else:
            term = f"{var_str}^{{{power}}}" if c_str == "1" else f"{c_str}{var_str}^{{{power}}}"
            
        if not terms:
            prefix = "-" if c < 0 else ""
            terms.append(f"{prefix}{term}")
        else:
            prefix = " - " if c < 0 else " + "
            terms.append(f"{prefix}{term}")
            
    return "".join(terms) if terms else "0"


def canonical_to_tf(K: float, wn: float, zeta: float) -> Tuple[List[float], List[float]]:
    """
    Convert canonical 2nd order parameters (K, wn, zeta) to transfer function num/den.
    G(s) = K / (s^2 + 2*zeta*wn*s + wn^2)
    """
    num = [float(K)]
    den = [1.0, 2.0 * float(zeta) * float(wn), float(wn) ** 2]
    return num, den


def compute_poles_zeros(num: List[float], den: List[float]) -> Dict[str, Any]:
    """Compute poles and zeros of H(s) = Num(s)/Den(s)."""
    num_clean = np.trim_zeros(np.array(num, dtype=float), 'f')
    den_clean = np.trim_zeros(np.array(den, dtype=float), 'f')
    
    if len(num_clean) == 0:
        num_clean = np.array([0.0])
    if len(den_clean) == 0:
        den_clean = np.array([1.0])
        
    zeros = np.roots(num_clean) if len(num_clean) > 1 else np.array([])
    poles = np.roots(den_clean) if len(den_clean) > 1 else np.array([])
    
    zeros_list = [{"real": float(np.real(z)), "imag": float(np.imag(z))} for z in zeros]
    poles_list = [{"real": float(np.real(p)), "imag": float(np.imag(p))} for p in poles]
    
    return {
        "zeros": zeros_list,
        "poles": poles_list
    }


def compute_routh_array(den: List[float]) -> Tuple[List[List[float]], int, str]:
    """
    Compute the Routh-Hurwitz array for denominator polynomial.
    Returns: (routh_matrix, num_sign_changes, stability_verdict)
    """
    a = [float(x) for x in den]
    while len(a) > 0 and abs(a[0]) < 1e-12:
        a.pop(0)
        
    n = len(a) - 1
    if n <= 0:
        return [[1.0]], 0, "Stable"
    
    num_cols = (n + 2) // 2
    routh = np.zeros((n + 1, num_cols))
    
    row0 = a[0::2]
    row1 = a[1::2]
    
    routh[0, :len(row0)] = row0
    routh[1, :len(row1)] = row1
    
    eps = 1e-6
    
    for i in range(2, n + 1):
        prev1 = routh[i - 1, :]
        prev2 = routh[i - 2, :]
        
        if abs(prev1[0]) < 1e-10:
            if np.all(np.abs(prev1) < 1e-10):
                aux_power = n - (i - 2)
                aux_coeffs = prev2
                deriv_coeffs = []
                for k, c in enumerate(aux_coeffs):
                    p = aux_power - 2 * k
                    if p > 0:
                        deriv_coeffs.append(c * p)
                
                routh[i - 1, :len(deriv_coeffs)] = deriv_coeffs
                prev1 = routh[i - 1, :]
            else:
                routh[i - 1, 0] = eps
                prev1 = routh[i - 1, :]
                
        pivot = prev1[0]
        for j in range(num_cols - 1):
            routh[i, j] = (pivot * prev2[j + 1] - prev2[0] * prev1[j + 1]) / pivot
            
    routh_list = []
    for r in range(n + 1):
        row_vals = []
        for c in range(num_cols):
            val = float(routh[r, c])
            if abs(val) < 1e-9:
                val = 0.0
            row_vals.append(round(val, 4))
        while len(row_vals) > 1 and row_vals[-1] == 0.0:
            row_vals.pop()
        routh_list.append(row_vals)
        
    first_col = [row[0] for row in routh_list if len(row) > 0]
    
    sign_changes = 0
    current_sign = np.sign(first_col[0]) if len(first_col) > 0 else 1
    if current_sign == 0:
        current_sign = 1
        
    for val in first_col[1:]:
        s = np.sign(val)
        if abs(val) < 1e-5 or s == 0:
            continue
        if s != current_sign:
            sign_changes += 1
            current_sign = s
            
    poles = np.roots(a)
    real_parts = np.real(poles)
    
    if any(r > 1e-6 for r in real_parts) or sign_changes > 0:
        verdict = "Unstable"
    elif any(abs(r) <= 1e-6 for r in real_parts):
        verdict = "Marginally Stable"
    else:
        verdict = "Stable"
        
    return routh_list, sign_changes, verdict


def extract_system_parameters(num: List[float], den: List[float]) -> Dict[str, Any]:
    """Extract K, wn, zeta, tau, damping ratio, damping classification."""
    den_clean = np.trim_zeros(np.array(den, dtype=float), 'f')
    num_clean = np.trim_zeros(np.array(num, dtype=float), 'f')
    
    if len(den_clean) == 0:
        den_clean = np.array([1.0])
    if len(num_clean) == 0:
        num_clean = np.array([0.0])
        
    a_n = den_clean[0]
    den_norm = den_clean / a_n
    num_norm = num_clean / a_n
    
    order = len(den_norm) - 1
    
    if abs(den_norm[-1]) > 1e-9:
        dc_gain = float(num_norm[-1] / den_norm[-1])
    else:
        dc_gain = float('inf')
        
    wn = None
    zeta = None
    tau = None
    damping_type = "N/A"
    
    if order == 1:
        a0 = den_norm[1]
        if abs(a0) > 1e-9:
            tau = float(1.0 / a0)
        damping_type = "First Order System"
        
    elif order == 2:
        a1 = den_norm[1]
        a0 = den_norm[2]
        
        if a0 >= 0:
            wn = float(np.sqrt(a0))
            if wn > 1e-9:
                zeta = float(a1 / (2.0 * wn))
                tau = float(1.0 / (zeta * wn)) if abs(zeta * wn) > 1e-9 else None
            else:
                zeta = 0.0
        else:
            wn = float(np.sqrt(abs(a0)))
            zeta = -1.0
            
        if zeta is not None:
            if zeta > 1.0:
                damping_type = "Overdamped (ζ > 1)"
            elif abs(zeta - 1.0) < 1e-4:
                damping_type = "Critically Damped (ζ = 1)"
            elif 0 < zeta < 1.0:
                damping_type = f"Underdamped (ζ = {zeta:.3f})"
            elif abs(zeta) < 1e-4:
                damping_type = "Undamped / Oscillatory (ζ = 0)"
            else:
                damping_type = f"Unstable (ζ = {zeta:.3f} < 0)"
    else:
        poles = np.roots(den_norm)
        complex_poles = [p for p in poles if abs(np.imag(p)) > 1e-5]
        if complex_poles:
            dom = max(complex_poles, key=lambda p: np.real(p))
            wn = float(np.abs(dom))
            zeta = float(-np.real(dom) / wn) if wn > 1e-9 else 0.0
            tau = float(-1.0 / np.real(dom)) if abs(np.real(dom)) > 1e-9 else None
            damping_type = f"Higher Order (Dominant ζ ≈ {zeta:.3f})"
        else:
            dom_real = max(np.real(poles))
            tau = float(-1.0 / dom_real) if abs(dom_real) > 1e-9 else None
            damping_type = "Higher Order (Real Poles)"

    return {
        "order": order,
        "dc_gain": round(dc_gain, 4) if dc_gain != float('inf') else "∞",
        "wn": round(wn, 4) if wn is not None else None,
        "zeta": round(zeta, 4) if zeta is not None else None,
        "tau": round(tau, 4) if tau is not None else None,
        "damping_type": damping_type
    }


def simulate_time_response(num: List[float], den: List[float], input_signal: str = "step") -> Dict[str, Any]:
    """Simulate system time domain response and compute key parameters."""
    sys = signal.TransferFunction(num, den)
    
    poles = np.roots(den)
    real_parts = [np.real(p) for p in poles if np.real(p) < -1e-5]
    if real_parts:
        min_real = max(real_parts)
        t_settle_approx = 4.0 / abs(min_real)
        t_max = min(max(t_settle_approx * 2.5, 5.0), 50.0)
    else:
        t_max = 10.0
        
    t = np.linspace(0, t_max, 1000)
    input_signal_clean = input_signal.lower()
    
    if input_signal_clean == "impulse":
        t, y = signal.impulse(sys, T=t)
        u = np.zeros_like(t)
        u[0] = 1.0
    elif input_signal_clean == "ramp":
        u = t
        t, y, _ = signal.lsim(sys, U=u, T=t)
    else:
        t, y = signal.step(sys, T=t)
        u = np.ones_like(t)

    t = np.array(t, dtype=float)
    y = np.array(y, dtype=float)
    
    y_final = y[-1]
    y_peak = float(np.max(y))
    t_peak_idx = int(np.argmax(y))
    t_peak = float(t[t_peak_idx])
    
    if abs(y_final) > 1e-6 and y_peak > y_final:
        overshoot_pct = float(((y_peak - y_final) / abs(y_final)) * 100.0)
    else:
        overshoot_pct = 0.0
        
    rise_time = None
    if y_final > 1e-6:
        val_10 = 0.1 * y_final
        val_90 = 0.9 * y_final
        idx_10 = np.where(y >= val_10)[0]
        idx_90 = np.where(y >= val_90)[0]
        if len(idx_10) > 0 and len(idx_90) > 0:
            rise_time = float(t[idx_90[0]] - t[idx_10[0]])
            
    settling_time = None
    band = 0.02 * abs(y_final) if abs(y_final) > 1e-6 else 0.02
    out_of_band = np.where(np.abs(y - y_final) > band)[0]
    if len(out_of_band) > 0:
        last_out_idx = out_of_band[-1]
        if last_out_idx < len(t) - 1:
            settling_time = float(t[last_out_idx + 1])
        else:
            settling_time = float(t[-1])
    else:
        settling_time = 0.0
        
    if input_signal_clean == "step":
        target_ss = 1.0
        ss_error = float(abs(target_ss - y_final))
    elif input_signal_clean == "ramp":
        ss_error = float(abs(t[-1] - y_final))
    else:
        ss_error = float(abs(y_final))
        
    return {
        "time": t.tolist(),
        "response": y.tolist(),
        "input": u.tolist(),
        "input_signal": input_signal_clean,
        "metrics": {
            "final_value": round(float(y_final), 4),
            "peak_value": round(float(y_peak), 4),
            "peak_time": round(float(t_peak), 4),
            "overshoot_percent": round(float(overshoot_pct), 2),
            "rise_time": round(float(rise_time), 4) if rise_time is not None else "N/A",
            "settling_time": round(float(settling_time), 4) if settling_time is not None else "N/A",
            "steady_state_error": round(float(ss_error), 4)
        }
    }


def compute_bode_data(num: List[float], den: List[float]) -> Dict[str, Any]:
    """Compute Bode magnitude and phase response."""
    w = np.logspace(-2, 3, 400)
    w, mag, phase = signal.bode(signal.TransferFunction(num, den), w=w)
    
    try:
        sys = control.TransferFunction(num, den)
        gm, pm, wg, wp = control.margin(sys)
        gm_db = round(float(20 * np.log10(gm)), 2) if gm and gm > 0 and not np.isinf(gm) else "∞"
        pm_deg = round(float(pm), 2) if pm and not np.isnan(pm) and not np.isinf(pm) else "∞"
    except Exception:
        gm_db = "N/A"
        pm_deg = "N/A"
        
    return {
        "frequency": w.tolist(),
        "magnitude_db": mag.tolist(),
        "phase_deg": phase.tolist(),
        "gain_margin_db": gm_db,
        "phase_margin_deg": pm_deg
    }


def analyze_system(num: List[float], den: List[float], input_signal: str = "step") -> Dict[str, Any]:
    """Full analysis entry point compiling all modules."""
    num_latex = poly_to_latex(num)
    den_latex = poly_to_latex(den)
    tf_latex = f"H(s) = \\frac{{{num_latex}}}{{{den_latex}}}"
    char_eq_latex = f"{den_latex} = 0"
    
    input_signal_clean = input_signal.lower()
    if input_signal_clean == "impulse":
        input_latex = "X(s) = 1"
        output_latex = f"Y(s) = \\frac{{{num_latex}}}{{{den_latex}}}"
    elif input_signal_clean == "ramp":
        input_latex = "X(s) = \\frac{1}{s^2}"
        output_latex = f"Y(s) = \\frac{{{num_latex}}}{{s^2 \\left({den_latex}\\right)}}"
    else:
        input_latex = "X(s) = \\frac{1}{s}"
        output_latex = f"Y(s) = \\frac{{{num_latex}}}{{s \\left({den_latex}\\right)}}"

    pz_data = compute_poles_zeros(num, den)
    routh_matrix, sign_changes, stability_verdict = compute_routh_array(den)
    params = extract_system_parameters(num, den)
    time_sim = simulate_time_response(num, den, input_signal_clean)
    bode_data = compute_bode_data(num, den)
    
    return {
        "num": num,
        "den": den,
        "input_signal": input_signal_clean,
        "latex": {
            "num_str": num_latex,
            "den_str": den_latex,
            "tf_str": tf_latex,
            "char_eq_str": char_eq_latex,
            "input_str": input_latex,
            "output_str": output_latex
        },
        "poles_zeros": pz_data,
        "routh": {
            "matrix": routh_matrix,
            "sign_changes": sign_changes,
            "verdict": stability_verdict
        },
        "parameters": params,
        "time_response": time_sim,
        "bode": bode_data
    }
