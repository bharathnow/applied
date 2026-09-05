import io
import matplotlib
matplotlib.use('Agg') # Non-gui backend
import matplotlib.pyplot as plt
import numpy as np
from typing import Dict, Any, Tuple
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

def create_plots_images(analysis: Dict[str, Any]) -> Tuple[io.BytesIO, io.BytesIO]:
    """Generate Pole-Zero map and Time Response PNG images in memory for ReportLab."""
    plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
    
    # 1. Pole-Zero Plot Image
    fig_pz, ax_pz = plt.subplots(figsize=(5.5, 4.0), dpi=150)
    poles = analysis["poles_zeros"]["poles"]
    zeros = analysis["poles_zeros"]["zeros"]
    
    # Draw axes
    ax_pz.axhline(0, color='black', linewidth=1.2, linestyle='--')
    ax_pz.axvline(0, color='black', linewidth=1.2, linestyle='--')
    
    if poles:
        p_real = [p["real"] for p in poles]
        p_imag = [p["imag"] for p in poles]
        ax_pz.scatter(p_real, p_imag, marker='x', color='red', s=100, linewidths=2.5, label='Poles (×)')
        
    if zeros:
        z_real = [z["real"] for z in zeros]
        z_imag = [z["imag"] for z in zeros]
        ax_pz.scatter(z_real, z_imag, marker='o', facecolors='none', edgecolors='blue', s=100, linewidths=2.5, label='Zeros (○)')
        
    # Shade unstable region (RHP)
    xlims = ax_pz.get_xlim()
    ylims = ax_pz.get_ylim()
    max_x = max(2.0, max([abs(p["real"]) for p in poles] + [1.0]))
    max_y = max(2.0, max([abs(p["imag"]) for p in poles] + [1.0]))
    
    ax_pz.set_xlim(-max_x * 1.2, max_x * 1.2)
    ax_pz.set_ylim(-max_y * 1.2, max_y * 1.2)
    
    ax_pz.axvspan(0, max_x * 1.5, color='red', alpha=0.08, label='Unstable Region (RHP)')
    ax_pz.axvspan(-max_x * 1.5, 0, color='green', alpha=0.05, label='Stable Region (LHP)')
    
    ax_pz.set_title('S-Plane Pole-Zero Map', fontsize=12, fontweight='bold', pad=10)
    ax_pz.set_xlabel(r'Real Axis $\sigma$ (sec$^{-1}$)', fontsize=10)
    ax_pz.set_ylabel(r'Imaginary Axis $j\omega$ (rad/sec)', fontsize=10)
    ax_pz.legend(loc='upper right', fontsize=8)
    ax_pz.grid(True, linestyle=':', alpha=0.6)
    plt.tight_layout()
    
    buf_pz = io.BytesIO()
    fig_pz.savefig(buf_pz, format='png')
    buf_pz.seek(0)
    plt.close(fig_pz)

    # 2. Step Response Plot Image
    fig_resp, ax_resp = plt.subplots(figsize=(5.5, 3.8), dpi=150)
    t = analysis["time_response"]["time"]
    y = analysis["time_response"]["response"]
    u = analysis["time_response"]["input"]
    metrics = analysis["time_response"]["metrics"]
    input_signal = analysis["time_response"]["input_signal"].capitalize()
    
    ax_resp.plot(t, y, color='#1E40AF', linewidth=2.0, label=f'System Output y(t)')
    if analysis["time_response"]["input_signal"] in ["step", "ramp"]:
        ax_resp.plot(t, u, color='#9CA3AF', linestyle='--', linewidth=1.2, label=f'Input Signal u(t)')
        
    # Annotate metrics for step response
    if analysis["time_response"]["input_signal"] == "step":
        y_final = metrics["final_value"]
        if abs(y_final) > 1e-5:
            # 2% settling band
            ax_resp.axhline(y_final * 1.02, color='#059669', linestyle=':', linewidth=1.0, alpha=0.7)
            ax_resp.axhline(y_final * 0.98, color='#059669', linestyle=':', linewidth=1.0, alpha=0.7, label='±2% Settling Band')
            
        # Peak point
        if metrics["overshoot_percent"] > 0:
            tp = metrics["peak_time"]
            yp = metrics["peak_value"]
            ax_resp.plot(tp, yp, 'ro', markersize=6)
            ax_resp.annotate(f'Peak ({yp:.2f} at {tp:.2f}s)\nMp = {metrics["overshoot_percent"]}%', 
                             xy=(tp, yp), xytext=(tp + 0.5, yp * 1.05),
                             arrowprops=dict(facecolor='red', shrink=0.05, width=1, headwidth=4),
                             fontsize=8, fontweight='bold', color='#991B1B')

    ax_resp.set_title(f'Time Response ({input_signal} Input)', fontsize=12, fontweight='bold', pad=10)
    ax_resp.set_xlabel('Time t (seconds)', fontsize=10)
    ax_resp.set_ylabel('Amplitude', fontsize=10)
    ax_resp.legend(loc='lower right', fontsize=8)
    ax_resp.grid(True, linestyle=':', alpha=0.6)
    plt.tight_layout()
    
    buf_resp = io.BytesIO()
    fig_resp.savefig(buf_resp, format='png')
    buf_resp.seek(0)
    plt.close(fig_resp)
    
    return buf_pz, buf_resp


def generate_pdf_report(analysis: Dict[str, Any]) -> bytes:
    """Generate complete PDF document report and return bytes."""
    buf_pz, buf_resp = create_plots_images(analysis)
    
    pdf_buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1E3A8A'),
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        spaceAfter=12
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#4B5563'),
        alignment=TA_CENTER,
        fontName='Helvetica-Oblique',
        spaceAfter=20
    )
    
    h2_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#1E40AF'),
        fontName='Helvetica-Bold',
        spaceBefore=14,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#1F2937'),
        alignment=TA_JUSTIFY,
        spaceAfter=6
    )
    
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=11,
        alignment=TA_CENTER
    )

    story = []
    
    # 1. Header Banner & Title
    story.append(Paragraph("Control System Stability Analysis using Laplace Transform Techniques", title_style))
    story.append(Paragraph("Comprehensive Automated Analytical & Simulation Report", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#1E3A8A'), spaceAfter=15))
    
    # Executive Summary Card
    verdict = analysis["routh"]["verdict"]
    verdict_color = "#059669" if verdict == "Stable" else ("#D97706" if verdict == "Marginally Stable" else "#DC2626")
    
    summary_html = f"""
    <b>System Stability Verdict:</b> <font color="{verdict_color}"><b>{verdict.upper()}</b></font> &nbsp;|&nbsp; 
    <b>Order:</b> {analysis['parameters']['order']} &nbsp;|&nbsp; 
    <b>Input Signal:</b> {analysis['input_signal'].capitalize()}<br/>
    <b>Transfer Function:</b> {analysis['latex']['tf_str']}
    """
    story.append(Paragraph(summary_html, ParagraphStyle('Summary', parent=body_style, fontSize=10.5, leading=15, alignment=TA_CENTER)))
    story.append(Spacer(1, 10))
    
    # Module 1: Fundamentals
    story.append(Paragraph("Module 1: Fundamentals & Laplace Transforms", h2_style))
    m1_text = """
    In control system engineering, the Laplace transform converts time-domain differential equations into algebraic 
    s-plane equations. The system Transfer Function <i>H(s)</i> represents the ratio of Laplace transformed output <i>Y(s)</i> 
    to input <i>X(s)</i> assuming zero initial conditions.
    """
    story.append(Paragraph(m1_text, body_style))
    
    m1_table_data = [
        [Paragraph("<b>Component</b>", table_cell), Paragraph("<b>Mathematical Expression</b>", table_cell)],
        [Paragraph("Chosen Input Signal X(s)", table_cell), Paragraph(f"{analysis['latex']['input_str']}", table_cell)],
        [Paragraph("Transfer Function H(s)", table_cell), Paragraph(f"{analysis['latex']['tf_str']}", table_cell)],
        [Paragraph("Characteristic Equation", table_cell), Paragraph(f"{analysis['latex']['char_eq_str']}", table_cell)],
        [Paragraph("System Output Y(s)", table_cell), Paragraph(f"{analysis['latex']['output_str']}", table_cell)]
    ]
    t_m1 = Table(m1_table_data, colWidths=[180, 340])
    t_m1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EFF6FF')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#93C5FD')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_m1)
    story.append(Spacer(1, 12))

    # Module 2: Stability Analysis
    story.append(Paragraph("Module 2: Stability Analysis (S-Plane & Routh-Hurwitz)", h2_style))
    
    # Routh Array Table
    routh_rows = [["Row (s^k)"] + [f"Col {j+1}" for j in range(len(analysis["routh"]["matrix"][0]))]]
    n = len(analysis["routh"]["matrix"]) - 1
    for i, r in enumerate(analysis["routh"]["matrix"]):
        p_label = f"s^{n - i}"
        routh_rows.append([p_label] + [str(v) for v in r])
        
    routh_table_cells = [[Paragraph(f"<b>{cell}</b>" if idx==0 or i==0 else str(cell), table_cell) for idx, cell in enumerate(row)] for i, row in enumerate(routh_rows)]
    t_routh = Table(routh_table_cells, colWidths=[70] + [70]*(len(routh_rows[0])-1))
    t_routh.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F3F4F6')),
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#FEF3C7')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D1D5DB')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))

    # Place Pole-Zero plot & Routh side-by-side or stacked
    img_pz = Image(buf_pz, width=240, height=175)
    
    pz_info = f"""
    <b>Routh-Hurwitz Verdict:</b> {verdict}<br/>
    <b>Sign Changes in 1st Col:</b> {analysis['routh']['sign_changes']}<br/><br/>
    <b>Poles:</b><br/>
    {"<br/>".join([f"• {p['real']:.3f} + {p['imag']:.3f}j" for p in analysis['poles_zeros']['poles']]) or "None"}<br/><br/>
    <b>Zeros:</b><br/>
    {"<br/>".join([f"• {z['real']:.3f} + {z['imag']:.3f}j" for z in analysis['poles_zeros']['zeros']]) or "None (All at ∞)"}
    """
    
    m2_layout = [
        [img_pz, [t_routh, Spacer(1, 8), Paragraph(pz_info, body_style)]]
    ]
    t_m2_layout = Table(m2_layout, colWidths=[250, 270])
    t_m2_layout.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(t_m2_layout)
    story.append(Spacer(1, 12))

    # Module 3: Practical Applications & Time Response
    story.append(Paragraph("Module 3: Time-Domain Performance Specifications", h2_style))
    
    metrics = analysis["time_response"]["metrics"]
    params = analysis["parameters"]
    
    metrics_table_data = [
        [Paragraph("<b>Parameter</b>", table_cell), Paragraph("<b>Value</b>", table_cell), Paragraph("<b>Parameter</b>", table_cell), Paragraph("<b>Value</b>", table_cell)],
        [Paragraph("Natural Freq (ωn)", table_cell), Paragraph(f"{params['wn']} rad/s" if params['wn'] else "N/A", table_cell), Paragraph("Rise Time (tr)", table_cell), Paragraph(f"{metrics['rise_time']} s", table_cell)],
        [Paragraph("Damping Ratio (ζ)", table_cell), Paragraph(f"{params['zeta']}" if params['zeta'] is not None else "N/A", table_cell), Paragraph("Settling Time (ts 2%)", table_cell), Paragraph(f"{metrics['settling_time']} s", table_cell)],
        [Paragraph("Time Constant (τ)", table_cell), Paragraph(f"{params['tau']} s" if params['tau'] else "N/A", table_cell), Paragraph("Peak Overshoot (Mp)", table_cell), Paragraph(f"{metrics['overshoot_percent']} %", table_cell)],
        [Paragraph("Damping Type", table_cell), Paragraph(f"{params['damping_type']}", table_cell), Paragraph("Steady-State Error (ess)", table_cell), Paragraph(f"{metrics['steady_state_error']}", table_cell)]
    ]
    t_metrics = Table(metrics_table_data, colWidths=[130, 130, 130, 130])
    t_metrics.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F3F4F6')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D1D5DB')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    
    img_resp = Image(buf_resp, width=520, height=220)
    story.append(t_metrics)
    story.append(Spacer(1, 8))
    story.append(img_resp)
    story.append(Spacer(1, 10))
    
    # Viva Defense Summary / Methodology
    story.append(Paragraph("Academic Defense & Methodology Notes", h2_style))
    viva_text = r"""
    <b>Key Principles:</b><br/>
    1. <i>BIBO Stability Criterion:</i> A Linear Time-Invariant (LTI) system is Bounded-Input Bounded-Output (BIBO) stable if and only if all system poles lie strictly in the Open Left-Half of the Complex S-Plane ($\Re(p) &lt; 0$).<br/>
    2. <i>Routh-Hurwitz Theorem:</i> Provides a necessary and sufficient condition for stability without explicitly solving for polynomial roots. The number of sign changes in the first column equals the number of poles in the right-half plane.<br/>
    3. <i>Second-Order Transient Response:</i> For underdamped systems ($0 &lt; \zeta &lt; 1$), peak overshoot $M_p = e^{-\pi \zeta / \sqrt{1-\zeta^2}} \times 100\%$ and 2% settling time $t_s \approx \frac{4}{\zeta \omega_n}$.
    """
    story.append(Paragraph(viva_text, body_style))
    
    doc.build(story)
    return pdf_buffer.getvalue()
