1. Architecture Overview

The system has three logical components:

[ Node Agent(s) ]  --->  [ FastAPI ML Backend ]  --->  [ Web UI ]
        (distributed)            (central)              (viewer)

Components
A) FastAPI ML Backend (ml_backend/)

Loads a HuggingFace sentiment model (CPU-only)

Receives:

Natural language input

Structured telemetry from node agents

Converts telemetry → readable text

Runs inference (real model or safe fallback)

Exposes:

POST /predict

GET /health

Runs fully inside Docker

Published as a reusable GHCR container

B) Node Agent (node_agent/)

Lightweight Python telemetry agent

Collects:

CPU %

Memory %

Network sent/received bytes

Ping latency

Node ID

Sends telemetry to the backend at a fixed interval

Designed to run on any node in your network

Configuration via a single config.json file

Can be:

Built from source

Pulled directly as a prebuilt GHCR container

⚠️ Important:
Node agents are not meant to be tightly coupled to the backend or UI. They are intentionally distributed.

C) Web UI (telemetry-watch/)

React + Vite frontend (generated via Lovable)

Displays:

Backend health

Inference results

Talks to the backend via HTTP

Backend URL is injected via environment variable:

VITE_API_URL=http://<backend-host>:8000


Can run:

In Docker

Or standalone for development

2. How to Deploy (Corrected)
Backend + UI (Central Node)

Clone the repo:

git clone https://github.com/HighAvailabilityLowPatience/inference-engine.git
cd inference-engine


Build and run the backend (Docker):

docker build -t ml-backend ./ml_backend
docker run -d -p 8000:8000 ml-backend


 Run the UI:

 via Docker

Node Agent (Any Node in Your Network)

Pull the node agent:

git clone https://github.com/HighAvailabilityLowPatience/inference-engine.git
cd inference-engine/node_agent


Edit config.json:

{
  "node_name": "node-01",
  "api_url": "http://<backend-ip>:8000",
  "interval": 30
}


Run it:

Either directly with Python

Or as a Docker container

That’s it.
No docker-compose required. No service mesh. No magic.

3. What Works Today (MVP)

✔ Backend loads and runs (real HuggingFace model or fallback)
✔ /health endpoint works reliably
✔ /predict accepts telemetry + text
✔ Node Agent builds and sends telemetry
✔ Multiple agents supported
✔ Containers published to GHCR
✔ UI renders and can connect when pointed correctly

This qualifies as a working demo.

4. Known Issues / Limitations 

These are expected and documented:

❌ /predict may return 500 errors with malformed payloads

❌ Node agent lacks retry/backoff logic

❌ UI does not yet handle API failures gracefully

❌ No auth, rate limiting, or persistence guarantees

❌ Not production-ready by design

None of these invalidate the demo.

5. What This  Project Demonstrates:

This project demonstrates:

Systems Architecture and Understanding

Docker image authoring (multiple services)

GHCR container publishing

Distributed agent design

Backend ↔ agent communication

ML model integration

Debugging real container networking issues

EC2 provisioning + AMI reuse

*Knowing when to stop building

That last one matters.

6. Status

Frozen as a Working MVP Demo

This project intentionally stopped after achieving its learning goals.
Further work is optional.

Tech Stack:
FastAPI · Python · Docker · Hugging Face · PyTorch (CPU-only) · React · Vite · GitHub Container Registry

Author: Emmanuel Johnson
