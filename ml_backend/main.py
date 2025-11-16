from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from transformers import pipeline
from prometheus_client import Counter, Histogram, generate_latest
import time
import os

from utils import db_utils, network

app = FastAPI(title="Telemetry Inference API")

# ------------------------------
# MODEL LOADING (REAL + OPTIONAL FAKE MODE)
# ------------------------------
USE_FAKE = os.getenv("USE_FAKE", "false").lower() == "true"

MODEL_PATH = "model/distilbert-base-uncased-finetuned-sst-2-english"

classifier = None
if not USE_FAKE:
    try:
        classifier = pipeline("sentiment-analysis", model=MODEL_PATH)
        print(f"[MODEL] Loaded real model from: {MODEL_PATH}")
    except Exception as e:
        print(f"[MODEL ERROR] Failed to load real model: {e}")
        USE_FAKE = True
        print("[MODEL] Falling back to fake inference mode.")


def fake_sentiment_predict(text: str):
    """Simple stub model when USE_FAKE=true or real model fails."""
    if any(w in text.lower() for w in ["fail", "down", "error"]):
        return {"label": "NEGATIVE", "score": 0.9}
    return {"label": "POSITIVE", "score": 0.9}


def real_predict(text: str):
    """Run inference through HuggingFace pipeline."""
    result = classifier(text)[0]  # HF returns list
    return {
        "label": result["label"],
        "score": float(result["score"])
    }


# ------------------------------
# PROMETHEUS METRICS
# ------------------------------
REQUEST_COUNT = Counter("api_requests_total", "Total requests", ["endpoint"])
REQUEST_LATENCY = Histogram("api_request_latency_seconds", "Latency", ["endpoint"])


# ------------------------------
# DATABASE
# ------------------------------
DB_PATH = "db/events.db"
db_utils.init_db(DB_PATH)


# ------------------------------
# INPUT PAYLOAD
# ------------------------------
class InputPayload(BaseModel):
    input: str
    telemetry: Optional[Dict] = None


# ------------------------------
# /PREDICT
# ------------------------------
@app.post("/predict")
def predict(payload: InputPayload):
    start_time = time.time()
    REQUEST_COUNT.labels("/predict").inc()

    try:
        if USE_FAKE:
            result = fake_sentiment_predict(payload.input)
        else:
            result = real_predict(payload.input)

        # Store event + telemetry
        db_utils.log_event(
            DB_PATH,
            payload.input,
            result,
            telemetry=payload.telemetry
        )

        # API response
        response = {
            "sentiment": result["label"],
            "confidence": round(result["score"], 4),
            "severity": "high" if result["label"] == "NEGATIVE" and result["score"] > 0.8 else "low"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        REQUEST_LATENCY.labels("/predict").observe(time.time() - start_time)

    return response


# ------------------------------
# /events
# ------------------------------
@app.get("/events")
def get_events(limit: int = 10):
    REQUEST_COUNT.labels("/events").inc()
    return db_utils.fetch_events(DB_PATH, limit)


# ------------------------------
# /aggregate
# ------------------------------
@app.get("/aggregate")
def aggregate_sentiment():
    REQUEST_COUNT.labels("/aggregate").inc()
    return db_utils.aggregate_sentiment(DB_PATH)


# ------------------------------
# /control
# ------------------------------
@app.post("/control")
def control(action: str):
    REQUEST_COUNT.labels("/control").inc()
    if action.lower() == "start":
        return {"status": "inference system online"}
    elif action.lower() == "stop":
        return {"status": "inference system halted"}
    else:
        raise HTTPException(status_code=400, detail="Invalid action")


# ------------------------------
# /metrics
# ------------------------------
@app.get("/metrics")
def metrics_endpoint():
    return generate_latest()


# ------------------------------
# /health
# ------------------------------
@app.get("/health")
def health_check():
    REQUEST_COUNT.labels("/health").inc()
    try:
        db_utils.health_check(DB_PATH)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB error: {e}")


# ------------------------------
# /node-health
# ------------------------------
@app.get("/node-health")
def node_health():
    REQUEST_COUNT.labels("/node-health").inc()
    return network.test_latency_and_throughput()
