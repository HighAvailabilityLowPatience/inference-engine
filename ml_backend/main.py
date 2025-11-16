from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from transformers import pipeline
from prometheus_client import Counter, Histogram, generate_latest
import time
from utils import db_utils, network

app = FastAPI(title="Telemetry Inference API")

# ------------------------------
# MODEL LOADING (unchanged)
# ------------------------------
MODEL_PATH = "models/distilbert-base-uncased-finetuned-sst-2-english"

sentiment_model = pipeline(
    "sentiment-analysis",
    model=MODEL_PATH,
    tokenizer=MODEL_PATH,
    device=-1  # CPU only
)

# ------------------------------
# METRICS
# ------------------------------
REQUEST_COUNT = Counter("api_requests_total", "Total requests", ["endpoint"])
REQUEST_LATENCY = Histogram("api_request_latency_seconds", "Latency", ["endpoint"])

# ------------------------------
# DATABASE
# ------------------------------
DB_PATH = "db/events.db"
db_utils.init_db(DB_PATH)

# ------------------------------
# INPUT PAYLOAD — NOW WITH TELEMETRY
# ------------------------------
class InputPayload(BaseModel):
    input: str
    telemetry: Optional[Dict] = None


# ------------------------------
# /PREDICT — sentiment + telemetry logging
# ------------------------------
@app.post("/predict")
def predict(payload: InputPayload):
    start_time = time.time()
    REQUEST_COUNT.labels("/predict").inc()

    try:
        # Run sentiment inference
        result = sentiment_model(payload.input)[0]

        # Store event + telemetry
        db_utils.log_event(
            DB_PATH,
            payload.input,
            result,
            telemetry=payload.telemetry  # <— NEW
        )

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
# /events — unchanged
# ------------------------------
@app.get("/events")
def get_events(limit: int = 10):
    REQUEST_COUNT.labels("/events").inc()
    return db_utils.fetch_events(DB_PATH, limit)


# ------------------------------
# /aggregate — unchanged
# ------------------------------
@app.get("/aggregate")
def aggregate_sentiment():
    REQUEST_COUNT.labels("/aggregate").inc()
    return db_utils.aggregate_sentiment(DB_PATH)


# ------------------------------
# /control — unchanged
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
# /metrics — unchanged
# ------------------------------
@app.get("/metrics")
def metrics_endpoint():
    return generate_latest()


# ------------------------------
# /health — SIMPLE API CHECK
# ------------------------------
@app.get("/health")
def health_check():
    REQUEST_COUNT.labels("/health").inc()
    try:
        # Cheap DB check — if you don’t have this, replace with a no-op.
        db_utils.health_check(DB_PATH)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB error: {e}")


# ------------------------------
# /node-health — YOUR NETWORK FLAGS FOR UI
# ------------------------------
@app.get("/node-health")
def node_health():
    REQUEST_COUNT.labels("/node-health").inc()
    return network.test_latency_and_throughput()
