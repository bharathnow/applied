<div align="center">

# 📈 Control Systems & Mathematical Analysis Workbench

**An interactive, full-stack simulation workbench for dynamic systems modeling, transfer function analysis, Bode/Nyquist stability plots, and LaTeX mathematical rendering.**

[![Next.js](https://img.shields.io/badge/Frontend-Next.js_16-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Plotly](https://img.shields.io/badge/Visualization-Plotly.js-3F4F75?style=flat&logo=plotly&logoColor=white)](https://plotly.com/)
[![KaTeX](https://img.shields.io/badge/Math-KaTeX-319795?style=flat&logo=latex&logoColor=white)](https://katex.org/)
[![SciPy](https://img.shields.io/badge/Computation-SciPy_%26_Python--Control-8CAAE6?style=flat&logo=scipy&logoColor=white)](https://scipy.org/)

</div>

---

## 📌 Features

- 📐 **Dynamic Transfer Function Modeling**: Define continuous & discrete transfer functions with real-time pole-zero mapping.
- 📊 **Interactive Frequency & Time Response**: Live interactive step response, impulse response, Bode plots, and Nyquist diagrams powered by Plotly.js.
- 🧮 **LaTeX Equation Rendering**: In-browser dynamic KaTeX mathematical typesetting for symbolic state-space matrices and Laplace transforms.
- ⚡ **High-Performance Computation**: Python scientific backend utilizing `scipy.signal` and `python-control` exposed via FastAPI REST endpoints.
- 🎨 **Modern Interface**: Built on Next.js 16, React 19, Lucide icons, and Tailwind CSS.

---

## 🏛️ System Architecture

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Plotly.js, KaTeX
- **Backend**: FastAPI, Uvicorn, SciPy, NumPy, Python-Control, Pydantic, ReportLab

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the interactive workbench.

---

<div align="center">
  <sub>Developed by <a href="https://github.com/bharathnow">Mothukuri Bharath</a></sub>
</div>