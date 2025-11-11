import socket
from ping3 import ping

def get_node_id():
    return socket.gethostname()

def ping_latency(host="8.8.8.8"):
    try:
        latency = ping(host, timeout=1)
        return round(latency * 1000, 2) if latency else None
    except Exception:
        return None
