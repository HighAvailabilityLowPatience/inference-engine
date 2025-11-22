import requests
import psutil
import time
import json
from datetime import datetime
from node_agent.utils.network_utils import get_node_id, ping_latency

import os
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config.json")

def load_config():
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)

def collect_metrics():
    return {
        "node": get_node_id(),
        "cpu": psutil.cpu_percent(interval=1),
        "mem": psutil.virtual_memory().percent,
        "net_sent": psutil.net_io_counters().bytes_sent,
        "net_recv": psutil.net_io_counters().bytes_recv,
        "ping_ms": ping_latency("8.8.8.8"),
        "timestamp": datetime.utcnow().isoformat()
    }

def post(endpoint, data):
    try:
        r = requests.post(endpoint, json=data, timeout=5)
        print(f"[{datetime.utcnow().isoformat()}] POST {endpoint} {r.status_code}")
        return r.json()
    except Exception as e:
        print(f"[Error] Failed POST {endpoint}: {e}")
        return None

def health_check(api_url):
    try:
        r = requests.get(f"{api_url}/health", timeout=5)
        print(f"[Health] {r.status_code}")
    except Exception as e:
        print(f"[Error] Health check failed: {e}")

def main():
    cfg = load_config()
    api_url = cfg.get("api_url")
    interval = cfg.get("interval", 60)

    while True:
        metrics = collect_metrics()
        payload = {"input": f"Node {metrics['node']} metrics", "telemetry": metrics}
        post(f"{api_url}/predict", payload)
        health_check(api_url)
        time.sleep(interval)

if __name__ == "__main__":
    main()
