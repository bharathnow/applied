from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Union
import sys
import os

# Ensure lib directory is in sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), "lib"))
from control_math import analyze_system, canonical_to_tf
from pdf_generator import generate_pdf_report

app = FastAPI(
    title="Control System Stability Analysis API",
    description="FastAPI backend for Laplace Transform & Stability Analysis",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    mode: str = Field(default="canonical", description="Input mode: 'canonical' or 'coefficients'")
    num: Optional[List[float]] = Field(default=[1.0], description="Numerator polynomial coefficients")
    den: Optional[List[float]] = Field(default=[1.0, 2.0, 4.0], description="Denominator polynomial coefficients")
    K: Optional[float] = Field(default=1.0, description="Canonical Gain K")
    wn: Optional[float] = Field(default=2.0, description="Natural Frequency w_n (rad/s)")
    zeta: Optional[float] = Field(default=0.5, description="Damping Ratio zeta")
    input_signal: str = Field(default="step", description="Input signal: 'step', 'impulse', or 'ramp'")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Control System Stability API"}

@app.post("/api/analyze")
def analyze(request: AnalyzeRequest):
    try:
        if request.mode == "canonical":
            K = request.K if request.K is not None else 1.0
            wn = request.wn if request.wn is not None else 2.0
            zeta = request.zeta if request.zeta is not None else 0.5
            num, den = canonical_to_tf(K, wn, zeta)
        else:
            num = request.num if request.num and len(request.num) > 0 else [1.0]
            den = request.den if request.den and len(request.den) > 0 else [1.0, 2.0, 4.0]
            
        result = analyze_system(num, den, request.input_signal)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/report")
def generate_report(request: AnalyzeRequest):
    try:
        if request.mode == "canonical":
            K = request.K if request.K is not None else 1.0
            wn = request.wn if request.wn is not None else 2.0
            zeta = request.zeta if request.zeta is not None else 0.5
            num, den = canonical_to_tf(K, wn, zeta)
        else:
            num = request.num if request.num and len(request.num) > 0 else [1.0]
            den = request.den if request.den and len(request.den) > 0 else [1.0, 2.0, 4.0]
            
        analysis = analyze_system(num, den, request.input_signal)
        pdf_bytes = generate_pdf_report(analysis)
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="Control_System_Stability_Report.pdf"'}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8090, reload=True)
