from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline
from prometheus_client import Counter, Histogram, generate_latest
import sqlite3, time
from utils import db_utils, metrics, network

app = FastAPI(title="Telemetry Inference API")

# sentiment analysis model setup, can be replaced with any suitable model
MODEL_PATH = "models/distilbert-base-uncased-finetuned-sst-2-english"

sentiment_model = pipeline(
    "sentiment-analysis",
    model=MODEL_PATH,
    tokenizer=MODEL_PATH,
    device=-1  # CPU only
)
# Prometheus metrics
REQUEST_COUNT = Counter("api_requests_total", "Total requests", ["endpoint"])
REQUEST_LATENCY = Histogram("api_request_latency_seconds", "Latency", ["endpoint"])

DB_PATH = "db/events.db"
db_utils.init_db(DB_PATH)

class InputPayload(BaseModel):
    input: str

@app.post("/predict")
def predict(payload: InputPayload):
    start_time = time.time()
    REQUEST_COUNT.labels("/predict").inc()
    try:
        result = sentiment_model(payload.input)[0]
        db_utils.log_event(DB_PATH, payload.input, result)
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

@app.get("/events")
def get_events(limit: int = 10):
    REQUEST_COUNT.labels("/events").inc()
    return db_utils.fetch_events(DB_PATH, limit)

@app.get("/aggregate")
def aggregate_sentiment():
    REQUEST_COUNT.labels("/aggregate").inc()
    return db_utils.aggregate_sentiment(DB_PATH)

@app.post("/control")
def control(action: str):
    REQUEST_COUNT.labels("/control").inc()
    if action.lower() == "start":
        return {"status": "inference system online"}
    elif action.lower() == "stop":
        return {"status": "inference system halted"}
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

@app.get("/metrics")
def metrics_endpoint():
    return generate_latest()

@app.get("/system_health")
def system_health():
    return {"status": "ok"}

