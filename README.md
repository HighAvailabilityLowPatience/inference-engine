 README 
Telemetry Inference Platform (Prototype Demo)

A lightweight distributed monitoring + ML inference system built as a DevOps learning project.
This project includes three components:

 1. Components
A) FastAPI ML Backend (ml_backend/)

Loads a HuggingFace sentiment model

Receives telemetry + natural language input

Converts telemetry → readable text

Runs inference (real or fallback mode)

Provides /predict and /health endpoints

Logs events and metrics

Runs inside Docker with CPU-only PyTorch

B) Node Agent (node_agent/)

Runs as a lightweight Python agent

Collects:

CPU %

Memory %

Network sent/received bytes

Ping latency

Node ID

Sends telemetry to the backend every X seconds

Minimal configuration through a simple config.json

Distributed design (multiple nodes can run simultaneously)

Runs as a Docker container

C) Web UI (telemetry-watch/)

React/Vite interface (generated via Lovable)

Displays backend health

Displays model outputs

Designed to eventually visualize:

Node performance

Model predictions

System state

Connects via environment variable:
VITE_API_URL=http://<backend-ip>:8000

 2. What Works Today
✔ Backend loads and runs with real HuggingFace model
✔ Backend exposes /predict and /health
✔ Backend logs metrics + converts telemetry → natural language
✔ Node Agent builds and runs in Docker
✔ Node Agent sends HTTP POSTs to backend
✔ GHCR containers published and reusable anywhere
✔ Disposable EC2 Dev Environment (AMI) working
✔ UI repo exists and can connect via VITE_API_URL
✔ Entire system builds and runs end-to-end
⚠️ 3. Known Issues / Broken Parts

These are expected for a prototype and do not prevent demo use.

❌ /predict throws 500 errors in some cases

Likely due to:

malformed telemetry

missing fields

occasional empty pipeline outputs

❌ Agent does not handle backend failures gracefully

No retry/backoff logic (future enhancement).

❌ UI not fully connected to backend yet

Needs fetch calls wired to /predict and /health.

❌ No docker-compose file yet

Each service runs manually.

❌ Not production-ready

This is a demo, not a reliable monitoring product.








🧩 5. How To Continue Development

If someone wants to expand this project, they should:

Future Steps:


Add retry logic to node_agent POST requests

Improve telemetry parsing and model fallback


Add Grafana dashboards

Add InfluxDB or TimescaleDB for historical telemetry

Add WebSocket streaming for real-time updates

Switch model to a lighter CPU-friendly variant

Add tests + CI/CD

Convert to microservices with proper observability

🌙 6. Purpose of This Project

This system was built as a DevOps learning project to practice:

Dockerization

Container registries

EC2 deployment

Distributed architecture

HuggingFace model integration

Backend + agent patterns

Logging + monitoring

Multi-service debugging

This project exceeded its original scope, and now serves as a full working demo 

🏁 7. Status: Frozen as Working Demo

This project is intentionally paused after reaching a stable demo state.
Further development is optional and not required for learning progression.

**Tech Stack:** FastAPI · Python · Docker · Hugging Face · PyTorch (CPU-only) · SQLite · Prometheus · Grafana · GitHub Codespaces  
**Author:** Emmanuel Johnson
