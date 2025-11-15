import requests
import psutil
import time
import json
from datetime import datetime
from utils.network_utils import get_node_id, ping_latency

CONFIG_PATH = "config.json"


# -------------------------
# Load Configuration
# -------------------------
def load_config():
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)


# -------------------------
# Collect Node Telemetry
# -------------------------
def collect_metrics():
    return {
        "node_id": get_node_id(),
        "cpu_pct": psutil.cpu_percent(interval=1),
        "mem_pct": psutil.virtual_memory().percent,
        "latency_ms": ping_latency("8.8.8.8"),
        "throughput_mbps": 0.0,      # you will add this later
        "packet_loss": 0.0,          # you will add this later
        "timestamp": datetime.utcnow().isoformat()
    }


# -------------------------
# POST Wrapper
# -------------------------
def post(endpoint, data):
    try:
        r = requests.post(endpoint, json=data, timeout=5)
        print(f"[{datetime.utcnow().isoformat()}] POST {endpoint} {r.status_code}")
        return r.json()
    except Exception as e:
        print(f"[Error] Failed POST {endpoint}: {e}")
        return None


# -------------------------
# Backend Heartbeat
# -------------------------
def system_health_check(api_url):
    try:
        r = requests.get(f"{api_url}/system_health", timeout=5)
        print(f"[system_health] {r.status_code}")
        return r.status_code == 200
    except Exception as e:
        print(f"[Error] system_health check failed: {e}")
        return False


# -------------------------
# Main Loop
# -------------------------
def main():
    cfg = load_config()
    api_url = cfg.get("api_url")
    interval = cfg.get("interval", 60)

    print(f"Node Agent started. Reporting to {api_url}")

    while True:

        # 1. Ensure backend is alive
        if not system_health_check(api_url):
            print("[Warning] Backend offline. Retrying...")
            time.sleep(10)
            continue

        # 2. Collect telemetry
        metrics = collect_metrics()

        # 3. POST telemetry
        post(f"{api_url}/node_health", metrics)

        # 4. POST inference (THIS STAYS)
        inference_payload = {
            "input": f"node {metrics['node_id']} status heartbeat",
        }
        post(f"{api_url}/predict", inference_payload)

        # 5. Sleep interval
        time.sleep(interval)


if __name__ == "__main__":
    main()
