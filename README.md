# 🧠 ML-Driven Network Inference Engine (`ml_backend`)

## 📘 Overview
`ml_backend` is a containerized backend service that uses machine learning to interpret telemetry from network nodes and measure overall **network “mood” and health**.  
It’s designed to bring intelligent observability into home labs or production environments — blending **MLOps**, **DevOps**, and **network analytics** in one deployable stack.

Built with **FastAPI**, the backend runs fully **offline** using a lightweight **DistilBERT** model for text-based inference. It logs results to SQLite for persistence and exposes multiple endpoints for prediction, aggregation, metrics, and system health.

The long-term goal is to create a **self-contained, intelligent observability platform** where AI models analyze telemetry in real time, Grafana visualizes backend health, and a **“lovable” front-end dashboard** displays network sentiment and node performance in an intuitive way.

---

## 🧩 Core Features
- **Real-time inference:** Processes node telemetry to assess sentiment and severity.  
- **Offline operation:** CPU-only DistilBERT model — no GPU or cloud access required.  
- **Persistent data:** All predictions stored in SQLite for analytics.  
- **Observability:** Prometheus-compatible metrics for Grafana integration.  
- **Modular design:** Swap Hugging Face models with a single config change.  
- **Containerized workflow:** Lightweight, reproducible builds ready for EC2 or Codespaces.  
- **Lovable UI (coming soon):** A simple dashboard for network health visualization and one-click deployment.

---

## 🔮 Vision
When complete, this project will provide:
- Node agents that feed live telemetry to the inference backend.  
- A user-friendly UI that visualizes system mood, sentiment, and node health.  
- A modular, portable system anyone can deploy to gain **real-time AI-driven network insight** in just a few steps.

---

**Tech Stack:** FastAPI · Python · Docker · Hugging Face · PyTorch (CPU-only) · SQLite · Prometheus · Grafana · GitHub Codespaces  
**Author:** Emmanuel Johnson
